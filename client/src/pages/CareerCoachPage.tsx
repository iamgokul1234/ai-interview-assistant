import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setPlans,
  setCurrentPlan,
  addPlan,
  setLoading,
  setError,
} from '../redux/slices/careerSlice';
import {
  generateCareerPlanAPI,
  getCareerPlansAPI,
} from '../services/careerService';
import { logout } from '../redux/slices/authSlice';
import type {
  ExperienceLevel,
  TargetRole,
} from '../types';

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'fresher',
  '1-2 years',
  '3-5 years',
  '5+ years',
];

const TARGET_ROLES: TargetRole[] = [
  'Frontend',
  'Backend',
  'Fullstack',
  'DevOps',
  'Data Engineer',
  'ML Engineer',
];

function CareerCoachPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { plans, currentPlan, loading, error } = useSelector(
    (state: RootState) => state.career
  );

  const [experience, setExperience] = useState<ExperienceLevel>('fresher');
  const [skillsInput, setSkillsInput] = useState<string>('JavaScript, React, Node.js');
  const [targetRole, setTargetRole] = useState<TargetRole>('Fullstack');
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [targetSalary, setTargetSalary] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'weekly' | 'projects' | 'gaps'>('roadmap');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPlans();
  }, [token]);

  const fetchPlans = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getCareerPlansAPI(token as string);
      dispatch(setPlans(data));
      if (data.length > 0 && !currentPlan) {
        dispatch(setCurrentPlan(data[0]));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load career plans';
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
    if (!skillsInput.trim()) {
      dispatch(setError('Please enter your current skills'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const plan = await generateCareerPlanAPI(token as string, {
        experience,
        currentSkills: skillsArray,
        targetRole,
        targetCompany: targetCompany.trim() || undefined,
        targetSalary: targetSalary.trim() || undefined,
      });
      dispatch(addPlan(plan));
      dispatch(setCurrentPlan(plan));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to generate career plan';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
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
            background: 'rgba(99,102,241,0.2)',
            borderColor: 'rgba(99,102,241,0.4)',
            color: '#818cf8',
          }}
        >
          🧭 Career Coach
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
            <h1 className="dashboard-title">🧭 AI Career Coach</h1>
            <p className="dashboard-subtitle">
              Personalized 6-month roadmap, weekly plan, and skill gap analysis
            </p>
          </div>

          {plans.length > 0 && (
            <select
              className="glass-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={currentPlan?._id || ''}
              onChange={(e) => {
                const found = plans.find((p) => p._id === e.target.value);
                if (found) dispatch(setCurrentPlan(found));
              }}
            >
              {plans.map((p, i) => (
                <option
                  key={p._id}
                  value={p._id}
                  style={{ background: '#1e1b4b', color: 'white' }}
                >
                  Plan #{plans.length - i}: {p.targetRole} (
                  {p.targetCompany || 'General'})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Alert */}
        {error && <div className="glass-alert">⚠️ {error}</div>}

        {/* ── Setup Form ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title">🎯 Configure Career Goal</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Experience Level */}
            <div>
              <label className="glass-label">Current Experience</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor:
                        experience === exp
                          ? '#6366f1'
                          : 'rgba(255,255,255,0.15)',
                      background:
                        experience === exp
                          ? 'rgba(99,102,241,0.25)'
                          : 'rgba(255,255,255,0.05)',
                      color: experience === exp ? '#818cf8' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="glass-label">Target Role</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor:
                        targetRole === role
                          ? '#6366f1'
                          : 'rgba(255,255,255,0.15)',
                      background:
                        targetRole === role
                          ? 'rgba(99,102,241,0.25)'
                          : 'rgba(255,255,255,0.05)',
                      color: targetRole === role ? '#818cf8' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Skills */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="glass-label">Current Skills (comma separated)</label>
              <input
                className="glass-input"
                type="text"
                placeholder="e.g. JavaScript, React, Node.js, SQL"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            {/* Target Company (Optional) */}
            <div>
              <label className="glass-label">Target Company (Optional)</label>
              <input
                className="glass-input"
                type="text"
                placeholder="e.g. Amazon, Google, Zoho"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
              />
            </div>

            {/* Target Salary (Optional) */}
            <div>
              <label className="glass-label">Target Salary Range (Optional)</label>
              <input
                className="glass-input"
                type="text"
                placeholder="e.g. $120,000 / 18 LPA"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-gradient"
              onClick={handleGenerate}
              disabled={loading || !skillsInput.trim()}
              style={{
                width: 'auto',
                minWidth: '220px',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              }}
            >
              {loading ? 'AI Generating Plan...' : 'Generate 6-Month Roadmap 🚀'}
            </button>
          </div>
        </div>

        {/* ── Loading Spinner ── */}
        {loading && (
          <div className="dashboard-center">
            <div
              className="dash-spinner"
              style={{ borderTopColor: '#6366f1' }}
            />
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
              Building your personalized 6-month career roadmap & weekly plan...
            </p>
          </div>
        )}

        {/* ── Active Career Plan Display ── */}
        {!loading && currentPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Badge Strip */}
            <div
              className="dash-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className="career-badge-main">🎯 {currentPlan.targetRole} Roadmap</span>
                {currentPlan.targetCompany && (
                  <span className="career-badge-sub">🏢 {currentPlan.targetCompany}</span>
                )}
                {currentPlan.targetSalary && (
                  <span className="career-badge-sub">💰 {currentPlan.targetSalary}</span>
                )}
                <span className="career-badge-sub">⚡ {currentPlan.experience}</span>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {(
                  [
                    { id: 'roadmap', label: '📅 6-Month Roadmap' },
                    { id: 'weekly', label: '🗓️ Weekly Plan' },
                    { id: 'projects', label: '🚀 Projects & Certs' },
                    { id: 'gaps', label: '🔍 Skill Gaps' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor:
                        activeTab === tab.id
                          ? '#6366f1'
                          : 'rgba(255,255,255,0.12)',
                      background:
                        activeTab === tab.id
                          ? 'rgba(99,102,241,0.25)'
                          : 'rgba(255,255,255,0.04)',
                      color:
                        activeTab === tab.id ? '#818cf8' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: activeTab === tab.id ? '600' : '400',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: 6-Month Timeline Roadmap */}
            {activeTab === 'roadmap' && (
              <div className="career-grid-months">
                {currentPlan.roadmap6Month.map((m) => (
                  <div key={m.month} className="dash-card career-month-card">
                    <div className="career-month-header">
                      <span className="career-month-tag">Month {m.month}</span>
                      <h4 className="career-month-title">{m.title}</h4>
                    </div>
                    <p className="career-month-focus">🎯 <strong>Focus:</strong> {m.focus}</p>
                    <div className="career-deliverables">
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                        Key Deliverables:
                      </span>
                      {m.keyDeliverables.map((del, idx) => (
                        <div key={idx} className="career-deliverable-item">
                          <span>✅</span> {del}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Weekly Plan */}
            {activeTab === 'weekly' && (
              <div className="dash-card">
                <h3 className="dash-card-title">🗓️ 12-Week Intensive Learning Plan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {currentPlan.weeklyLearningPlan.map((w) => (
                    <div key={w.week} className="career-week-card">
                      <div className="career-week-header">
                        <span className="career-week-tag">Week {w.week}</span>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{w.topic}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                        {w.tasks.map((task, idx) => (
                          <div key={idx} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '6px' }}>
                            <span>•</span> <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Projects & Certifications */}
            {activeTab === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="dash-card">
                  <h3 className="dash-card-title">🚀 Recommended Projects</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {currentPlan.recommendedProjects.map((proj, idx) => (
                      <div key={idx} className="resume-project-card">
                        <span style={{ fontSize: '24px' }}>💻</span>
                        <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{proj}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-card">
                  <h3 className="dash-card-title">📜 Recommended Certifications</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {currentPlan.recommendedCertifications.map((cert, idx) => (
                      <span key={idx} className="career-cert-badge">
                        🏆 {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Skill Gap Analysis */}
            {activeTab === 'gaps' && (
              <div className="dash-card">
                <h3 className="dash-card-title">🔍 Skill Gap Analysis & Target Objectives</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentPlan.skillGapAnalysis.map((gap, idx) => (
                    <div key={idx} className="career-gap-item">
                      <span style={{ fontSize: '18px' }}>⚠️</span>
                      <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerCoachPage;
