import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Navigation, Cross, Shield } from 'lucide-react';

const MapLegend = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.65rem 1rem',
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
      }}
    >
      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Map Legend:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0284c7' }} />
        <span>Tourist GPS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981', border: '1px solid #059669' }} />
        <span>Safe Zone</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', border: '1px solid #b91c1c' }} />
        <span>Restricted Hazard</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b', border: '1px solid #d97706' }} />
        <span>Caution Zone</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: '#dc2626', fontWeight: 800 }}>+</span>
        <span>Hospitals</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: '#2563eb', fontWeight: 800 }}>★</span>
        <span>Police Stations</span>
      </div>
    </div>
  );
};

export default MapLegend;
