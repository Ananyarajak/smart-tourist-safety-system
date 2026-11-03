const express = require('express');
const router = express.Router();
const {
  getGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getGeofenceLogs,
} = require('../controllers/geofenceController');
const { protect, authorize } = require('../middleware/auth');

// Public or authenticated tourists and admins can view geofences
router.get('/', getGeofences);

// Admin-only management routes
router.post('/', protect, authorize('admin'), createGeofence);
router.put('/:id', protect, authorize('admin'), updateGeofence);
router.delete('/:id', protect, authorize('admin'), deleteGeofence);
router.get('/events', protect, authorize('admin'), getGeofenceLogs);

module.exports = router;
