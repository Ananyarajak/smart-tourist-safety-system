import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import incidentService from '../services/incidentService';
import { AlertTriangle, Clock, MapPin, MessageSquare, XCircle, CheckCircle, RefreshCw } from 'lucide-react';

const IncidentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected incident details modal
  const [activeIncident, setActiveIncident] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = isAdmin
        ? await incidentService.getAllIncidents()
        : await incidentService.getMyIncidents();
      if (res.success) {
        setIncidents(res.incidents);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [isAdmin]);

  const handleCancelAlert = async () => {
    if (!activeIncident) return;
    setIsCancelling(true);

    try {
      const res = await incidentService.cancelSosAlert(
        activeIncident._id,
        cancelReason || 'Cancelled by tourist as accidental press'
      );
      if (res.success) {
        setCancelModalOpen(false);
        setActiveIncident(res.incident);
        fetchIncidents();
      }
    } catch (err) {
      alert('Failed to cancel alert: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Incident Reports & Response Log"
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
                {isAdmin ? 'All Incident Reports' : 'My Emergency Incidents'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                History of emergency SOS broadcasts, hazard breaches, and dispatch response timelines
              </p>
            </div>

            <button
              onClick={fetchIncidents}
              className="btn btn-outline btn-sm"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {incidents.map((inc) => (
              <div
                key={inc._id}
                className="card"
                style={{
                  borderTop: `4px solid ${inc.status === 'Resolved' ? '#10b981' : inc.status === 'Cancelled' ? '#94a3b8' : '#ef4444'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: inc.type.includes('SOS') ? '#dc2626' : 'var(--navy-900)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {inc.type}
                    </span>
                    <StatusBadge status={inc.status} />
                  </div>

                  <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                    {inc.description}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Clock size={14} color="#64748b" />
                      <span>{new Date(inc.createdAt).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={14} color="#64748b" />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}
                      </span>
                    </div>

                    {inc.assignedTo && (
                      <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                        Assigned Unit: {inc.assignedTo}
                      </div>
                    )}
                  </div>

                  {inc.cancelledReason && (
                    <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      <strong>Cancellation Reason:</strong> {inc.cancelledReason}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    marginTop: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {inc.responseNotes?.length || 0} response note(s)
                  </span>

                  <button
                    onClick={() => setActiveIncident(inc)}
                    className="btn btn-outline btn-sm"
                  >
                    <MessageSquare size={14} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {incidents.length === 0 && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <AlertTriangle size={40} color="#0d9488" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                No Incidents on Record
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active emergencies or reported breaches exist for your profile.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Incident Details & Timeline Modal */}
      {activeIncident && (
        <Modal
          isOpen={Boolean(activeIncident)}
          onClose={() => setActiveIncident(null)}
          title={`Incident File: ${activeIncident.type}`}
          footer={
            <>
              {/* If tourist owns this alert and it is still pending/in progress, allow accidental cancellation */}
              {!isAdmin && ['Pending', 'In Progress'].includes(activeIncident.status) && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setCancelModalOpen(true)}
                >
                  Cancel Accidental SOS Alert
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveIncident(null)}
              >
                Close
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ref: <code>{activeIncident._id}</code>
              </span>
              <StatusBadge status={activeIncident.status} />
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>
                {activeIncident.description}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Tourist: <strong>{activeIncident.touristName}</strong> &bull; {activeIncident.touristPhone}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div><strong>GPS Coordinates:</strong> {activeIncident.location.latitude}, {activeIncident.location.longitude}</div>
              <div style={{ marginTop: '2px', color: '#64748b' }}>Location: {activeIncident.location.address}</div>
              <div style={{ marginTop: '2px', color: '#64748b' }}>Timestamp: {new Date(activeIncident.createdAt).toLocaleString()}</div>
            </div>

            {/* Timeline of response notes */}
            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Incident Action & Response Timeline:
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {activeIncident.responseNotes && activeIncident.responseNotes.map((note, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      borderLeft: '3px solid #0d9488',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                      <strong>{note.author}</strong>
                      <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ color: 'var(--navy-900)' }}>{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Accidental SOS Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Accidental SOS Alert"
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setCancelModalOpen(false)}>
              Keep Alert Active
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelAlert}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Please specify why you are cancelling this alert. This information is saved to the municipal incident log.
        </p>
        <div className="form-group">
          <label className="form-label">Cancellation Reason</label>
          <input
            type="text"
            className="form-input"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Accidental click, false alarm..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default IncidentsPage;
