import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Key, AlertCircle, Plus, Minus, RotateCcw, Shield, Hospital, Compass } from 'lucide-react';
import Modal from '../common/Modal';
import { formatIndianPhone } from '../../utils/phoneUtils';

const GoogleMapViewer = ({
  center = { lat: 22.7196, lng: 75.8577 },
  zoom = 14,
  touristLocation = null,
  geofences = [],
  emergencyServices = [],
  onMapClick = null,
  height = '500px',
  interactivePick = false,
}) => {
  const mapContainerRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);

  const [apiKey, setApiKey] = useState(
    localStorage.getItem('tourist_google_maps_api_key') ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  );
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);

  // Fallback map state (pan & zoom)
  const [fallbackZoom, setFallbackZoom] = useState(14);
  const [fallbackCenter, setFallbackCenter] = useState(center);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState(null);

  // Update fallback center if prop changes
  useEffect(() => {
    if (touristLocation && touristLocation.latitude && touristLocation.longitude) {
      setFallbackCenter({ lat: touristLocation.latitude, lng: touristLocation.longitude });
    } else if (center && center.lat && center.lng) {
      setFallbackCenter(center);
    }
  }, [touristLocation, center]);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key' || apiKey.trim() === '') {
      setIsGoogleMapsLoaded(false);
      return;
    }

    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Window gm_authFailure handler
    window.gm_authFailure = () => {
      console.warn('Google Maps API authentication failed. Check your API key and enabled APIs.');
      setLoadError('Google Maps API authentication failed. Please verify your API key and quotas.');
      setIsGoogleMapsLoaded(false);
    };

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsGoogleMapsLoaded(true);
      setLoadError(null);
    };

    script.onerror = () => {
      console.warn('Failed to load Google Maps script.');
      setLoadError('Unable to connect to Google Maps servers.');
      setIsGoogleMapsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Keep script cached if successfully loaded
    };
  }, [apiKey]);

  // Initialize and update Google Map instance
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapContainerRef.current || !window.google) return;

    try {
      const targetCenter = touristLocation
        ? { lat: touristLocation.latitude, lng: touristLocation.longitude }
        : center;

      if (!googleMapInstance.current) {
        googleMapInstance.current = new window.google.maps.Map(mapContainerRef.current, {
          center: targetCenter,
          zoom: zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }],
            },
          ],
        });

        if (onMapClick) {
          googleMapInstance.current.addListener('click', (e) => {
            onMapClick({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
          });
        }
      } else {
        googleMapInstance.current.panTo(targetCenter);
      }

      // Clear existing markers and circles
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];

      // 1. Add Tourist Marker
      if (touristLocation && touristLocation.latitude) {
        const touristPos = { lat: touristLocation.latitude, lng: touristLocation.longitude };
        const touristMarker = new window.google.maps.Marker({
          position: touristPos,
          map: googleMapInstance.current,
          title: 'Current Tourist Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#0284c7',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 6px; font-family: sans-serif;">
            <strong style="color: #0284c7;">Tourist Current Location</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
              Lat: ${touristLocation.latitude.toFixed(5)}, Lng: ${touristLocation.longitude.toFixed(5)}<br/>
              ${touristLocation.address || 'Active GPS tracking'}
            </p>
          </div>`,
        });

        touristMarker.addListener('click', () => {
          infoWindow.open(googleMapInstance.current, touristMarker);
        });

        markersRef.current.push(touristMarker);
      }

      // 2. Add Geofences (Circles)
      geofences.forEach((fence) => {
        if (!fence.center || fence.center.latitude === undefined) return;

        let strokeColor = '#10b981';
        let fillColor = '#10b981';
        if (fence.type === 'Restricted') {
          strokeColor = '#ef4444';
          fillColor = '#ef4444';
        } else if (fence.type === 'Caution') {
          strokeColor = '#f59e0b';
          fillColor = '#f59e0b';
        }

        const circle = new window.google.maps.Circle({
          strokeColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor,
          fillOpacity: 0.22,
          map: googleMapInstance.current,
          center: { lat: fence.center.latitude, lng: fence.center.longitude },
          radius: fence.radius,
        });

        const fenceMarker = new window.google.maps.Marker({
          position: { lat: fence.center.latitude, lng: fence.center.longitude },
          map: googleMapInstance.current,
          title: fence.name,
          label: {
            text: fence.type === 'Restricted' ? '!' : '✓',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: strokeColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const fenceInfo = new window.google.maps.InfoWindow({
          content: `<div style="padding: 6px; font-family: sans-serif; max-width: 240px;">
            <strong style="color: ${strokeColor}; font-size: 13px;">${fence.name}</strong>
            <span style="display:inline-block; margin-left: 6px; padding: 2px 6px; font-size: 10px; border-radius: 4px; background: #f1f5f9; color: #334155;">${fence.type}</span>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${fence.description || ''}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600;">Radius: ${fence.radius} meters</p>
          </div>`,
        });

        fenceMarker.addListener('click', () => {
          fenceInfo.open(googleMapInstance.current, fenceMarker);
        });

        circlesRef.current.push(circle);
        markersRef.current.push(fenceMarker);
      });

      // 3. Add Emergency Services Markers
      emergencyServices.forEach((service) => {
        if (!service.latitude || !service.longitude) return;

        const isHospital = service.type === 'hospital';
        const marker = new window.google.maps.Marker({
          position: { lat: service.latitude, lng: service.longitude },
          map: googleMapInstance.current,
          title: service.name,
          label: {
            text: isHospital ? '+' : '★',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: isHospital ? '#dc2626' : '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const serviceInfo = new window.google.maps.InfoWindow({
          content: `<div style="padding: 6px; font-family: sans-serif; max-width: 220px;">
            <strong style="color: ${isHospital ? '#dc2626' : '#2563eb'}; font-size: 13px;">${service.name}</strong>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #475569;">${service.address}</p>
            <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 600;">Phone: ${formatIndianPhone(service.phone)}</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 4px; font-size: 11px; color: #0d9488; font-weight: 600;">Get Directions &rarr;</a>
          </div>`,
        });

        marker.addListener('click', () => {
          serviceInfo.open(googleMapInstance.current, marker);
        });

        markersRef.current.push(marker);
      });
    } catch (err) {
      console.warn('Error rendering Google Maps layers:', err);
    }
  }, [isGoogleMapsLoaded, touristLocation, geofences, emergencyServices, center, zoom, onMapClick]);

  const handleSaveApiKey = () => {
    localStorage.setItem('tourist_google_maps_api_key', inputKey.trim());
    setApiKey(inputKey.trim());
    setShowKeyModal(false);
  };

  // Coordinates to pixel converter for interactive fallback SVG map
  const projectCoordinates = useCallback(
    (lat, lng, containerWidth = 800, containerHeight = 500) => {
      // Scale factor based on fallbackZoom
      // At zoom 14, 1 degree lat is approx ~111,000 meters
      const zoomFactor = Math.pow(2, fallbackZoom - 12);
      const scaleX = 4000 * zoomFactor;
      const scaleY = 4000 * zoomFactor * Math.cos((fallbackCenter.lat * Math.PI) / 180);

      const x = containerWidth / 2 + (lng - fallbackCenter.lng) * scaleX;
      const y = containerHeight / 2 - (lat - fallbackCenter.lat) * scaleY;
      return { x, y };
    },
    [fallbackCenter, fallbackZoom]
  );

  // Meter to pixel converter for circle radius
  const metersToPixels = useCallback(
    (meters) => {
      const zoomFactor = Math.pow(2, fallbackZoom - 12);
      // At equator ~111320 meters per deg
      const metersPerDegree = 111320 * Math.cos((fallbackCenter.lat * Math.PI) / 180);
      const degrees = meters / metersPerDegree;
      const scale = 4000 * zoomFactor;
      return Math.max(12, degrees * scale);
    },
    [fallbackCenter, fallbackZoom]
  );

  // Interactive mouse events for fallback canvas
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const zoomFactor = Math.pow(2, fallbackZoom - 12);
    const scaleX = 4000 * zoomFactor;
    const scaleY = 4000 * zoomFactor;

    setFallbackCenter((prev) => ({
      lat: prev.lat + dy / scaleY,
      lng: prev.lng - dx / scaleX,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (interactivePick && onMapClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const zoomFactor = Math.pow(2, fallbackZoom - 12);
      const scaleX = 4000 * zoomFactor;
      const scaleY = 4000 * zoomFactor * Math.cos((fallbackCenter.lat * Math.PI) / 180);

      const lng = fallbackCenter.lng + (clickX - rect.width / 2) / scaleX;
      const lat = fallbackCenter.lat - (clickY - rect.height / 2) / scaleY;

      onMapClick({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Top Map Action Bar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 20,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setShowKeyModal(true)}
          className="btn btn-outline btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.78rem',
            padding: '0.4rem 0.75rem',
          }}
          title="Configure Google Maps API Key"
        >
          <Key size={14} color="#0d9488" />
          {isGoogleMapsLoaded ? 'Google Maps: Connected' : 'Google Maps: Setup Key'}
        </button>
      </div>

      {/* Google Maps Real Container */}
      {isGoogleMapsLoaded ? (
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        />
      ) : (
        /* High-Fidelity Interactive Map Fallback */
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0a192f',
            backgroundImage: `
              radial-gradient(#1e3a5f 1.5px, transparent 1.5px),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px, 64px 64px, 64px 64px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'inherit',
            cursor: interactivePick ? 'crosshair' : isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        >
          {/* Subtle Grid / Shoreline aesthetic background elements */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <path
              d="M -100 220 Q 300 180 600 240 T 1200 210"
              fill="none"
              stroke="#1e3a5f"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M -100 380 Q 250 320 700 420 T 1400 370"
              fill="none"
              stroke="#1e3a5f"
              strokeWidth="1"
              strokeDasharray="8 4"
            />
          </svg>

          {/* Render Geofences as SVG Circles */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {geofences.map((fence) => {
              if (!fence.center || fence.center.latitude === undefined) return null;
              const { x, y } = projectCoordinates(fence.center.latitude, fence.center.longitude);
              const r = metersToPixels(fence.radius);

              let stroke = '#10b981';
              let fill = 'rgba(16, 185, 129, 0.18)';
              if (fence.type === 'Restricted') {
                stroke = '#ef4444';
                fill = 'rgba(239, 68, 68, 0.25)';
              } else if (fence.type === 'Caution') {
                stroke = '#f59e0b';
                fill = 'rgba(245, 158, 11, 0.2)';
              }

              return (
                <g key={fence._id || fence.name}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2"
                    strokeDasharray={fence.type === 'Restricted' ? '6 4' : 'none'}
                  />
                  <circle cx={x} cy={y} r="5" fill={stroke} />
                  <text
                    x={x}
                    y={y - r - 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                  >
                    {fence.name} ({fence.radius}m)
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tourist Current Location Marker */}
          {touristLocation && touristLocation.latitude && (
            (() => {
              const { x, y } = projectCoordinates(touristLocation.latitude, touristLocation.longitude);
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    zIndex: 30,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({
                      title: 'Current Tourist Location',
                      badge: 'GPS Tracking Active',
                      desc: `Lat: ${touristLocation.latitude.toFixed(5)}, Lng: ${touristLocation.longitude.toFixed(5)}`,
                      address: touristLocation.address || 'Active GPS coordinates',
                    });
                  }}
                >
                  <div className="pulse-dot pulse-dot-green" style={{ width: 22, height: 22, backgroundColor: '#0284c7' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 26,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    }}
                  >
                    You are here
                  </div>
                </div>
              );
            })()
          )}

          {/* Emergency Services Markers */}
          {emergencyServices.map((service, idx) => {
            if (!service.latitude || !service.longitude) return null;
            const { x, y } = projectCoordinates(service.latitude, service.longitude);
            const isHospital = service.type === 'hospital';

            return (
              <div
                key={service.name + idx}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  zIndex: 25,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({
                    title: service.name,
                    badge: isHospital ? 'Hospital' : 'Police Station',
                    desc: service.address,
                    phone: service.phone,
                    lat: service.latitude,
                    lng: service.longitude,
                  });
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: isHospital ? '#dc2626' : '#2563eb',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  }}
                  title={service.name}
                >
                  {isHospital ? <Hospital size={14} /> : <Shield size={14} />}
                </div>
              </div>
            );
          })}

          {/* Selected Item Floating Info Card */}
          {selectedItem && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                padding: '0.85rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 40,
                maxWidth: '320px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: '#2dd4bf',
                    fontWeight: 700,
                  }}
                >
                  {selectedItem.badge}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ✕
                </button>
              </div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: '4px 0' }}>
                {selectedItem.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '2px 0' }}>
                {selectedItem.desc || selectedItem.address}
              </p>
              {selectedItem.phone && (
                <p style={{ fontSize: '0.8rem', color: '#2dd4bf', fontWeight: 600 }}>
                  Tel: {formatIndianPhone(selectedItem.phone)}
                </p>
              )}
              {selectedItem.lat && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    fontSize: '0.78rem',
                    color: '#2dd4bf',
                    textDecoration: 'underline',
                  }}
                >
                  Open in Google Maps &rarr;
                </a>
              )}
            </div>
          )}

          {/* Interactive Zoom & Reset Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 35,
            }}
          >
            <button
              onClick={() => setFallbackZoom((z) => Math.min(18, z + 1))}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.45rem', backgroundColor: '#ffffff' }}
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setFallbackZoom((z) => Math.max(10, z - 1))}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.45rem', backgroundColor: '#ffffff' }}
              title="Zoom Out"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => {
                if (touristLocation && touristLocation.latitude) {
                  setFallbackCenter({ lat: touristLocation.latitude, lng: touristLocation.longitude });
                } else {
                  setFallbackCenter(center);
                }
                setFallbackZoom(14);
              }}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.45rem', backgroundColor: '#ffffff' }}
              title="Recenter Map"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Interactive Pick Notification Banner */}
          {interactivePick && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(13, 148, 136, 0.95)',
                color: '#ffffff',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                zIndex: 35,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              Click anywhere on map to select zone coordinates
            </div>
          )}

          {/* Compass / Scale Tag */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: interactivePick ? 300 : 12,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.65rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '6px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255,255,255,0.08)',
              zIndex: 10,
            }}
          >
            <Compass size={14} color="#2dd4bf" />
            <span>
              {fallbackCenter.lat.toFixed(4)}° N, {Math.abs(fallbackCenter.lng).toFixed(4)}° W (Zoom {fallbackZoom})
            </span>
          </div>
        </div>
      )}

      {/* Google Maps API Key Config Modal */}
      <Modal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="Google Maps JavaScript API Setup"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowKeyModal(false)}>
              Close
            </button>
            <button className="btn btn-teal" onClick={handleSaveApiKey}>
              Save & Load Google Maps
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            This application is fully integrated with the <strong>Google Maps JavaScript API</strong>.
            You can provide your Google Maps API Key below or configure it in <code>frontend/.env</code> via <code>VITE_GOOGLE_MAPS_API_KEY</code>.
          </p>

          <div className="form-group">
            <label className="form-label">Google Maps JavaScript API Key</label>
            <input
              type="text"
              className="form-input"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
            />
            <span className="form-hint">
              Required Google Cloud APIs: <strong>Maps JavaScript API</strong> and <strong>Places API</strong>.
            </span>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', fontSize: '0.8rem', color: '#0f766e' }}>
            <strong>Note:</strong> When no key is entered or an invalid key is supplied, the application automatically runs in <strong>Interactive High-Fidelity Fallback Map Mode</strong> with real distance calculations, geofence radius rendering, tourist GPS tracking, and emergency place markers.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoogleMapViewer;
