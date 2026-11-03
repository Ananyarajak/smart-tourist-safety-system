import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import adminService from '../services/adminService';
import { Users, MapPin, Phone, Shield, Radio, Search, CheckCircle } from 'lucide-react';

const TouristsMonitoringPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourists, setTourists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTourists = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getTourists();
      if (res.success) {
        setTourists(res.tourists);
      }
    } catch (err) {
      console.error('Error fetching tourists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTourists();
  }, []);

  const filtered = tourists.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.nationality && t.nationality.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Tourists Live Monitoring"
        />

        <main className="main-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
                Registered Tourists Registry ({tourists.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Active safety status, emergency contact summaries, and latest GPS telemetry
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by tourist name, email, or nationality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
          </div>

          {/* Tourists Table */}
          <div className="card" style={{ padding: '0.5rem' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Tourist Name & Email</th>
                    <th>Phone Number</th>
                    <th>Nationality</th>
                    <th>GPS Tracking</th>
                    <th>Last Known Location</th>
                    <th>Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No tourists found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t.email}
                          </div>
                        </td>
                        <td>
                          <a href={`tel:${t.phone}`} style={{ color: '#0d9488', fontWeight: 600 }}>
                            {t.phone}
                          </a>
                        </td>
                        <td>{t.nationality || 'International'}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: t.isTrackingActive ? '#ecfdf5' : '#f1f5f9',
                              color: t.isTrackingActive ? '#059669' : '#64748b',
                              border: `1px solid ${t.isTrackingActive ? '#a7f3d0' : '#cbd5e1'}`,
                            }}
                          >
                            <span
                              className={`pulse-dot ${t.isTrackingActive ? 'pulse-dot-green' : ''}`}
                              style={{ width: 8, height: 8, backgroundColor: t.isTrackingActive ? '#10b981' : '#94a3b8' }}
                            />
                            {t.isTrackingActive ? 'Live Active' : 'Idle'}
                          </span>
                        </td>
                        <td>
                          {t.lastKnownLocation?.latitude ? (
                            <div>
                              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                                {t.lastKnownLocation.latitude.toFixed(4)}, {t.lastKnownLocation.longitude.toFixed(4)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {t.lastKnownLocation.address || 'Active GPS'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              No coordinates recorded
                            </span>
                          )}
                        </td>
                        <td>
                          {t.emergencyContactSummary?.name ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <strong style={{ color: 'var(--navy-900)' }}>
                                {t.emergencyContactSummary.name}
                              </strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {t.emergencyContactSummary.relationship}:{' '}
                                <a href={`tel:${t.emergencyContactSummary.phone}`} style={{ color: '#0d9488' }}>
                                  {t.emergencyContactSummary.phone}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Not specified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TouristsMonitoringPage;
