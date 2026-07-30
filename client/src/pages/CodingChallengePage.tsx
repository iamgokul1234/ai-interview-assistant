import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setChallenges,
  setCurrentChallenge,
  addChallenge,
  updateChallenge,
  setLoading,
  setError,
} from '../redux/slices/codingSlice';
import {
  generateChallengeAPI,
  submitSolutionAPI,
  getChallengesAPI,
} from '../services/codingService';
import { logout } from '../redux/slices/authSlice';
import type {
  InterviewDifficulty,
  CodingLanguage,
} from '../types';

const CODING_TOPICS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack & Queue',
  'Binary Search',
  'Linked List',
  'Trees & Binary Trees',
  'Heap & Priority Queue',
  'Dynamic Programming',
  'Graphs & BFS/DFS',
  'String Manipulation',
  'SQL & Database Queries',
];

const DIFFICULTIES: InterviewDifficulty[] = ['Easy', 'Medium', 'Hard'];
const LANGUAGES: CodingLanguage[] = ['javascript', 'typescript', 'python'];

const difficultyColors: Record<InterviewDifficulty, { text: string; bg: string; border: string }> = {
  Easy: { text: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)' },
  Medium: { text: '#facc15', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)' },
  Hard: { text: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
};

function CodingChallengePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { challenges, currentChallenge, loading, error } = useSelector(
    (state: RootState) => state.coding
  );

  const [topic, setTopic] = useState<string>('Arrays & Hashing');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Easy');
  const [language, setLanguage] = useState<CodingLanguage>('javascript');
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchChallenges();
  }, [token]);

  useEffect(() => {
    if (currentChallenge) {
      setCode(currentChallenge.userCode || currentChallenge.starterCode || '');
      setLanguage(currentChallenge.language || 'javascript');
    }
  }, [currentChallenge]);

  const fetchChallenges = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getChallengesAPI(token as string);
      dispatch(setChallenges(data));
      if (data.length > 0 && !currentChallenge) {
        dispatch(setCurrentChallenge(data[0]));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load challenges';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGenerate = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const challenge = await generateChallengeAPI(token as string, {
        topic,
        difficulty,
        language,
      });
      dispatch(addChallenge(challenge));
      dispatch(setCurrentChallenge(challenge));
      setCode(challenge.starterCode);
      setActiveTab('problem');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to generate coding problem';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSubmitCode = async () => {
    if (!currentChallenge || !code.trim()) return;

    setSubmitting(true);
    dispatch(setError(null));

    try {
      const updated = await submitSolutionAPI(
        token as string,
        currentChallenge._id,
        code
      );
      dispatch(updateChallenge(updated));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to evaluate submission';
      dispatch(setError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode);
    }
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
            background: 'rgba(236,72,153,0.15)',
            borderColor: 'rgba(236,72,153,0.3)',
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
            background: 'rgba(20,184,166,0.2)',
            borderColor: 'rgba(20,184,166,0.4)',
            color: '#2dd4bf',
          }}
        >
          💻 Coding Challenge
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
        <div
          className="dashboard-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1 className="dashboard-title">💻 AI Coding Challenge</h1>
            <p className="dashboard-subtitle">
              Solve LeetCode-style algorithmic challenges with AI code judging & evaluation
            </p>
          </div>

          {challenges.length > 0 && (
            <select
              className="glass-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={currentChallenge?._id || ''}
              onChange={(e) => {
                const found = challenges.find((c) => c._id === e.target.value);
                if (found) dispatch(setCurrentChallenge(found));
              }}
            >
              {challenges.map((c, i) => (
                <option
                  key={c._id}
                  value={c._id}
                  style={{ background: '#1e1b4b', color: 'white' }}
                >
                  #{challenges.length - i}: {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Challenge Generator Form ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title">⚡ Generate Coding Challenge</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Topic Select */}
            <div>
              <label className="glass-label">Select Topic</label>
              <select
                className="glass-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {CODING_TOPICS.map((t) => (
                  <option key={t} value={t} style={{ background: '#1e1b4b', color: 'white' }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="glass-label">Difficulty</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: difficulty === d ? difficultyColors[d].text : 'rgba(255,255,255,0.15)',
                      background: difficulty === d ? difficultyColors[d].bg : 'rgba(255,255,255,0.05)',
                      color: difficulty === d ? difficultyColors[d].text : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: difficulty === d ? '600' : '400',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="glass-label">Language</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: language === lang ? '#2dd4bf' : 'rgba(255,255,255,0.15)',
                      background: language === lang ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.05)',
                      color: language === lang ? '#2dd4bf' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      fontWeight: language === lang ? '600' : '400',
                    }}
                  >
                    {lang === 'javascript' ? 'JS' : lang === 'typescript' ? 'TS' : 'Python'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-gradient"
              onClick={handleGenerate}
              disabled={loading}
              style={{
                width: 'auto',
                minWidth: '200px',
                background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
              }}
            >
              {loading ? 'AI Generating Problem...' : 'Generate New Problem ⚡'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" style={{ borderTopColor: '#2dd4bf' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Synthesizing algorithmic problem statement & test cases...
            </p>
          </div>
        )}

        {/* ── Split-Pane LeetCode Workspace ── */}
        {!loading && currentChallenge && (
          <div className="coding-workspace-grid">
            {/* Left Pane: Problem Description */}
            <div className="dash-card coding-problem-pane">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  className="table-badge"
                  style={{
                    color: difficultyColors[currentChallenge.difficulty].text,
                    background: difficultyColors[currentChallenge.difficulty].bg,
                    border: `1px solid ${difficultyColors[currentChallenge.difficulty].border}`,
                  }}
                >
                  {currentChallenge.difficulty}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  Topic: {currentChallenge.topic}
                </span>
              </div>

              <h2 className="coding-problem-title">{currentChallenge.title}</h2>
              <p className="coding-problem-desc">{currentChallenge.description}</p>

              {/* Examples */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Examples:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentChallenge.examples.map((ex, i) => (
                    <div key={i} className="coding-example-card">
                      <div>
                        <strong>Input:</strong> <code>{ex.input}</code>
                      </div>
                      <div>
                        <strong>Output:</strong> <code>{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontSize: '12px' }}>
                          <em>Explanation:</em> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              {currentChallenge.constraints.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>Constraints:</h4>
                  <ul className="coding-constraints-list">
                    {currentChallenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Pane: Monaco Editor & Evaluation */}
            <div className="dash-card coding-editor-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('problem')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: activeTab === 'problem' ? '#2dd4bf' : 'rgba(255,255,255,0.15)',
                      background: activeTab === 'problem' ? 'rgba(45,212,191,0.2)' : 'transparent',
                      color: activeTab === 'problem' ? '#2dd4bf' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    💻 Code Editor
                  </button>
                  {currentChallenge.evaluation && (
                    <button
                      onClick={() => setActiveTab('solution')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: activeTab === 'solution' ? '#818cf8' : 'rgba(255,255,255,0.15)',
                        background: activeTab === 'solution' ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: activeTab === 'solution' ? '#818cf8' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🌟 Optimal Solution
                    </button>
                  )}
                </div>

                <button
                  onClick={handleResetCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ↺ Reset Starter Code
                </button>
              </div>

              {/* Editor View */}
              {activeTab === 'problem' ? (
                <div className="coding-monaco-wrapper">
                  <Editor
                    height="380px"
                    language={language === 'typescript' ? 'typescript' : language === 'python' ? 'python' : 'javascript'}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              ) : (
                <div className="coding-monaco-wrapper">
                  <Editor
                    height="380px"
                    language={language === 'typescript' ? 'typescript' : language === 'python' ? 'python' : 'javascript'}
                    theme="vs-dark"
                    value={currentChallenge.evaluation?.optimalSolution || '// No optimal solution available'}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  className="btn-gradient"
                  onClick={handleSubmitCode}
                  disabled={submitting || !code.trim()}
                  style={{
                    width: 'auto',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
                  }}
                >
                  {submitting ? 'AI Judge Evaluating...' : 'Submit Solution ▶'}
                </button>
              </div>

              {/* Evaluation Results Box */}
              {currentChallenge.evaluation && (
                <div
                  className="coding-eval-card"
                  style={{
                    borderColor: currentChallenge.evaluation.passed
                      ? 'rgba(74,222,128,0.4)'
                      : 'rgba(248,113,113,0.4)',
                    background: currentChallenge.evaluation.passed
                      ? 'rgba(74,222,128,0.08)'
                      : 'rgba(248,113,113,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {currentChallenge.evaluation.passed ? '✅' : '❌'}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '16px',
                          color: currentChallenge.evaluation.passed ? '#4ade80' : '#f87171',
                        }}
                      >
                        {currentChallenge.evaluation.passed ? 'Accepted' : 'Wrong Answer / Need Improvement'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '18px',
                        color: currentChallenge.evaluation.passed ? '#4ade80' : '#f87171',
                      }}
                    >
                      {currentChallenge.evaluation.score}/100 Score
                    </span>
                  </div>

                  <div className="coding-eval-metrics">
                    <div className="coding-metric-box">
                      <span className="coding-metric-label">Time Complexity</span>
                      <span className="coding-metric-val">{currentChallenge.evaluation.timeComplexity}</span>
                    </div>
                    <div className="coding-metric-box">
                      <span className="coding-metric-label">Space Complexity</span>
                      <span className="coding-metric-val">{currentChallenge.evaluation.spaceComplexity}</span>
                    </div>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                    {currentChallenge.evaluation.detailedFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodingChallengePage;
