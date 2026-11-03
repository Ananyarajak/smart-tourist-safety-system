import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock, Phone, Globe, Heart, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nationality: 'International',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: 'Family / Spouse',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone } = formData;

    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill in all required account fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        nationality: formData.nationality,
        role: 'tourist',
        emergencyContactSummary: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRel,
        },
      };

      const res = await register(payload);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '580px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              marginBottom: '0.75rem',
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
                Tourist Registration
              </span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--navy-900)' }}>Create your Tourist Safety Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Register to enable GPS tracking, geofence alerts, and emergency contact dispatch
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          {errorMsg && (
            <div className="alert-banner alert-restricted" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem' }}>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maria Gonzalez"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+1-555-0192"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="maria@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password (min 6 chars) *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nationality">Country of Origin / Nationality</label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                className="form-input"
                placeholder="e.g. Canada, Spain, Japan, United States"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>

            {/* Emergency Contact Information Section */}
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <Heart size={16} color="#dc2626" />
                <h4 style={{ fontSize: '0.92rem', color: 'var(--navy-900)' }}>
                  Primary Emergency Contact (Notified during SOS)
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="emergencyContactName">Contact Name</label>
                  <input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Carlos Gonzalez"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emergencyContactPhone">Contact Phone Number</label>
                  <input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    className="form-input"
                    placeholder="+1-555-8833"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emergencyContactRel">Relationship</label>
                <input
                  id="emergencyContactRel"
                  name="emergencyContactRel"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Spouse, Parent, Friend, Tour Guide"
                  value={formData.emergencyContactRel}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isSubmitting}
              id="register-submit-btn"
            >
              {isSubmitting ? 'Creating account...' : 'Complete Tourist Registration'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
