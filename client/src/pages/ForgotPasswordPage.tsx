import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h1 className="auth-title">AI Interview Assistant</h1>
        <p className="auth-subtitle">Reset your password</p>

        {submitted ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
            <p style={{ color: '#86efac', fontSize: '15px', marginBottom: '8px' }}>
              Reset link sent!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              If an account with that email exists, you'll receive a password reset link shortly. Check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <>
            {error && <div className="glass-alert">{error}</div>}

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="glass-label">Email</label>
                <input
                  type="email"
                  className="glass-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gradient"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          Remember your password?{' '}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;