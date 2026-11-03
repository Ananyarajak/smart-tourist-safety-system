import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Shield, Phone, Edit3, RotateCcw, Check, Info } from 'lucide-react';
import {
  getEmergencyHelplines,
  saveEmergencyHelplines,
  resetEmergencyHelplines,
} from '../../constants/emergencyHelplines';
import Modal from '../common/Modal';

const IndianEmergencyServices = () => {
  const [helplines, setHelplines] = useState(getEmergencyHelplines());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingList, setEditingList] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenConfig = () => {
    setEditingList(JSON.parse(JSON.stringify(helplines)));
    setSaveSuccess(false);
    setIsConfigModalOpen(true);
  };

  const handleNumberChange = (id, newNumber) => {
    setEditingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, number: newNumber } : item))
    );
  };

  const handleSaveConfig = () => {
    saveEmergencyHelplines(editingList);
    setHelplines(editingList);
    setSaveSuccess(true);
    setTimeout(() => {
      setIsConfigModalOpen(false);
      setSaveSuccess(false);
    }, 600);
  };

  const handleResetDefaults = () => {
    const defaults = resetEmergencyHelplines();
    setHelplines(defaults);
    setEditingList(defaults);
    setIsConfigModalOpen(false);
  };

  const primary112 = helplines.find((h) => h.isPrimary) || helplines[0];
  const secondaryHelplines = helplines.filter((h) => !h.isPrimary);

  return (
    <div className="card" style={{ border: '2px solid #e2e8f0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', fontWeight: 800 }}>
              Indian National Emergency Helplines
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Official emergency response networks across India (ERSS Dial 112, Medical 108, Police 100)
          </p>
        </div>

        <button
          onClick={handleOpenConfig}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          title="Customize local district emergency helpline numbers"
        >
          <Edit3 size={13} />
          <span>Configure Helplines</span>
        </button>
      </div>

      {/* Primary 112 Emergency Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={32} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em',
                }}
              >
                PRIMARY EMERGENCY HELPLINE (ALL-INDIA)
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '2px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
              DIAL {primary112.number}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#fecaca', margin: 0 }}>
              National Emergency Response Support System (Police, Ambulance, Fire, Disaster Dispatch)
            </p>
          </div>
        </div>

        <a
          href={`tel:${primary112.number}`}
          className="btn btn-lg"
          style={{
            backgroundColor: '#ffffff',
            color: '#991b1b',
            fontWeight: 800,
            fontSize: '0.95rem',
            padding: '0.65rem 1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          title="Direct Dial 112"
        >
          <PhoneCall size={18} />
          <span>Call 112 Now</span>
        </a>
      </div>

      {/* Secondary India Helplines Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {secondaryHelplines.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: item.bg,
                    color: item.color,
                    fontWeight: 800,
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <h4
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--navy-900)',
                  margin: '3px 0 1px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </h4>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.subtitle}
              </p>
            </div>

            <a
              href={`tel:${item.number}`}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: item.color,
                color: item.color,
                padding: '0.35rem 0.65rem',
                flexShrink: 0,
                fontWeight: 700,
              }}
              title={`Call ${item.number}`}
            >
              <Phone size={13} />
              <span>{item.number}</span>
            </a>
          </div>
        ))}
      </div>

      {/* Safety Notice for Development and Testing */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#eff6ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.75rem',
          color: '#1e40af',
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <div>
          <strong>Development & Testing Safeguard:</strong> In-app SOS triggers simulate real-time municipal telemetry within MongoDB. Real emergency services (112 / 108 / 100) are never automatically dialed or alerted during development and simulation testing.
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configure Indian Emergency Helplines"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleResetDefaults}
              style={{ marginRight: 'auto' }}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsConfigModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-teal btn-sm"
              onClick={handleSaveConfig}
            >
              {saveSuccess ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                'Save Helplines'
              )}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Configure emergency helpline numbers for specific state or city districts (e.g. Madhya Pradesh, Maharashtra, Delhi NCR):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
          {editingList.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.6rem 0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>{item.name}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
              </div>
              <div>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                  value={item.number}
                  onChange={(e) => handleNumberChange(item.id, e.target.value)}
                  placeholder="e.g. 112"
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default IndianEmergencyServices;

