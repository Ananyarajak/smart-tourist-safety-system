import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(res.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <ShieldAlert size={26} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', lineHeight: 1.1 }}>
                SafeTourist
              </span>
              <span style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Secure Access Portal
              </span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>Sign in to your account</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enter your credentials to monitor safety or access control
          </p>
        </div>

        {/* Quick Demo Credentials Helpers */}
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '0.5rem' }}>
            QUICK DEMO ONE-CLICK FILL:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('tourist@example.com', 'Tourist@123456')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Tourist (Alex)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@touristsafety.com', 'Admin@123456')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="card">
          {errorMsg && (
            <div
              className="alert-banner alert-restricted"
              style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', fontSize: '0.85rem' }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={isSubmitting}
              id="login-submit-btn"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            New to SafeTourist?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register as a Tourist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
