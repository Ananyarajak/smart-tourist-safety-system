import React, { useState } from 'react';
import { Hospital, Shield, Phone, Navigation, Search } from 'lucide-react';
import { formatIndianPhone, cleanPhoneForDial } from '../../utils/phoneUtils';

const NearbyServices = ({ services = [], userCoords = null }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = services.filter((item) => {
    const matchesType =
      filterType === 'all' ? true : item.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>Nearby Emergency Services</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hospitals, trauma centers, and tourist police stations in your vicinity
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setFilterType('all')}
            className="btn btn-sm"
            style={{
              backgroundColor: filterType === 'all' ? '#ffffff' : 'transparent',
              color: filterType === 'all' ? 'var(--navy-900)' : 'var(--text-secondary)',
              boxShadow: filterType === 'all' ? 'var(--shadow-sm)' : 'none',
              padding: '0.3rem 0.65rem',
            }}
          >
            All ({services.length})
          </button>
          <button
            onClick={() => setFilterType('hospital')}
            className="btn btn-sm"
            style={{
              backgroundColor: filterType === 'hospital' ? '#ffffff' : 'transparent',
              color: filterType === 'hospital' ? '#dc2626' : 'var(--text-secondary)',
              boxShadow: filterType === 'hospital' ? 'var(--shadow-sm)' : 'none',
              padding: '0.3rem 0.65rem',
            }}
          >
            <Hospital size={13} /> Hospitals
          </button>
          <button
            onClick={() => setFilterType('police')}
            className="btn btn-sm"
            style={{
              backgroundColor: filterType === 'police' ? '#ffffff' : 'transparent',
              color: filterType === 'police' ? '#2563eb' : 'var(--text-secondary)',
              boxShadow: filterType === 'police' ? 'var(--shadow-sm)' : 'none',
              padding: '0.3rem 0.65rem',
            }}
          >
            <Shield size={13} /> Police
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search Indian emergency hospital or police station..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.4rem' }}
        />
        <Search
          size={16}
          style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
        />
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No emergency services matched your filter.
          </div>
        ) : (
          filtered.map((item, index) => {
            const isHospital = item.type === 'hospital';
            const mapsDirectionsUrl = userCoords
              ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${item.latitude},${item.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`;

            return (
              <div
                key={index}
                style={{
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  backgroundColor: '#ffffff',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '8px',
                      backgroundColor: isHospital ? '#fee2e2' : '#eff6ff',
                      color: isHospital ? '#dc2626' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isHospital ? <Hospital size={20} /> : <Shield size={20} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: isHospital ? '#fee2e2' : '#dbeafe',
                          color: isHospital ? '#991b1b' : '#1e40af',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.address} &bull; <span style={{ color: '#0d9488', fontWeight: 600 }}>{formatIndianPhone(item.phone)}</span> &bull; <strong>{item.distance || '~1.2 km'}</strong>
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Click to call & Directions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                  <a
                    href={`tel:${cleanPhoneForDial(item.phone)}`}
                    className="btn btn-outline btn-sm"
                    title={`Call ${formatIndianPhone(item.phone)}`}
                    style={{ padding: '0.35rem 0.65rem', color: '#059669', borderColor: '#a7f3d0' }}
                  >
                    <Phone size={14} />
                    <span style={{ display: 'none' }} className="d-md-inline">Call</span>
                  </a>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-teal btn-sm"
                    title="Get Turn-by-Turn Directions in Maps"
                    style={{ padding: '0.35rem 0.65rem' }}
                  >
                    <Navigation size={14} />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NearbyServices;
