import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setProfile,
  setSuccessMessage,
  setLoading,
  setError,
} from '../redux/slices/settingsSlice';
import {
  getUserSettingsAPI,
  updateUserProfileAPI,
  changePasswordAPI,
  exportUserDataAPI,
  deleteUserAccountAPI,
} from '../services/settingsService';
import { logout } from '../redux/slices/authSlice';

function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { profile, loading, error, successMessage } = useSelector(
    (state: RootState) => state.settings
  );

  // Profile & Preferences State
  const [name, setName] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid-Level');
  const [targetCompaniesInput, setTargetCompaniesInput] = useState<string>('');
  const [preferredModel, setPreferredModel] = useState<string>('qwen/qwen3.6-27b');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('native');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [themePreference, setThemePreference] = useState<string>('liquid-glass');

  // Password State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState<string>('');

  // Speech Synth Voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchSettings();

    // Populate browser speech voices
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [token]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTargetRole(profile.settings?.targetRole || 'Full Stack Developer');
      setExperienceLevel(profile.settings?.experienceLevel || 'Mid-Level');
      setTargetCompaniesInput((profile.settings?.targetCompanies || []).join(', '));
      setPreferredModel(profile.settings?.preferredModel || 'qwen/qwen3.6-27b');
      setVoiceEnabled(profile.settings?.voiceEnabled || false);
      setSelectedVoice(profile.settings?.selectedVoice || 'native');
      setSpeechRate(profile.settings?.speechRate || 1.0);
      setThemePreference(profile.settings?.themePreference || 'liquid-glass');
    }
  }, [profile]);

  const fetchSettings = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await getUserSettingsAPI(token as string);
      dispatch(setProfile(data));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load settings';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSuccessMessage(null));

    const companies = targetCompaniesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const updated = await updateUserProfileAPI(token as string, {
        name,
        targetRole,
        experienceLevel,
        targetCompanies: companies,
        preferredModel,
        voiceEnabled,
        selectedVoice,
        speechRate,
        themePreference,
      });
      dispatch(setProfile(updated));
      dispatch(setSuccessMessage('Settings & profile updated successfully! ✨'));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update profile';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(setError('New password and confirm password do not match'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSuccessMessage(null));

    try {
      await changePasswordAPI(token as string, currentPassword, newPassword);
      dispatch(setSuccessMessage('Password changed successfully! 🔑'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to change password';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportData = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await exportUserDataAPI(token as string);
      dispatch(setSuccessMessage('Data exported successfully! Check your downloads folder 📥'));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to export data';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePasswordConfirm) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      await deleteUserAccountAPI(token as string, deletePasswordConfirm);
      dispatch(logout());
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to delete account';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      'Hello! I am your AI Interview Assistant voice coach. Your audio system is functioning perfectly.'
    );
    utterance.rate = speechRate;

    if (selectedVoice !== 'native') {
      const foundVoice = availableVoices.find((v) => v.name === selectedVoice);
      if (foundVoice) utterance.voice = foundVoice;
    }

    window.speechSynthesis.speak(utterance);
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
            background: 'rgba(148,163,184,0.2)',
            borderColor: 'rgba(148,163,184,0.4)',
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
        <div className="dashboard-header">
          <h1 className="dashboard-title">⚙️ Settings & Preferences</h1>
          <p className="dashboard-subtitle">
            Manage your user profile, AI model selection, voice synthesis, theme, data export, and security
          </p>
        </div>

        {/* Feedback Banners */}
        {error && <div className="glass-alert">⚠️ {error}</div>}
        {successMessage && (
          <div className="glass-alert" style={{ background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80' }}>
            {successMessage}
          </div>
        )}

        {/* ── Section 1: Candidate Profile & Target Roles ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title">👤 Candidate Profile & Target Career</h3>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="glass-label">Full Name</label>
                <input
                  className="glass-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="glass-label">Email Address</label>
                <input
                  className="glass-input"
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label className="glass-label">Target Role</label>
                <select
                  className="glass-input"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="Full Stack Developer" style={{ background: '#1e1b4b', color: 'white' }}>Full Stack Developer</option>
                  <option value="Frontend Engineer" style={{ background: '#1e1b4b', color: 'white' }}>Frontend Engineer</option>
                  <option value="Backend Engineer" style={{ background: '#1e1b4b', color: 'white' }}>Backend Engineer</option>
                  <option value="DevOps / SRE Engineer" style={{ background: '#1e1b4b', color: 'white' }}>DevOps / SRE Engineer</option>
                  <option value="Data Engineer / AI Developer" style={{ background: '#1e1b4b', color: 'white' }}>Data Engineer / AI Developer</option>
                  <option value="Mobile App Developer" style={{ background: '#1e1b4b', color: 'white' }}>Mobile App Developer</option>
                </select>
              </div>

              <div>
                <label className="glass-label">Experience Level</label>
                <select
                  className="glass-input"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Junior" style={{ background: '#1e1b4b', color: 'white' }}>Junior (0-2 yrs)</option>
                  <option value="Mid-Level" style={{ background: '#1e1b4b', color: 'white' }}>Mid-Level (2-5 yrs)</option>
                  <option value="Senior" style={{ background: '#1e1b4b', color: 'white' }}>Senior (5-8 yrs)</option>
                  <option value="Lead" style={{ background: '#1e1b4b', color: 'white' }}>Lead / Principal (8+ yrs)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="glass-label">Target Companies (Comma Separated)</label>
              <input
                className="glass-input"
                type="text"
                placeholder="e.g. Google, Amazon, Microsoft, Flipkart, Razorpay"
                value={targetCompaniesInput}
                onChange={(e) => setTargetCompaniesInput(e.target.value)}
              />
            </div>

            {/* ── Section 2: AI Model Selection ── */}
            <div style={{ marginTop: '24px', marginBottom: '20px' }}>
              <label className="glass-label" style={{ marginBottom: '12px', display: 'block' }}>
                🤖 Preferred Groq AI Model Engine:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div
                  onClick={() => setPreferredModel('qwen/qwen3.6-27b')}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: preferredModel === 'qwen/qwen3.6-27b' ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                    background: preferredModel === 'qwen/qwen3.6-27b' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>Groq Qwen 27B (Default)</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    Fast response speed & sharp technical precision for code judging
                  </div>
                </div>

                <div
                  onClick={() => setPreferredModel('llama-3.3-70b-versatile')}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: preferredModel === 'llama-3.3-70b-versatile' ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                    background: preferredModel === 'llama-3.3-70b-versatile' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>Llama 3.3 70B Versatile</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    Deep architectural reasoning & behavioral interview depth
                  </div>
                </div>

                <div
                  onClick={() => setPreferredModel('mixtral-8x7b-32768')}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: preferredModel === 'mixtral-8x7b-32768' ? '#10b981' : 'rgba(255,255,255,0.15)',
                    background: preferredModel === 'mixtral-8x7b-32768' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>Mixtral 8x7B Expert</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    32k token context length for long resume reviews & codebases
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3: Voice & Speech Settings ── */}
            <div style={{ marginTop: '24px', marginBottom: '20px' }}>
              <label className="glass-label" style={{ marginBottom: '12px', display: 'block' }}>
                🔊 Voice Assistant & Audio Speech Synthesis:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="voiceEnabledToggle"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="voiceEnabledToggle" style={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                    Enable Voice Output in Mock Interviews
                  </label>
                </div>

                {availableVoices.length > 0 && (
                  <div>
                    <label className="glass-label">Select Audio Voice</label>
                    <select
                      className="glass-input"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                    >
                      <option value="native" style={{ background: '#1e1b4b', color: 'white' }}>Default System Voice</option>
                      {availableVoices.map((v) => (
                        <option key={v.name} value={v.name} style={{ background: '#1e1b4b', color: 'white' }}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="glass-label">Speech Speed ({speechRate}x)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    🔊 Test Voice Output
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="submit"
                className="btn-gradient"
                disabled={loading}
                style={{
                  width: 'auto',
                  minWidth: '200px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                }}
              >
                {loading ? 'Saving Settings...' : 'Save Settings & Profile 💾'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Section 4: Security & Password Change ── */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <h3 className="dash-card-title">🔑 Security & Password</h3>

          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="glass-label">Current Password</label>
                <input
                  className="glass-input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="glass-label">New Password</label>
                <input
                  className="glass-input"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="glass-label">Confirm New Password</label>
                <input
                  className="glass-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-gradient"
                disabled={loading || !currentPassword || !newPassword}
                style={{
                  width: 'auto',
                  minWidth: '180px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                }}
              >
                Update Password 🔑
              </button>
            </div>
          </form>
        </div>

        {/* ── Section 5: Data Backup & Danger Zone ── */}
        <div className="dash-card">
          <h3 className="dash-card-title">📥 Data Export & Account Danger Zone</h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '15px' }}>Export Complete User Data</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                Download a complete JSON file backup of all your chats, mock interviews, coding challenges, resume reviews, career plans, and bookmarks.
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="btn-gradient"
              disabled={loading}
              style={{
                width: 'auto',
                minWidth: '220px',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              }}
            >
              Export All Data (JSON) 📥
            </button>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: '#f87171', margin: '0 0 4px 0', fontSize: '15px' }}>Danger Zone: Delete Account</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                Permanently delete your account and remove all historical candidate data from MongoDB. This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.4)',
                background: 'rgba(239,68,68,0.15)',
                color: '#f87171',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Delete Account Permanently 🗑️
            </button>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="glass-modal-overlay">
            <div className="glass-modal-card" style={{ maxWidth: '450px' }}>
              <h3 style={{ color: '#f87171', marginTop: 0 }}>⚠️ Confirm Account Deletion</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to delete your account? All your chats, interview scores, and bookmarks will be deleted forever.
              </p>

              <form onSubmit={handleDeleteAccount}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="glass-label">Enter Password to Confirm</label>
                  <input
                    className="glass-input"
                    type="password"
                    required
                    placeholder="Enter password..."
                    value={deletePasswordConfirm}
                    onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#ef4444', border: 'none', color: 'white', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Confirm Permanent Delete 🗑️
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
