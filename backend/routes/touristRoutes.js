const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateLocation,
  toggleTracking,
  getLocationHistory,
} = require('../controllers/touristController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/location', updateLocation);
router.post('/tracking/toggle', toggleTracking);
router.get('/location/history', getLocationHistory);

module.exports = router;
