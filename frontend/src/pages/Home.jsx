import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Radio, AlertTriangle, Users, PhoneCall, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoTourist = async () => {
    try {
      await login('tourist@example.com', 'Tourist@123456');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const handleQuickDemoAdmin = async () => {
    try {
      await login('admin@touristsafety.com', 'Admin@123456');
      navigate('/admin');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Top Header */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0d9488, #0f172a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              SafeTourist
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: '#0d9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Safety Monitoring & Incident Response
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn btn-teal"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-teal btn-sm">
                Tourist Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #f0fdfa, #f8fafc)',
          padding: '4.5rem 1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: '#ccfbf1',
              color: '#0f766e',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}
          >
            <Radio size={14} className="pulse-dot pulse-dot-green" />
            Active Incident & Geofence Protection System
          </div>

          <h1
            style={{
              fontSize: '2.75rem',
              lineHeight: 1.2,
              fontWeight: 800,
              color: 'var(--navy-900)',
              marginBottom: '1.25rem',
            }}
          >
            Smart Tourist Safety Monitoring & Instant Response
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Empowering tourists with live GPS safety tracking, automated hazard geofence alerts,
            one-tap SOS emergency broadcasts, and direct integration with municipal emergency responders.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleQuickDemoTourist}
              className="btn btn-teal btn-lg"
              id="demo-tourist-btn"
            >
              <Users size={18} />
              Launch Tourist Dashboard (Demo)
            </button>
            <button
              onClick={handleQuickDemoAdmin}
              className="btn btn-primary btn-lg"
              id="demo-admin-btn"
            >
              <ShieldCheck size={18} />
              Launch Admin Command Center (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', marginBottom: '2.5rem', color: 'var(--navy-900)' }}>
          Core Safety Capabilities
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="card">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>GPS Tracking & Google Maps</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Accurate browser geolocation with real-time updates saved to MongoDB, pinpointing tourist locations on interactive maps.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Automated Geofence Detection</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Distance-based Haversine algorithms automatically detect entry into safe tourist corridors or dangerous restricted hazard perimeters.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Instant SOS Broadcast</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              One-touch emergency beacon with confirmation protection and accidental cancellation support, dispatching live incident records.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <PhoneCall size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Emergency Contacts & Services</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Fast click-to-call dialing for personal emergency contacts, plus nearby hospital and police station discovery with turn-by-turn directions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-light)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <p>Smart Tourist Safety Monitoring & Incident Response System &bull; Built with Node.js, Express, MongoDB & React</p>
      </footer>
    </div>
  );
};

export default Home;
