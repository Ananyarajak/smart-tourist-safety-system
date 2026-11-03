const express = require('express');
const router = express.Router();
const {
  createIncident,
  getMyIncidents,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  cancelSosAlert,
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Tourist routes
router.post('/', createIncident);
router.get('/my', getMyIncidents);
router.put('/:id/cancel', cancelSosAlert);

// Admin routes
router.get('/', authorize('admin'), getAllIncidents);
router.put('/:id/status', authorize('admin'), updateIncidentStatus);

// Shared route (accessible by owner or admin)
router.get('/:id', getIncidentById);

module.exports = router;
