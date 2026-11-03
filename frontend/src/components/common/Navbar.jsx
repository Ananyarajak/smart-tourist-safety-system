import React from 'react';
import { Menu, ShieldAlert, Radio, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar, onTriggerSos, isTrackingActive, pageTitle }) => {
  const { user } = useAuth();
  const isTourist = user && user.role === 'tourist';

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.45rem', display: 'flex' }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
            {pageTitle || 'Tourist Safety Monitoring'}
          </h1>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* GPS Tracking status badge */}
        {isTourist && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: isTrackingActive ? '#ecfdf5' : '#f1f5f9',
              border: `1px solid ${isTrackingActive ? '#a7f3d0' : '#cbd5e1'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isTrackingActive ? '#065f46' : '#64748b',
            }}
          >
            <span
              className={`pulse-dot ${isTrackingActive ? 'pulse-dot-green' : ''}`}
              style={{
                backgroundColor: isTrackingActive ? '#10b981' : '#94a3b8',
              }}
            />
            {isTrackingActive ? 'GPS Live Tracking' : 'GPS Idle'}
          </div>
        )}

        {/* SOS Alert Trigger on header for instant access */}
        {isTourist && onTriggerSos && (
          <button
            onClick={onTriggerSos}
            className="btn btn-sos btn-sm"
            style={{ padding: '0.45rem 0.95rem' }}
          >
            <ShieldAlert size={16} />
            SOS
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
