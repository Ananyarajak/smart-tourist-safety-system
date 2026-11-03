import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import GoogleMapViewer from '../components/map/GoogleMapViewer';
import MapLegend from '../components/map/MapLegend';
import SosButtonModal from '../components/emergency/SosButtonModal';
import NearbyServices from '../components/emergency/NearbyServices';
import StatusBadge from '../components/common/StatusBadge';
import touristService from '../services/touristService';
import geofenceService from '../services/geofenceService';
import contactService from '../services/contactService';
import incidentService from '../services/incidentService';
import {
  MapPin,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  PhoneCall,
  Clock,
  Compass,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import IndianEmergencyServices from '../components/emergency/IndianEmergencyServices';
import { formatIndianPhone, cleanPhoneForDial } from '../utils/phoneUtils';
import { formatDateTime } from '../utils/dateUtils';

const SAMPLE_EMERGENCY_SERVICES = [
  {
    name: 'Maharaja Yeshwantrao (MY) Hospital & Trauma Centre',
    type: 'hospital',
    address: 'MY Hospital Road, Sanyogitaganj, Indore, MP 452001',
    phone: '+91 731 252 7383',
    latitude: 22.7150,
    longitude: 75.8710,
    distance: '1.2 km',
  },
  {
    name: 'Apollo Hospitals Emergency & Trauma Centre',
    type: 'hospital',
    address: 'Sector D, Scheme No 74C, Vijay Nagar, Indore, MP 452010',
    phone: '+91 731 244 5566',
    latitude: 22.7533,
    longitude: 75.8937,
    distance: '4.5 km',
  },
  {
    name: 'CHL Hospital Emergency & Cardiac Care',
    type: 'hospital',
    address: 'AB Road, Near LIG Square, Indore, MP 452008',
    phone: '+91 731 477 4444',
    latitude: 22.7380,
    longitude: 75.8820,
    distance: '2.8 km',
  },
  {
    name: 'Kotwali Police Station (Tourist Assistance Cell)',
    type: 'police',
    address: 'Rajwada Chowk, MG Road, Indore, MP 452002',
    phone: '+91 731 253 2100',
    latitude: 22.7188,
    longitude: 75.8560,
    distance: '0.3 km',
  },
  {
    name: 'Sarafa Tourist Police & Women Help Desk',
    type: 'police',
    address: 'Sarafa Bazaar, Near Bada Sarafa, Indore, MP 452002',
    phone: '+91 731 254 1100',
    latitude: 22.7175,
    longitude: 75.8548,
    distance: '0.5 km',
  },
];

const TouristDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // GPS Tracking State
  const [isTracking, setIsTracking] = useState(user?.isTrackingActive ?? true);
  const [currentCoords, setCurrentCoords] = useState(
    user?.lastKnownLocation?.latitude
      ? {
          latitude: user.lastKnownLocation.latitude,
          longitude: user.lastKnownLocation.longitude,
          accuracy: user.lastKnownLocation.accuracy || 8,
          address: user.lastKnownLocation.address || 'Rajwada Palace Heritage Corridor, Indore, MP',
        }
      : {
          latitude: 22.7196,
          longitude: 75.8577,
          accuracy: 8,
          address: 'Rajwada Palace Heritage Corridor, MG Road, Indore, MP',
        }
  );

  const [geofences, setGeofences] = useState([]);
  const [geofenceStatus, setGeofenceStatus] = useState({
    insideCount: 1,
    currentZone: { name: 'Rajwada Palace & Sarafa Heritage Corridor [SAFE ZONE]', type: 'Safe' },
    isInRestrictedZone: false,
    restrictedAlert: null,
  });

  const [contacts, setContacts] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const watchIdRef = useRef(null);

  // Load initial data: Geofences, Contacts, Incidents
  const loadDashboardData = useCallback(async () => {
    try {
      const [fenceRes, contactRes, incidentRes] = await Promise.all([
        geofenceService.getGeofences({ activeOnly: 'true' }),
        contactService.getContacts(),
        incidentService.getMyIncidents(),
      ]);

      if (fenceRes.success) setGeofences(fenceRes.geofences);
      if (contactRes.success) setContacts(contactRes.contacts);
      if (incidentRes.success) setRecentIncidents(incidentRes.incidents);
    } catch (err) {
      console.warn('Error fetching dashboard peripheral data:', err.message);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Transmit location update to MongoDB API and get evaluated geofence status
  const postLocationUpdate = useCallback(
    async (coords) => {
      setIsSyncingLocation(true);
      try {
        const payload = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy || 10,
          speed: coords.speed || null,
          heading: coords.heading || null,
          altitude: coords.altitude || null,
          address: coords.address || 'Active Tourist Location',
        };

        const res = await touristService.sendLocation(payload);
        if (res.success && res.geofenceStatus) {
          setGeofenceStatus(res.geofenceStatus);
        }
      } catch (err) {
        console.warn('Failed to sync location to server:', err.message);
      } finally {
        setIsSyncingLocation(false);
      }
    },
    []
  );

  // Start Geolocation tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError(null);
    setIsTracking(true);
    touristService.toggleTracking(true).catch(() => {});

    // First one-shot request
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updated = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          altitude: pos.coords.altitude,
          address: 'Current Device Geolocation',
        };
        setCurrentCoords(updated);
        postLocationUpdate(updated);
      },
      (err) => {
        console.warn('Geolocation one-shot denied/failed:', err.message);
        setLocationError(`Location note: ${err.message}. Using simulated demo coordinates.`);
        postLocationUpdate(currentCoords);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );

    // Continuous watchPosition
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const updated = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            altitude: pos.coords.altitude,
            address: 'Active GPS Movement',
          };
          setCurrentCoords(updated);
          postLocationUpdate(updated);
        },
        (err) => {
          console.warn('Geolocation watch note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn('Could not start watchPosition:', err);
    }
  }, [currentCoords, postLocationUpdate]);

  // Stop Geolocation tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    touristService.toggleTracking(false).catch(() => {});
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Initialize tracking on mount if enabled
  useEffect(() => {
    if (isTracking) {
      startTracking();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Quick simulation helper to test geofence breach
  const simulateMoveToRestrictedZone = () => {
    // Patalpani Gorge restricted hazard coordinates (22.7290, 75.8450)
    const hazardCoords = {
      latitude: 22.7290,
      longitude: 75.8450,
      accuracy: 8,
      address: 'Patalpani Waterfall Gorge [Hazard Zone]',
    };
    setCurrentCoords(hazardCoords);
    postLocationUpdate(hazardCoords);
  };

  const simulateMoveToSafeZone = () => {
    // Rajwada safe corridor (22.7196, 75.8577)
    const safeCoords = {
      latitude: 22.7196,
      longitude: 75.8577,
      accuracy: 6,
      address: 'Rajwada Palace & Sarafa Heritage Corridor [SAFE ZONE]',
    };
    setCurrentCoords(safeCoords);
    postLocationUpdate(safeCoords);
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isTrackingActive={isTracking}
          pageTitle="Tourist Safety Dashboard"
        />

        <main className="main-body">
          {/* Welcome & Profile Summary Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
                Welcome, {user?.name || 'Tourist'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Your safety status is active. Monitored by the Municipal Tourist Response Grid.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {isTracking ? (
                <button onClick={stopTracking} className="btn btn-outline" id="btn-stop-tracking">
                  <Square size={16} color="#dc2626" />
                  Stop GPS Tracking
                </button>
              ) : (
                <button onClick={startTracking} className="btn btn-teal" id="btn-start-tracking">
                  <Play size={16} />
                  Start GPS Tracking
                </button>
              )}

              {/* Demo Geofence Tester Buttons */}
              <button
                onClick={simulateMoveToRestrictedZone}
                className="btn btn-outline btn-sm"
                title="Simulate entering restricted hazard area to test warning alert"
                style={{ borderColor: '#ef4444', color: '#b91c1c' }}
              >
                <AlertTriangle size={14} /> Test Hazard Alert
              </button>
              <button
                onClick={simulateMoveToSafeZone}
                className="btn btn-outline btn-sm"
                title="Simulate returning to safe zone"
                style={{ borderColor: '#10b981', color: '#047857' }}
              >
                <CheckCircle size={14} /> Test Safe Zone
              </button>
            </div>
          </div>

          {/* CRITICAL RESTRICTED ZONE GEOFENCE ALERT BANNER */}
          {geofenceStatus?.isInRestrictedZone && (
            <div className="alert-banner alert-restricted" id="geofence-breach-alert">
              <ShieldAlert size={28} style={{ flexShrink: 0, color: '#dc2626' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', marginBottom: '2px' }}>
                  RESTRICTED ZONE WARNING: {geofenceStatus.restrictedAlert?.name || 'HAZARD PERIMETER'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                  {geofenceStatus.restrictedAlert?.alertMessage ||
                    'You have crossed into a restricted hazard zone. Unstable terrain or restricted maritime perimeter detected. Please return to marked safe paths immediately.'}
                </p>
              </div>
              <button onClick={simulateMoveToSafeZone} className="btn btn-danger btn-sm">
                Return to Safe Zone
              </button>
            </div>
          )}

          {/* Location error notice if permission blocked */}
          {locationError && (
            <div className="alert-banner alert-warning" style={{ fontSize: '0.82rem' }}>
              <Compass size={18} />
              <div>{locationError}</div>
            </div>
          )}

          {/* Dashboard Stats / Indicators */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="stat-card">
              <div>
                <span className="stat-card-label">GPS Tracking Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span
                    className={`pulse-dot ${isTracking ? 'pulse-dot-green' : ''}`}
                    style={{ backgroundColor: isTracking ? '#10b981' : '#94a3b8' }}
                  />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {isTracking ? 'Tracking Live' : 'Paused'}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Accuracy: ±{Math.round(currentCoords.accuracy || 10)} meters
                </p>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: isTracking ? '#ecfdf5' : '#f1f5f9', color: isTracking ? '#059669' : '#64748b' }}>
                <MapPin size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-card-label">Current Geofence Zone</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <StatusBadge
                    status={geofenceStatus.currentZone?.type || 'Safe'}
                    type="geofence"
                  />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy-800)', marginTop: '4px' }}>
                  {geofenceStatus.currentZone?.name || 'Safe Tourist Area'}
                </p>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
                <Shield size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-card-label">Registered Contacts</span>
                <div className="stat-card-value">{contacts.length}</div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Primary: {contacts.find((c) => c.isPrimary)?.name || 'Not configured'}
                </p>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <PhoneCall size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-card-label">Safety Incidents</span>
                <div className="stat-card-value">{recentIncidents.length}</div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {recentIncidents.filter((i) => i.status === 'Pending').length} Pending Dispatch
                </p>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          {/* India Emergency Services Helplines Section */}
          <div style={{ marginBottom: '1.75rem' }}>
            <IndianEmergencyServices />
          </div>

          {/* Main Map & SOS Section Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
              gap: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Interactive Map */}
            <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="#0d9488" />
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    Live GPS Safety Map & Geofence Overlay
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Lat: {currentCoords.latitude.toFixed(4)}, Lng: {currentCoords.longitude.toFixed(4)}
                </span>
              </div>

              <GoogleMapViewer
                center={{ lat: currentCoords.latitude, lng: currentCoords.longitude }}
                touristLocation={currentCoords}
                geofences={geofences}
                emergencyServices={SAMPLE_EMERGENCY_SERVICES}
                height="460px"
              />

              <MapLegend />
            </div>

            {/* Emergency SOS & Contacts Action Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* SOS Emergency Panel */}
              <div
                className="card"
                style={{
                  border: '2px solid #fee2e2',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} color="#dc2626" />
                    Emergency Incident Response
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Triggering SOS will transmit your exact coordinates and profile to the safety dispatch team.
                  </p>
                </div>

                <SosButtonModal
                  touristLocation={currentCoords}
                  onIncidentCreated={(newIncident) => {
                    loadDashboardData();
                  }}
                />
              </div>

              {/* Emergency Contacts Quick Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                    Quick Emergency Dial
                  </h4>
                  <a href="/contacts" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Manage ({contacts.length}) &rarr;
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {contacts.slice(0, 3).map((contact) => (
                    <div
                      key={contact._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {contact.name} {contact.isPrimary && <span style={{ color: '#0d9488', fontSize: '0.7rem' }}>[Primary]</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {contact.relationship} &bull; {formatIndianPhone(contact.phone)}
                        </div>
                      </div>
                      <a
                        href={`tel:${cleanPhoneForDial(contact.phone)}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.6rem', color: '#059669', borderColor: '#a7f3d0' }}
                        title="Click to Call"
                      >
                        <PhoneCall size={14} /> Call
                      </a>
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                      No contacts added yet.{' '}
                      <a href="/contacts" style={{ fontWeight: 600 }}>Add emergency contacts</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Nearby Services & Recent Incident Reports */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: '1.5rem',
            }}
          >
            {/* Nearby Emergency Services */}
            <NearbyServices
              services={SAMPLE_EMERGENCY_SERVICES}
              userCoords={currentCoords}
            />

            {/* Recent Incident Reports */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    My Incident History
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Recent emergency alerts and response updates
                  </p>
                </div>
                <a href="/incidents" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  View All &rarr;
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentIncidents.slice(0, 4).map((incident) => (
                  <div
                    key={incident._id}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {incident.type}
                      </span>
                      <StatusBadge status={incident.status} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
                      {incident.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(incident.createdAt).toLocaleString()}</span>
                      <span>{incident.responseNotes?.length || 0} response note(s)</span>
                    </div>
                  </div>
                ))}

                {recentIncidents.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No incident reports filed. Everything is safe.
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

export default TouristDashboard;
