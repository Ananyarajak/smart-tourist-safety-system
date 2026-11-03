import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import GoogleMapViewer from '../components/map/GoogleMapViewer';
import MapLegend from '../components/map/MapLegend';
import Modal from '../components/common/Modal';
import adminService from '../services/adminService';
import incidentService from '../services/incidentService';
import geofenceService from '../services/geofenceService';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Search,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalTourists: 0,
    activeTrackingTourists: 0,
    totalIncidents: 0,
    activeEmergencyAlerts: 0,
    pendingIncidents: 0,
    inProgressIncidents: 0,
    resolvedIncidents: 0,
    cancelledIncidents: 0,
    totalGeofences: 0,
  });

  const [incidents, setIncidents] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Filter for Incidents Table
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Incident Action Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionStatus, setActionStatus] = useState('In Progress');
  const [actionNote, setActionNote] = useState('');
  const [assignedTo, setAssignedTo] = useState('Emergency Response Team Alpha');
  const [isUpdatingIncident, setIsUpdatingIncident] = useState(false);

  // Fetch admin stats & data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, incidentRes, touristRes, fenceRes] = await Promise.all([
        adminService.getStats(),
        incidentService.getAllIncidents(),
        adminService.getTourists(),
        geofenceService.getGeofences({ activeOnly: 'false' }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (incidentRes.success) setIncidents(incidentRes.incidents);
      if (touristRes.success) setTourists(touristRes.tourists);
      if (fenceRes.success) setGeofences(fenceRes.geofences);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 25 seconds for real-time operations
    const interval = setInterval(fetchData, 25000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleOpenActionModal = (inc) => {
    setSelectedIncident(inc);
    setActionStatus(inc.status);
    setActionNote('');
    setAssignedTo(inc.assignedTo || 'Emergency Response Team Alpha');
  };

  const handleSaveIncidentAction = async () => {
    if (!selectedIncident) return;
    setIsUpdatingIncident(true);

    try {
      const res = await incidentService.updateIncidentStatus(selectedIncident._id, {
        status: actionStatus,
        note: actionNote || `Status updated to ${actionStatus} by ${user?.name || 'Admin'}`,
        assignedTo,
      });

      if (res.success) {
        setSelectedIncident(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating incident:', err);
      alert('Failed to update incident: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingIncident(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = statusFilter === 'All' ? true : inc.status === statusFilter;
    const matchesSearch =
      (inc.touristName && inc.touristName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.type && inc.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.description && inc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Extract active tourist location points for map visualization
  const activeTouristPins = tourists
    .filter((t) => t.isTrackingActive && t.lastKnownLocation && t.lastKnownLocation.latitude)
    .map((t) => ({
      name: t.name,
      type: 'tourist',
      latitude: t.lastKnownLocation.latitude,
      longitude: t.lastKnownLocation.longitude,
      address: t.lastKnownLocation.address || 'Active GPS',
      phone: t.phone,
    }));

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Incident Response Command Center"
        />

        <main className="main-body">
          {/* Header Bar */}
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
                Command Center Operations
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Real-time incident response telemetry, tourist locations, and geofence enforcement
              </p>
            </div>

            <button
              onClick={fetchData}
              className="btn btn-outline btn-sm"
              disabled={isLoading}
              style={{ padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh Telemetry
            </button>
          </div>

          {/* Key Metric Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <StatCard
              title="Registered Tourists"
              value={stats.totalTourists}
              subtitle={`${stats.activeTrackingTourists} currently tracking`}
              icon={Users}
              color="#0d9488"
              bg="#f0fdfa"
            />
            <StatCard
              title="Active Emergency SOS"
              value={stats.activeEmergencyAlerts}
              subtitle={`${stats.pendingIncidents} Pending Dispatch`}
              icon={ShieldAlert}
              color="#dc2626"
              bg="#fef2f2"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressIncidents}
              subtitle="Responders deployed on site"
              icon={Clock}
              color="#2563eb"
              bg="#eff6ff"
            />
            <StatCard
              title="Resolved Incidents"
              value={stats.resolvedIncidents}
              subtitle="Successfully closed cases"
              icon={CheckCircle2}
              color="#059669"
              bg="#ecfdf5"
            />
            <StatCard
              title="Active Geofences"
              value={stats.totalGeofences}
              subtitle="Safe & Restricted zones"
              icon={Layers}
              color="#d97706"
              bg="#fffbeb"
            />
          </div>

          {/* Map Overview Section: Real-time Tourist Monitoring */}
          <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={20} color="#0d9488" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                    Live Tourist Tracking & Geofence Boundaries
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Displaying registered geofences and active tourist tracking coordinates
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href="/admin/geofences" className="btn btn-teal btn-sm">
                  <Layers size={14} /> Manage Geofences
                </a>
              </div>
            </div>

            <GoogleMapViewer
              center={{ lat: 37.8044, lng: -122.4331 }}
              geofences={geofences}
              emergencyServices={activeTouristPins}
              height="440px"
            />

            <div style={{ marginTop: '0.75rem' }}>
              <MapLegend />
            </div>
          </div>

          {/* Emergency Incidents Management Table */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>
                  Incident Response Management
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  View incidents, update resolution status, and append dispatcher notes
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  background: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {['All', 'Pending', 'In Progress', 'Resolved', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                      color: statusFilter === status ? 'var(--navy-900)' : 'var(--text-secondary)',
                      boxShadow: statusFilter === status ? 'var(--shadow-sm)' : 'none',
                      padding: '0.3rem 0.65rem',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Filter */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search incident by tourist name, type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Type & Severity</th>
                    <th>Tourist</th>
                    <th>Contact Phone</th>
                    <th>Location / Coordinates</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No incidents match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr key={inc._id}>
                        <td>
                          <div>
                            <strong style={{ color: inc.type.includes('SOS') ? '#dc2626' : 'var(--navy-900)' }}>
                              {inc.type}
                            </strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Severity: <strong>{inc.severity}</strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {inc.touristName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {inc.tourist?.nationality || 'Tourist'}
                          </div>
                        </td>
                        <td>
                          <a
                            href={`tel:${inc.touristPhone}`}
                            style={{ color: '#0d9488', fontWeight: 600 }}
                          >
                            {inc.touristPhone}
                          </a>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                            {inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {inc.location.address || 'GPS coordinates'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <br />
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={inc.status} />
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenActionModal(inc)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          >
                            <MessageSquare size={13} /> Manage
                          </button>
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

      {/* Incident Status Update & Response Notes Modal */}
      {selectedIncident && (
        <Modal
          isOpen={Boolean(selectedIncident)}
          onClose={() => !isUpdatingIncident && setSelectedIncident(null)}
          title={`Incident Response: ${selectedIncident.type}`}
          footer={
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedIncident(null)}
                disabled={isUpdatingIncident}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-teal"
                onClick={handleSaveIncidentAction}
                disabled={isUpdatingIncident}
                id="btn-save-incident-action"
              >
                {isUpdatingIncident ? 'Saving Changes...' : 'Update Incident Status'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tourist Details */}
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--navy-900)' }}>{selectedIncident.touristName}</strong>
                <span style={{ fontSize: '0.8rem', color: '#0d9488' }}>{selectedIncident.touristPhone}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {selectedIncident.description}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                GPS: {selectedIncident.location.latitude}, {selectedIncident.location.longitude}
              </div>
            </div>

            {/* Change Status */}
            <div className="form-group">
              <label className="form-label">Incident Operational Status</label>
              <select
                className="form-select"
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
              >
                <option value="Pending">Pending Dispatch</option>
                <option value="In Progress">In Progress (Responders Active)</option>
                <option value="Resolved">Resolved (Incident Closed)</option>
                <option value="Cancelled">Cancelled (False Alarm)</option>
              </select>
            </div>

            {/* Assigned Unit */}
            <div className="form-group">
              <label className="form-label">Assigned Dispatch Unit</label>
              <input
                type="text"
                className="form-input"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Unit 4B - Waterfront Tourist Patrol"
              />
            </div>

            {/* Append Response Note */}
            <div className="form-group">
              <label className="form-label">Add Response Dispatch Note</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter actions taken, officer reports, or resolution notes..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>

            {/* Response Notes History Log */}
            {selectedIncident.responseNotes && selectedIncident.responseNotes.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: '0.35rem' }}>
                  Response Dispatch Log:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {selectedIncident.responseNotes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.7rem' }}>
                        <strong>{note.author || 'Dispatcher'}</strong>
                        <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ color: 'var(--navy-900)', marginTop: '2px' }}>{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
