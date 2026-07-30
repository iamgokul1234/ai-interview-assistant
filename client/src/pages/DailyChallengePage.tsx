import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setDailyData,
  setSubmissionResult,
  setLoading,
  setError,
} from '../redux/slices/dailySlice';
import {
  getTodayChallengeAPI,
  submitDailyAttemptAPI,
} from '../services/dailyService';
import { logout } from '../redux/slices/authSlice';

function DailyChallengePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { challenge, streak, lastResult, loading, error } = useSelector(
    (state: RootState) => state.daily
  );

  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [codeAnswer, setCodeAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDaily();
  }, [token]);

  useEffect(() => {
    if (challenge?.starterCode) {
      setCodeAnswer(challenge.starterCode);
    }
  }, [challenge]);

  // 24-hour countdown timer to midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDaily = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getTodayChallengeAPI(token as string);
      dispatch(setDailyData(data));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load daily challenge';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    let answer: string | number = '';
    if (challenge.type === 'mcq') {
      if (selectedMcq === null) {
        dispatch(setError('Please select an option first'));
        return;
      }
      answer = selectedMcq;
    } else if (challenge.type === 'short-answer') {
      if (!textAnswer.trim()) {
        dispatch(setError('Please write your answer first'));
        return;
      }
      answer = textAnswer.trim();
    } else if (challenge.type === 'code-snippet') {
      if (!codeAnswer.trim()) {
        dispatch(setError('Please write your code first'));
        return;
      }
      answer = codeAnswer.trim();
    }

    setSubmitting(true);
    dispatch(setError(null));

    try {
      const result = await submitDailyAttemptAPI(token as string, answer);
      dispatch(setSubmissionResult(result));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to evaluate attempt';
      dispatch(setError(msg));
    } finally {
      setSubmitting(false);
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
            background: 'rgba(249,115,22,0.2)',
            borderColor: 'rgba(249,115,22,0.4)',
            color: '#fb923c',
          }}
        >
          🔥 Daily Challenge
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
        <div className="dashboard-header">
          <h1 className="dashboard-title">🔥 Daily Challenge & Streaks</h1>
          <p className="dashboard-subtitle">
            One new AI technical question refreshed every 24 hours. Keep your streak alive!
          </p>
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Streak & Stats Banner ── */}
        <div className="daily-streak-banner">
          <div className="daily-streak-stat">
            <span className="daily-flame-icon">🔥</span>
            <div>
              <div className="daily-streak-number">{streak?.currentStreak || 0}</div>
              <div className="daily-streak-label">Current Streak</div>
            </div>
          </div>

          <div className="daily-streak-stat">
            <span className="daily-flame-icon">🏆</span>
            <div>
              <div className="daily-streak-number">{streak?.longestStreak || 0}</div>
              <div className="daily-streak-label">Longest Streak</div>
            </div>
          </div>

          <div className="daily-streak-stat">
            <span className="daily-flame-icon">✅</span>
            <div>
              <div className="daily-streak-number">{streak?.totalSolved || 0}</div>
              <div className="daily-streak-label">Total Solved</div>
            </div>
          </div>

          <div className="daily-streak-stat" style={{ borderRight: 'none' }}>
            <span className="daily-flame-icon">⏳</span>
            <div>
              <div className="daily-streak-number" style={{ fontFamily: 'monospace', fontSize: '20px' }}>
                {timeLeft || '00:00:00'}
              </div>
              <div className="daily-streak-label">Next Refresh</div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" style={{ borderTopColor: '#f97316' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Fetching today's 24-hour challenge...
            </p>
          </div>
        )}

        {/* ── Challenge Question Card ── */}
        {!loading && challenge && (
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span
                className="table-badge"
                style={{
                  color: '#fb923c',
                  background: 'rgba(249,115,22,0.15)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  textTransform: 'uppercase',
                }}
              >
                {challenge.type === 'mcq'
                  ? 'Multiple Choice'
                  : challenge.type === 'short-answer'
                  ? 'Conceptual Answer'
                  : 'Code Snippet'}
              </span>

              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                Date: {challenge.date}
              </span>
            </div>

            <h2 className="daily-question-text">{challenge.question}</h2>

            {/* MCQ Options */}
            {challenge.type === 'mcq' && challenge.options && (
              <div className="daily-mcq-container">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedMcq(idx)}
                    disabled={Boolean(lastResult || challenge.isSolvedToday)}
                    className={`daily-mcq-option ${selectedMcq === idx ? 'selected' : ''}`}
                  >
                    <span className="daily-mcq-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Short Answer Text Area */}
            {challenge.type === 'short-answer' && (
              <textarea
                className="glass-input"
                rows={5}
                placeholder="Type your explanation or answer here..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={Boolean(lastResult || challenge.isSolvedToday)}
                style={{ resize: 'vertical', marginTop: '12px' }}
              />
            )}

            {/* Code Snippet Editor */}
            {challenge.type === 'code-snippet' && (
              <div className="coding-monaco-wrapper" style={{ marginTop: '12px' }}>
                <Editor
                  height="300px"
                  language="javascript"
                  theme="vs-dark"
                  value={codeAnswer}
                  onChange={(val) => setCodeAnswer(val || '')}
                  options={{
                    readOnly: Boolean(lastResult || challenge.isSolvedToday),
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            {!lastResult && !challenge.isSolvedToday && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  className="btn-gradient"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: 'auto',
                    minWidth: '200px',
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  }}
                >
                  {submitting ? 'AI Evaluating...' : 'Submit Today\'s Answer 🚀'}
                </button>
              </div>
            )}

            {/* Already Solved Banner */}
            {challenge.isSolvedToday && !lastResult && (
              <div className="glass-alert" style={{ background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80', marginTop: '20px' }}>
                ✅ You have already completed today's challenge! Come back tomorrow for a new question and keep your streak alive.
              </div>
            )}
          </div>
        )}

        {/* ── Instant Evaluation Feedback ── */}
        {lastResult && (
          <div
            className="dash-card"
            style={{
              borderColor: lastResult.correct ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)',
              background: lastResult.correct ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{lastResult.correct ? '🎉' : '💡'}</span>
              <div>
                <h3 style={{ color: lastResult.correct ? '#4ade80' : '#f87171', margin: 0, fontSize: '18px' }}>
                  {lastResult.correct ? 'Correct! Streak Kept Alive 🔥' : 'Not quite right! Review the explanation below'}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                  Current Streak: {lastResult.streak.currentStreak} Days | Longest: {lastResult.streak.longestStreak} Days
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '6px' }}>Explanation & Key Takeaways:</h4>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {lastResult.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyChallengePage;
