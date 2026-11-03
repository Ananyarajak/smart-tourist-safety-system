const express = require('express');
const router = express.Router();
const { getAdminStats, getAllTourists } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/tourists', getAllTourists);

module.exports = router;
