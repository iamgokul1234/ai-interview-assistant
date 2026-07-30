import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import { setStats, setLoading, setError } from '../redux/slices/dashboardSlice';
import { getDashboardStatsAPI } from '../services/dashboardService';
import { logout } from '../redux/slices/authSlice';
import type { RecentInterview } from '../types';

function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchStats = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const data = await getDashboardStatsAPI(token);
        dispatch(setStats(data));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load dashboard';
        dispatch(setError(message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchStats();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'var(--text-muted)';
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#facc15';
    return '#f87171';
  };

  const getDifficultyColor = (difficulty: string) => {
    const map: Record<string, { bg: string; border: string; text: string }> = {
      Easy: {
        bg: 'rgba(74,222,128,0.15)',
        border: 'rgba(74,222,128,0.35)',
        text: '#4ade80',
      },
      Medium: {
        bg: 'rgba(250,204,21,0.15)',
        border: 'rgba(250,204,21,0.35)',
        text: '#facc15',
      },
      Hard: {
        bg: 'rgba(248,113,113,0.15)',
        border: 'rgba(248,113,113,0.35)',
        text: '#f87171',
      },
    };
    return map[difficulty] ?? { bg: 'var(--glass-bg)', border: 'var(--glass-border)', text: 'var(--text-secondary)' };
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const maxTopicCount =
    stats && stats.topicBreakdown.length > 0
      ? Math.max(...stats.topicBreakdown.map((t) => t.count))
      : 1;

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
            background: 'rgba(59,130,246,0.25)',
            borderColor: 'rgba(59,130,246,0.5)',
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
          <h1 className="dashboard-title">📊 Progress Dashboard</h1>
          <p className="dashboard-subtitle">
            Your interview performance at a glance
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Loading your stats...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="glass-alert"
            style={{ maxWidth: '560px', margin: '40px auto' }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* No interviews yet */}
        {!loading && !error && stats && stats.totalInterviews === 0 && (
          <div className="dashboard-center" style={{ flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '72px' }}>🎯</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
              No interviews yet!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Take your first mock interview to start tracking your progress.
            </p>
            <button
              className="btn-gradient"
              style={{ maxWidth: '220px', marginTop: '8px' }}
              onClick={() => navigate('/interview')}
            >
              Start First Interview
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && stats.totalInterviews > 0 && (
          <div className="dashboard-content">
            {/* ── Stat Cards ── */}
            <div className="stat-cards-grid">
              {(
                [
                  {
                    icon: '📝',
                    value: stats.totalInterviews,
                    label: 'Total Interviews',
                    color: 'var(--accent-purple)',
                  },
                  {
                    icon: '✅',
                    value: stats.completedInterviews,
                    label: 'Completed',
                    color: '#4ade80',
                  },
                  {
                    icon: '📈',
                    value: stats.averageScore !== null ? `${stats.averageScore}%` : '—',
                    label: 'Average Score',
                    color: getScoreColor(stats.averageScore),
                  },
                  {
                    icon: '🏆',
                    value: stats.bestScore !== null ? `${stats.bestScore}%` : '—',
                    label: 'Best Score',
                    color: getScoreColor(stats.bestScore),
                  },
                  {
                    icon: '🔥',
                    value: stats.currentStreak,
                    label: 'Day Streak',
                    color: '#fb923c',
                  },
                ] as const
              ).map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-card-icon">{card.icon}</div>
                  <div className="stat-card-value" style={{ color: card.color }}>
                    {card.value}
                  </div>
                  <div className="stat-card-label">{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── Bottom Grid: Topic + Difficulty ── */}
            <div className="dashboard-grid-2">
              {/* Topic Breakdown */}
              <div className="dash-card">
                <h3 className="dash-card-title">🎯 Topic Breakdown</h3>
                <div className="topic-list">
                  {stats.topicBreakdown
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((t) => (
                      <div key={t.topic} className="topic-item">
                        <div className="topic-row">
                          <span className="topic-name">{t.topic}</span>
                          <span className="topic-meta">
                            {t.count} interview{t.count !== 1 ? 's' : ''}
                            {t.averageScore > 0 && (
                              <span
                                style={{
                                  color: getScoreColor(t.averageScore),
                                  marginLeft: '6px',
                                }}
                              >
                                · {t.averageScore}% avg
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="topic-bar-bg">
                          <div
                            className="topic-bar-fill"
                            style={{
                              width: `${(t.count / maxTopicCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="dash-card">
                <h3 className="dash-card-title">⚡ Difficulty Breakdown</h3>
                <div className="difficulty-list">
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                    const found = stats.difficultyBreakdown.find(
                      (d) => d.difficulty === level
                    );
                    const colors = getDifficultyColor(level);
                    return (
                      <div
                        key={level}
                        className="difficulty-card"
                        style={{
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <span
                          className="difficulty-level"
                          style={{ color: colors.text }}
                        >
                          {level}
                        </span>
                        <span
                          className="difficulty-count"
                          style={{ color: colors.text }}
                        >
                          {found ? found.count : 0}
                        </span>
                        <span className="difficulty-sub">
                          interview{(found?.count ?? 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Recent Interviews ── */}
            <div className="dash-card">
              <h3 className="dash-card-title">🕐 Recent Interviews</h3>
              <div className="recent-table-wrapper">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInterviews.map((iv: RecentInterview) => {
                      const diff = getDifficultyColor(iv.difficulty);
                      return (
                        <tr key={iv._id}>
                          <td className="table-topic">{iv.topic}</td>
                          <td>
                            <span
                              className="table-badge"
                              style={{
                                color: diff.text,
                                background: diff.bg,
                                border: `1px solid ${diff.border}`,
                              }}
                            >
                              {iv.difficulty}
                            </span>
                          </td>
                          <td>
                            {iv.status === 'completed' ? (
                              <span
                                className="table-badge"
                                style={{
                                  color: '#4ade80',
                                  background: 'rgba(74,222,128,0.12)',
                                  border: '1px solid rgba(74,222,128,0.3)',
                                }}
                              >
                                ✅ Completed
                              </span>
                            ) : (
                              <span
                                className="table-badge"
                                style={{
                                  color: '#facc15',
                                  background: 'rgba(250,204,21,0.12)',
                                  border: '1px solid rgba(250,204,21,0.3)',
                                }}
                              >
                                ⏳ In Progress
                              </span>
                            )}
                          </td>
                          <td
                            className="table-score"
                            style={{ color: getScoreColor(iv.score) }}
                          >
                            {iv.score !== null ? `${iv.score}%` : '—'}
                          </td>
                          <td className="table-date">{formatDate(iv.createdAt)}</td>
                          <td>
                            {iv.status === 'completed' && (
                              <button
                                className="btn-view-report"
                                onClick={() =>
                                  navigate(`/interview/${iv._id}/report`)
                                }
                              >
                                View Report →
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
