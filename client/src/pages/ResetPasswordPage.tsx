import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h1 className="auth-title">AI Interview Assistant</h1>
        <p className="auth-subtitle">Set new password</p>

        {success ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <p style={{ color: '#86efac', fontSize: '15px', marginBottom: '8px' }}>
              Password reset successfully!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              Redirecting to login in 3 seconds...
            </p>
          </div>
        ) : (
          <>
            {error && <div className="glass-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="glass-label">New Password</label>
                <input
                  type="password"
                  className="glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="glass-label">Confirm Password</label>
                <input
                  type="password"
                  className="glass-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gradient"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;