import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import GoogleMapViewer from '../components/map/GoogleMapViewer';
import MapLegend from '../components/map/MapLegend';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import geofenceService from '../services/geofenceService';
import { Layers, Plus, Trash2, Edit2, MapPin, ShieldCheck, AlertOctagon, History, Eye } from 'lucide-react';

const GeofenceManagerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [geofenceLogs, setGeofenceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFence, setEditingFence] = useState(null);
  const [pickMode, setPickMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Safe',
    centerLat: 37.8044,
    centerLng: -122.4331,
    radius: 500,
    alertMessage: '',
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fenceRes, logsRes] = await Promise.all([
        geofenceService.getGeofences({ activeOnly: 'false' }),
        geofenceService.getGeofenceLogs(),
      ]);
      if (fenceRes.success) setGeofences(fenceRes.geofences);
      if (logsRes.success) setGeofenceLogs(logsRes.logs);
    } catch (err) {
      console.error('Error loading geofence data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingFence(null);
    setFormData({
      name: '',
      description: '',
      type: 'Safe',
      centerLat: 37.8044,
      centerLng: -122.4331,
      radius: 500,
      alertMessage: '',
      isActive: true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (fence) => {
    setEditingFence(fence);
    setFormData({
      name: fence.name,
      description: fence.description || '',
      type: fence.type,
      centerLat: fence.center.latitude,
      centerLng: fence.center.longitude,
      radius: fence.radius,
      alertMessage: fence.alertMessage || '',
      isActive: fence.isActive,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this geofence boundary?')) return;
    try {
      await geofenceService.deleteGeofence(id);
      loadData();
    } catch (err) {
      alert('Failed to delete geofence: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMapCoordPick = ({ lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      centerLat: lat,
      centerLng: lng,
    }));
    setPickMode(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.radius) {
      setErrorMsg('Name and radius are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        center: {
          latitude: Number(formData.centerLat),
          longitude: Number(formData.centerLng),
        },
        radius: Number(formData.radius),
        alertMessage:
          formData.alertMessage ||
          (formData.type === 'Restricted'
            ? `WARNING: You have entered restricted hazard zone ${formData.name}. Return to marked path!`
            : `Welcome to ${formData.name}. Designated safe tourist perimeter.`),
        isActive: formData.isActive,
      };

      if (editingFence) {
        await geofenceService.updateGeofence(editingFence._id, payload);
      } else {
        await geofenceService.createGeofence(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving geofence.');
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
          pageTitle="Geofence Perimeter Command"
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
                Geofence Perimeter Management
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Configure safe tourist corridors, restricted hazard perimeters, and automated breach notifications
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setPickMode(true);
                  setModalOpen(false);
                }}
                className={`btn ${pickMode ? 'btn-danger' : 'btn-outline'}`}
              >
                <MapPin size={16} />
                {pickMode ? 'Click Map to Pick Point...' : 'Pick Point on Map'}
              </button>
              <button onClick={handleOpenCreate} className="btn btn-teal" id="btn-create-geofence">
                <Plus size={16} /> Add New Geofence
              </button>
            </div>
          </div>

          {/* Interactive Geofence Map */}
          <div className="card" style={{ marginBottom: '1.75rem', padding: '1rem' }}>
            <GoogleMapViewer
              center={{ lat: formData.centerLat, lng: formData.centerLng }}
              geofences={geofences}
              onMapClick={handleMapCoordPick}
              interactivePick={pickMode}
              height="480px"
            />
            <div style={{ marginTop: '0.75rem' }}>
              <MapLegend />
            </div>
          </div>

          {/* Configured Geofences Grid */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '1rem' }}>
              Configured Safety & Restricted Zones ({geofences.length})
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {geofences.map((fence) => (
                <div
                  key={fence._id}
                  className="card"
                  style={{
                    borderLeft: `5px solid ${fence.type === 'Restricted' ? '#ef4444' : fence.type === 'Caution' ? '#f59e0b' : '#10b981'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>{fence.name}</h4>
                      <StatusBadge status={fence.type} type="geofence" />
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEdit(fence)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem' }}
                        title="Edit Geofence"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(fence._id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem', color: '#dc2626', borderColor: '#fee2e2' }}
                        title="Delete Geofence"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {fence.description || 'No zone description provided.'}
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      color: 'var(--navy-800)',
                    }}
                  >
                    <div>
                      <strong>Center:</strong> {fence.center.latitude.toFixed(5)}, {fence.center.longitude.toFixed(5)}
                    </div>
                    <div>
                      <strong>Coverage Radius:</strong> {fence.radius} meters
                    </div>
                    {fence.alertMessage && (
                      <div style={{ color: fence.type === 'Restricted' ? '#dc2626' : '#0d9488', marginTop: '2px' }}>
                        <em>"{fence.alertMessage}"</em>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Geofence Breach & Transition Event Logs */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <History size={18} color="#0d9488" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                Recorded Geofence Boundary Transitions (MongoDB Event Logs)
              </h3>
            </div>

            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Tourist</th>
                    <th>Transition Event</th>
                    <th>Geofence Zone</th>
                    <th>Zone Type</th>
                    <th>GPS Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {geofenceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No geofence enter/exit transitions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    geofenceLogs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ fontSize: '0.78rem' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                          {log.tourist?.name || 'Tourist'}
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: log.eventType === 'ENTER' ? '#fee2e2' : '#f1f5f9',
                              color: log.eventType === 'ENTER' ? '#991b1b' : '#334155',
                              fontWeight: 700,
                            }}
                          >
                            {log.eventType}
                          </span>
                        </td>
                        <td>{log.geofenceName}</td>
                        <td>
                          <StatusBadge status={log.geofenceType} type="geofence" />
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                          {log.location?.latitude?.toFixed(4)}, {log.location?.longitude?.toFixed(4)}
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

      {/* Add / Edit Geofence Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFence ? 'Edit Geofence Boundary' : 'Create Geofence Boundary'}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-teal"
              onClick={handleSubmit}
              disabled={isSaving}
              id="btn-save-geofence"
            >
              {isSaving ? 'Saving...' : editingFence ? 'Update Geofence' : 'Create Geofence'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {errorMsg && (
            <div className="form-error" style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Geofence Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Marina Safe Promenade or Ocean Cliff Hazard"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Zone Classification *</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Safe">Safe Zone (Green - Tourist Safe Haven)</option>
              <option value="Restricted">Restricted Zone (Red - Hazard / Dangerous Perimeter)</option>
              <option value="Caution">Caution Zone (Amber - Advisory Vigilance)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Center Latitude *</label>
              <input
                type="number"
                step="0.000001"
                className="form-input"
                value={formData.centerLat}
                onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Center Longitude *</label>
              <input
                type="number"
                step="0.000001"
                className="form-input"
                value={formData.centerLng}
                onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Coverage Radius: {formData.radius} meters</label>
            <input
              type="range"
              min="50"
              max="3000"
              step="25"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#0d9488' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>50m</span>
              <span>1500m</span>
              <span>3000m</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Zone Description</label>
            <input
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Pedestrian boardwalk with regular patrols"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Warning Alert Message</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.alertMessage}
              onChange={(e) => setFormData({ ...formData, alertMessage: e.target.value })}
              placeholder="Message shown to tourists when entering this zone..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GeofenceManagerPage;
