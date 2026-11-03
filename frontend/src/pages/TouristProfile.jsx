import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import touristService from '../services/touristService';
import { User, Phone, Globe, Shield, Save, CheckCircle, Clock } from 'lucide-react';

const TouristProfile = () => {
  const { user, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    nationality: user?.nationality || 'International',
    emergencyName: user?.emergencyContactSummary?.name || '',
    emergencyPhone: user?.emergencyContactSummary?.phone || '',
    emergencyRel: user?.emergencyContactSummary?.relationship || '',
  });

  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        nationality: user.nationality || 'International',
        emergencyName: user.emergencyContactSummary?.name || '',
        emergencyPhone: user.emergencyContactSummary?.phone || '',
        emergencyRel: user.emergencyContactSummary?.relationship || '',
      });
    }

    // Fetch recent location points
    touristService.getLocationHistory(15).then((res) => {
      if (res.success) setHistory(res.history);
    }).catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await touristService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        nationality: formData.nationality,
        emergencyContactSummary: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRel,
        },
      });

      if (res.success) {
        setSuccessMsg('Profile information updated successfully.');
        refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Safety Profile & Settings"
        />

        <main className="main-body">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
              Tourist Safety Profile
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Maintain accurate personal and emergency information for immediate assistance
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '1.5rem',
            }}
          >
            {/* Form */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
                Personal & Contact Details
              </h3>

              {successMsg && (
                <div className="alert-banner alert-safe" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={18} />
                  <div>{successMsg}</div>
                </div>
              )}

              {errorMsg && (
                <div className="alert-banner alert-restricted" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nationality / Country</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', margin: '1.25rem 0 0.75rem 0' }}>
                  Default Emergency Contact Summary
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyRel}
                    onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-teal"
                  style={{ marginTop: '1rem' }}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* GPS Location History Preview */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock size={18} color="#0d9488" />
                <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                  Recent GPS Breadcrumbs (MongoDB Log)
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '440px', overflowY: 'auto' }}>
                {history.map((pt, idx) => (
                  <div
                    key={pt._id || idx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--navy-900)' }}>
                        {pt.currentZone?.name || 'General Open Area'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(pt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {pt.latitude.toFixed(5)}, {pt.longitude.toFixed(5)} &bull; ±{Math.round(pt.accuracy || 10)}m
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No recent location records logged. Enable GPS tracking to record breadcrumbs.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TouristProfile;
