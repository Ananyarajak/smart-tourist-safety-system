import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  MapPin,
  PhoneCall,
  AlertTriangle,
  UserCheck,
  Shield,
  Layers,
  Radio,
  LogOut,
  Users,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon">
              <ShieldAlert size={20} />
            </div>
            <div className="brand-text">
              <h2>SafeTourist</h2>
              <span>{isAdmin ? 'Incident Control' : 'Safety Portal'}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {!isAdmin ? (
            // Tourist Navigation
            <>
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 600 }}>
                Tourist Main
              </div>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard & GPS
              </NavLink>
              <NavLink
                to="/contacts"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PhoneCall size={18} />
                Emergency Contacts
              </NavLink>
              <NavLink
                to="/incidents"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <AlertTriangle size={18} />
                My Incident Reports
              </NavLink>
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <UserCheck size={18} />
                Safety Profile
              </NavLink>
            </>
          ) : (
            // Administrator Navigation
            <>
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 600 }}>
                Operations Command
              </div>
              <NavLink
                to="/admin"
                end
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Command Center
              </NavLink>
              <NavLink
                to="/admin/geofences"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Layers size={18} />
                Geofence Management
              </NavLink>
              <NavLink
                to="/admin/incidents"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <AlertTriangle size={18} />
                Incident Reports
              </NavLink>
              <NavLink
                to="/admin/tourists"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                Tourists Monitoring
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-info-text">
              <div className="user-info-name">{user?.name || 'User'}</div>
              <div className="user-info-role">
                {isAdmin ? 'System Administrator' : 'Verified Tourist'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="btn btn-outline btn-sm"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                padding: '0.45rem',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
