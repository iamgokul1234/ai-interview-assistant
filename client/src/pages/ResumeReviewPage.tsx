import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setReviews,
  setCurrentReview,
  addReview,
  setLoading,
  setError,
} from '../redux/slices/resumeSlice';
import {
  reviewResumeAPI,
  getResumeReviewsAPI,
} from '../services/resumeService';
import { logout } from '../redux/slices/authSlice';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs worker locally via Vite asset bundler
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function ResumeReviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { reviews, currentReview, loading, error } = useSelector(
    (state: RootState) => state.resume
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extracting, setExtracting] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReviews();
  }, [token]);

  const fetchReviews = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getResumeReviewsAPI(token as string);
      dispatch(setReviews(data));
      if (data.length > 0 && !currentReview) {
        dispatch(setCurrentReview(data[0]));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load resume history';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'str' in item) {
            return (item as { str: string }).str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      dispatch(setError('Please select a valid PDF file'));
      return;
    }

    setSelectedFile(file);
    setExtracting(true);
    dispatch(setError(null));

    try {
      const text = await extractTextFromPDF(file);
      if (!text) {
        throw new Error('No readable text found in PDF. Please paste resume text directly.');
      }
      setExtractedText(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract text from PDF';
      dispatch(setError(msg));
    } finally {
      setExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText.trim()) {
      dispatch(setError('Please upload a PDF or paste resume text first'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const review = await reviewResumeAPI(
        token as string,
        extractedText,
        selectedFile?.name || 'Resume_Text.pdf'
      );
      dispatch(addReview(review));
      dispatch(setCurrentReview(review));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze resume';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAtsBadgeColor = (score: number) => {
    if (score >= 80) return { color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)' };
    if (score >= 60) return { color: '#facc15', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)' };
    return { color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' };
  };

  return (
    <div className="chat-container">
      {/* ── Sidebar ── */}
      <div className="sidebar">
        <p className="sidebar-title">AI Interview Assistant</p>

        <button className="btn-new-chat" onClick={() => navigate('/chat')}>
          💬 New Chat
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/interview')}
          style={{
            background: 'rgba(139,92,246,0.15)',
            borderColor: 'rgba(139,92,246,0.3)',
            color: '#a78bfa',
          }}
        >
          🎯 Mock Interview
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(59,130,246,0.15)',
            borderColor: 'rgba(59,130,246,0.3)',
            color: '#60a5fa',
          }}
        >
          📊 Dashboard
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/analytics')}
          style={{
            background: 'rgba(16,185,129,0.15)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: '#34d399',
          }}
        >
          📈 Analytics
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/interview')}
          style={{
            background: 'rgba(245,158,11,0.15)',
            borderColor: 'rgba(245,158,11,0.3)',
            color: '#fbbf24',
          }}
        >
          🏢 Company Interview
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/resume')}
          style={{
            background: 'rgba(236,72,153,0.2)',
            borderColor: 'rgba(236,72,153,0.4)',
            color: '#f472b6',
          }}
        >
          📄 Resume Review
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/career')}
          style={{
            background: 'rgba(99,102,241,0.15)',
            borderColor: 'rgba(99,102,241,0.3)',
            color: '#818cf8',
          }}
        >
          🧭 Career Coach
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/coding')}
          style={{
            background: 'rgba(20,184,166,0.15)',
            borderColor: 'rgba(20,184,166,0.3)',
            color: '#2dd4bf',
          }}
        >
          💻 Coding Challenge
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/daily')}
          style={{
            background: 'rgba(249,115,22,0.15)',
            borderColor: 'rgba(249,115,22,0.3)',
            color: '#fb923c',
          }}
        >
          🔥 Daily Challenge
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/flashcards')}
          style={{
            background: 'rgba(168,85,247,0.15)',
            borderColor: 'rgba(168,85,247,0.3)',
            color: '#c084fc',
          }}
        >
          🃏 Flash Cards
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/bookmarks')}
          style={{
            background: 'rgba(234,179,8,0.15)',
            borderColor: 'rgba(234,179,8,0.3)',
            color: '#fde047',
          }}
        >
          🔖 Bookmarks
        </button>

        <button
          className="btn-new-chat"
          onClick={() => navigate('/settings')}
          style={{
            background: 'rgba(148,163,184,0.15)',
            borderColor: 'rgba(148,163,184,0.3)',
            color: '#cbd5e1',
          }}
        >
          ⚙️ Settings
        </button>

        <div style={{ flex: 1 }} />

        <div className="sidebar-footer">
          <span className="user-name">{user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">📄 AI Resume Review</h1>
            <p className="dashboard-subtitle">
              Instant ATS score, skill gap analysis, and recruiter-level feedback
            </p>
          </div>
          {reviews.length > 0 && (
            <select
              className="glass-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={currentReview?._id || ''}
              onChange={(e) => {
                const found = reviews.find((r) => r._id === e.target.value);
                if (found) dispatch(setCurrentReview(found));
              }}
            >
              {reviews.map((r, i) => (
                <option key={r._id} value={r._id} style={{ background: '#1e1b4b', color: 'white' }}>
                  Review #{reviews.length - i}: {r.fileName || 'Resume'} ({r.atsScore}%)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Upload Section ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="dash-card-title" style={{ margin: 0 }}>
              📤 Analyze Resume
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setInputMode('upload')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: inputMode === 'upload' ? '#ec4899' : 'rgba(255,255,255,0.15)',
                  background: inputMode === 'upload' ? 'rgba(236,72,153,0.2)' : 'transparent',
                  color: inputMode === 'upload' ? '#f472b6' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Upload PDF
              </button>
              <button
                onClick={() => setInputMode('paste')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: inputMode === 'paste' ? '#ec4899' : 'rgba(255,255,255,0.15)',
                  background: inputMode === 'paste' ? 'rgba(236,72,153,0.2)' : 'transparent',
                  color: inputMode === 'paste' ? '#f472b6' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Paste Text
              </button>
            </div>
          </div>

          {inputMode === 'upload' ? (
            <div
              className="resume-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📑</div>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                {selectedFile ? selectedFile.name : 'Click or drop PDF resume here'}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                {extracting
                  ? 'Extracting text from PDF...'
                  : selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB — Text extracted successfully`
                  : 'Supports PDF format up to 5MB'}
              </p>
            </div>
          ) : (
            <textarea
              className="glass-input"
              rows={6}
              placeholder="Paste your full resume text here..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              className="btn-gradient"
              onClick={handleAnalyze}
              disabled={loading || extracting || !extractedText.trim()}
              style={{
                width: 'auto',
                minWidth: '200px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              }}
            >
              {loading ? 'AI Analyzing...' : 'Run AI Resume Review ✨'}
            </button>
          </div>
        </div>

        {/* ── Loading Spinner ── */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" style={{ borderTopColor: '#ec4899' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Analyzing ATS compatibility, grammar, and skill gaps...
            </p>
          </div>
        )}

        {/* ── Active Review Report View ── */}
        {!loading && currentReview && (
          <div className="resume-report-grid">

            {/* ATS Score & Overall Feedback Header */}
            <div className="dash-card resume-score-card">
              <div className="resume-score-dial">
                <div
                  className="resume-score-number"
                  style={{ color: getAtsBadgeColor(currentReview.atsScore).color }}
                >
                  {currentReview.atsScore}
                </div>
                <div className="resume-score-label">ATS Score</div>
              </div>
              <div className="resume-score-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    className="table-badge"
                    style={{
                      color: getAtsBadgeColor(currentReview.atsScore).color,
                      background: getAtsBadgeColor(currentReview.atsScore).bg,
                      border: `1px solid ${getAtsBadgeColor(currentReview.atsScore).border}`,
                    }}
                  >
                    {currentReview.atsScore >= 80 ? 'Excellent ATS Compatibility' : currentReview.atsScore >= 60 ? 'Moderate ATS Match' : 'Needs Optimization'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                    Analyzed on {new Date(currentReview.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="resume-feedback-text">{currentReview.overallFeedback}</p>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="dash-card">
              <h3 className="dash-card-title">⚠️ Missing Key Skills / Keywords</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentReview.missingSkills.length > 0 ? (
                  currentReview.missingSkills.map((skill, idx) => (
                    <span key={idx} className="resume-skill-tag">
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: '#4ade80', fontSize: '14px' }}>✅ Great job! No critical skills missing.</p>
                )}
              </div>
            </div>

            {/* AI Suggested Summary */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="dash-card-title" style={{ margin: 0 }}>💡 Improved ATS Summary</h3>
                <button
                  onClick={() => handleCopySummary(currentReview.improvedSummary)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {copied ? 'Copied! ✅' : '📋 Copy Summary'}
                </button>
              </div>
              <p className="resume-summary-box">{currentReview.improvedSummary}</p>
            </div>

            {/* Grammar & Formatting Feedback */}
            <div className="dash-card">
              <h3 className="dash-card-title">📝 Grammar & Formatting Feedback</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
                {currentReview.grammarFeedback}
              </p>
            </div>

            {/* Project Suggestions */}
            <div className="dash-card">
              <h3 className="dash-card-title">🚀 Recommended Projects to Strengthen Resume</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {currentReview.projectSuggestions.map((proj, idx) => (
                  <div key={idx} className="resume-project-card">
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{proj}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeReviewPage;
