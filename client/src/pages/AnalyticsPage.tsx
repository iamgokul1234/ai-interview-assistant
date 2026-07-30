import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RootState, AppDispatch } from '../redux/store';
import { setData, setLoading, setError } from '../redux/slices/analyticsSlice';
import { getAnalyticsDataAPI } from '../services/analyticsService';
import { logout } from '../redux/slices/authSlice';

// ── Chart Color Config ────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#4ade80',
  Medium: '#facc15',
  Hard: '#f87171',
};

const CHART_GRID_COLOR = 'rgba(255,255,255,0.06)';
const CHART_AXIS_COLOR = 'rgba(255,255,255,0.3)';
const ACCENT_PURPLE = '#8b5cf6';
const ACCENT_BLUE = '#3b82f6';

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null; name: string; color?: string }>;
  label?: string;
}

const GlassTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip-label">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: entry.color ?? '#a78bfa' }}>
          {entry.name}:{' '}
          {entry.value !== null && entry.value !== undefined
            ? `${entry.value}%`
            : 'No data'}
        </p>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: '#a78bfa' }}>
          Avg Score: {entry.value}%
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{entry.name}</p>
      <p className="chart-tooltip-value" style={{ color: entry.color ?? '#a78bfa' }}>
        {entry.value} interviews
      </p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const result = await getAnalyticsDataAPI(token);
        dispatch(setData(result));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load analytics';
        dispatch(setError(message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const hasData =
    data &&
    (data.scoreTrend.length > 0 ||
      data.topicPerformance.length > 0 ||
      data.difficultyDistribution.length > 0);

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
            background: 'rgba(16,185,129,0.2)',
            borderColor: 'rgba(16,185,129,0.4)',
            color: '#34d399',
          }}
        >
          📈 Analytics
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
          <h1 className="dashboard-title">📈 Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Visualise your interview performance trends
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="dashboard-center">
            <div className="dash-spinner" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Crunching your data...
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

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div
            className="dashboard-center"
            style={{ flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ fontSize: '72px' }}>📈</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
              No data yet!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Complete some interviews to see your analytics charts.
            </p>
            <button
              className="btn-gradient"
              style={{ maxWidth: '220px', marginTop: '8px' }}
              onClick={() => navigate('/interview')}
            >
              Start Interview
            </button>
          </div>
        )}

        {/* Charts */}
        {!loading && !error && hasData && data && (
          <div className="analytics-content">

            {/* ── Row 1: Weekly Scores ── */}
            <div className="dash-card">
              <h3 className="dash-card-title">📅 Weekly Score Activity (Last 7 Days)</h3>
              {data.weeklyScores.every((p) => p.averageScore === null) ? (
                <p className="chart-empty-msg">No completed interviews in the last 7 days.</p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.weeklyScores} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                      <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
                      <YAxis domain={[0, 100]} stroke={CHART_AXIS_COLOR} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} unit="%" />
                      <Tooltip content={<GlassTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="averageScore"
                        name="Avg Score"
                        stroke={ACCENT_PURPLE}
                        strokeWidth={2.5}
                        dot={{ fill: ACCENT_PURPLE, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#a78bfa' }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* ── Row 2: Topic + Difficulty side by side ── */}
            <div className="dashboard-grid-2">
              {/* Topic Performance Bar Chart */}
              <div className="dash-card">
                <h3 className="dash-card-title">🎯 Topic Performance</h3>
                {data.topicPerformance.length === 0 ? (
                  <p className="chart-empty-msg">No completed interviews yet.</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={data.topicPerformance}
                        margin={{ top: 8, right: 8, left: -10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                        <XAxis
                          dataKey="topic"
                          stroke={CHART_AXIS_COLOR}
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke={CHART_AXIS_COLOR}
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
                          unit="%"
                        />
                        <Tooltip content={<BarTooltip />} />
                        <Bar dataKey="averageScore" name="Avg Score" radius={[4, 4, 0, 0]}>
                          {data.topicPerformance.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index % 2 === 0 ? ACCENT_PURPLE : ACCENT_BLUE}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Difficulty Distribution Pie Chart */}
              <div className="dash-card">
                <h3 className="dash-card-title">⚡ Difficulty Distribution</h3>
                {data.difficultyDistribution.length === 0 ? (
                  <p className="chart-empty-msg">No interviews yet.</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.difficultyDistribution}
                          dataKey="count"
                          nameKey="difficulty"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={4}
                          label={(props) =>
                            `${props.name ?? ''} ${Math.round((props.percent ?? 0) * 100)}%`
                          }
                          labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        >
                          {data.difficultyDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={DIFFICULTY_COLORS[entry.difficulty] ?? '#8b5cf6'}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          formatter={(value) => (
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* ── Row 3: Score Trend ── */}
            <div className="dash-card">
              <h3 className="dash-card-title">📊 Score Trend Over Time</h3>
              {data.scoreTrend.length < 2 ? (
                <p className="chart-empty-msg">
                  Complete at least 2 interviews to see your score trend.
                </p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={data.scoreTrend}
                      margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                      <XAxis
                        dataKey="date"
                        stroke={CHART_AXIS_COLOR}
                        tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke={CHART_AXIS_COLOR}
                        tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }}
                        unit="%"
                      />
                      <Tooltip content={<GlassTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score"
                        stroke={ACCENT_BLUE}
                        strokeWidth={2.5}
                        dot={{ fill: ACCENT_BLUE, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#60a5fa' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary stats row */}
              {data.scoreTrend.length >= 2 && (
                <div className="trend-summary">
                  <div className="trend-stat">
                    <span className="trend-stat-label">First Score</span>
                    <span className="trend-stat-value" style={{ color: '#60a5fa' }}>
                      {data.scoreTrend[0].score}%
                    </span>
                  </div>
                  <div className="trend-stat">
                    <span className="trend-stat-label">Latest Score</span>
                    <span
                      className="trend-stat-value"
                      style={{
                        color:
                          data.scoreTrend[data.scoreTrend.length - 1].score >=
                          data.scoreTrend[0].score
                            ? '#4ade80'
                            : '#f87171',
                      }}
                    >
                      {data.scoreTrend[data.scoreTrend.length - 1].score}%
                    </span>
                  </div>
                  <div className="trend-stat">
                    <span className="trend-stat-label">Change</span>
                    <span
                      className="trend-stat-value"
                      style={{
                        color:
                          data.scoreTrend[data.scoreTrend.length - 1].score -
                            data.scoreTrend[0].score >=
                          0
                            ? '#4ade80'
                            : '#f87171',
                      }}
                    >
                      {data.scoreTrend[data.scoreTrend.length - 1].score -
                        data.scoreTrend[0].score >= 0
                        ? '+'
                        : ''}
                      {data.scoreTrend[data.scoreTrend.length - 1].score -
                        data.scoreTrend[0].score}
                      %
                    </span>
                  </div>
                  <div className="trend-stat">
                    <span className="trend-stat-label">Total Interviews</span>
                    <span className="trend-stat-value" style={{ color: '#a78bfa' }}>
                      {data.scoreTrend.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
