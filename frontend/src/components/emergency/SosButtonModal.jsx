import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Phone, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import Modal from '../common/Modal';
import incidentService from '../../services/incidentService';
import { formatTime } from '../../utils/dateUtils';

const SosButtonModal = ({ touristLocation, onIncidentCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentType, setIncidentType] = useState('SOS Emergency');
  const [customDescription, setCustomDescription] = useState('');
  const [activeAlert, setActiveAlert] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenModal = () => {
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleConfirmSOS = async () => {
    if (!touristLocation || !touristLocation.latitude) {
      setErrorMsg('Cannot send emergency SOS: GPS coordinates are unavailable. Please ensure location tracking is enabled.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        type: incidentType,
        description: customDescription || `Urgent ${incidentType} initiated by tourist at current GPS coordinates.`,
        latitude: touristLocation.latitude,
        longitude: touristLocation.longitude,
        accuracy: touristLocation.accuracy || 10,
        address: touristLocation.address || 'Active Tourist Location',
        severity: 'Critical',
      };

      const res = await incidentService.createIncident(payload);
      if (res.success) {
        setActiveAlert(res.incident);
        setIsOpen(false);
        if (onIncidentCreated) {
          onIncidentCreated(res.incident);
        }
      }
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
      setErrorMsg(err.response?.data?.message || 'Emergency broadcast failed. Please call local emergency numbers directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeAlert) return;
    setIsCancelling(true);

    try {
      const res = await incidentService.cancelSosAlert(
        activeAlert._id,
        cancelReason || 'Accidental alert pressed by tourist'
      );
      if (res.success) {
        setActiveAlert(null);
        setCancelModalOpen(false);
        setCancelReason('');
        if (onIncidentCreated) {
          onIncidentCreated(null);
        }
      }
    } catch (err) {
      console.error('Error cancelling SOS:', err);
      alert('Failed to cancel alert: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {/* Prominent SOS Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={handleOpenModal}
          className="btn btn-sos btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          id="btn-emergency-sos"
        >
          <ShieldAlert size={24} />
          <span>TRIGGER SOS EMERGENCY</span>
        </button>
        <span style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Dispatches immediate coordinates to Incident Response Team
        </span>
      </div>

      {/* Active Incident Floating Alert Bar if tourist has active alert */}
      {activeAlert && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ color: '#991b1b', fontSize: '0.95rem' }}>
                  ACTIVE SOS BROADCAST IN PROGRESS
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                  Status: <strong>{activeAlert.status}</strong> | Ref #{activeAlert._id.slice(-6).toUpperCase()}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Lat: {activeAlert.location.latitude.toFixed(4)}, Lng: {activeAlert.location.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCancelModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: '#ef4444',
                color: '#b91c1c',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              }}
            >
              Cancel Accidental Alert
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Triggering SOS */}
      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="Confirm Emergency SOS Alert"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmSOS}
              disabled={isSubmitting}
              id="confirm-sos-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Broadcasting...
                </>
              ) : (
                'YES - BROADCAST SOS NOW'
              )}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={28} color="#dc2626" />
            <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
              Are you sure you want to trigger an emergency response? Your real-time location and profile details will be immediately transmitted to the Indian Emergency Response Centre (Dial 112).
            </p>
          </div>

          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#1e40af',
            }}
          >
            <Info size={15} style={{ flexShrink: 0 }} />
            <span>
              <strong>Safe Testing Mode:</strong> During development and evaluation, alerts are logged in the Incident Command Center. Real public emergency lines are not contacted.
            </span>
          </div>

          {errorMsg && (
            <div className="form-error" style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Emergency Category</label>
            <select
              className="form-select"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
            >
              <option value="SOS Emergency">General SOS Emergency (Dial 112)</option>
              <option value="Medical Emergency">Medical Emergency / Injury (Dial 108)</option>
              <option value="Security Hazard">Security Hazard / Threat (Dial 100)</option>
              <option value="Lost / Trapped">Lost in Dangerous Terrain / Forest</option>
              <option value="Other">Other Immediate Assistance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brief Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Slipped off path, need first aid near temple gate, or suspicious activity..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
            <div><strong>Location to transmit:</strong></div>
            {touristLocation && touristLocation.latitude ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '2px' }}>
                Latitude: {touristLocation.latitude.toFixed(6)}, Longitude: {touristLocation.longitude.toFixed(6)}
                <br />
                Accuracy: ±{Math.round(touristLocation.accuracy || 10)}m | Time: {formatTime(new Date(), true)} (IST)
              </div>
            ) : (
              <div style={{ color: '#dc2626' }}>Location coordinates pending GPS lock.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Cancel Accidental SOS Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !isCancelling && setCancelModalOpen(false)}
        title="Cancel Emergency SOS Alert"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Keep Alert Active
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCancelSOS}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            If you triggered this emergency alert accidentally or the situation has safely resolved, please specify a brief reason so dispatch operators can update their log.
          </p>

          <div className="form-group">
            <label className="form-label">Reason for Cancellation</label>
            <input
              type="text"
              className="form-input"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Accidental click, false alarm, safe now..."
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SosButtonModal;
