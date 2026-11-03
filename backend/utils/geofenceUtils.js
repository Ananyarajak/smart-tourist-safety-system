/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check a point against all active geofences
 * @param {number} lat
 * @param {number} lon
 * @param {Array} geofences
 * @returns {Object}
 */
function evaluateGeofences(lat, lon, geofences) {
  const inside = [];
  let isInRestrictedZone = false;
  let restrictedAlert = null;
  let currentZone = { geofenceId: null, name: 'Open Area', type: 'None' };

  for (const fence of geofences) {
    if (!fence.isActive) continue;

    const distance = calculateDistanceMeters(
      lat,
      lon,
      fence.center.latitude,
      fence.center.longitude
    );

    const isInside = distance <= fence.radius;

    if (isInside) {
      inside.push({
        geofence: fence,
        distanceMeters: Math.round(distance),
        radius: fence.radius,
      });

      if (fence.type === 'Restricted') {
        isInRestrictedZone = true;
        restrictedAlert = {
          geofenceId: fence._id,
          name: fence.name,
          alertMessage:
            fence.alertMessage ||
            `WARNING: You have entered a restricted area (${fence.name})! Please return to designated safe zones.`,
          distanceMeters: Math.round(distance),
        };
      }

      currentZone = {
        geofenceId: fence._id,
        name: fence.name,
        type: fence.type,
      };
    }
  }

  return {
    insideGeofences: inside,
    isInRestrictedZone,
    restrictedAlert,
    currentZone,
  };
}

module.exports = {
  calculateDistanceMeters,
  evaluateGeofences,
};
