const User = require('../models/User');
const Incident = require('../models/Incident');
const Geofence = require('../models/Geofence');
const TouristLocation = require('../models/TouristLocation');

// @desc    Get Admin Dashboard Summary Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalTourists = await User.countDocuments({ role: 'tourist' });
    const activeTrackingTourists = await User.countDocuments({ role: 'tourist', isTrackingActive: true });
    
    const totalIncidents = await Incident.countDocuments();
    const activeEmergencyAlerts = await Incident.countDocuments({
      status: { $in: ['Pending', 'In Progress'] },
    });
    const pendingIncidents = await Incident.countDocuments({ status: 'Pending' });
    const inProgressIncidents = await Incident.countDocuments({ status: 'In Progress' });
    const resolvedIncidents = await Incident.countDocuments({ status: 'Resolved' });
    const cancelledIncidents = await Incident.countDocuments({ status: 'Cancelled' });

    const totalGeofences = await Geofence.countDocuments();
    const safeGeofences = await Geofence.countDocuments({ type: 'Safe' });
    const restrictedGeofences = await Geofence.countDocuments({ type: 'Restricted' });

    // Recent 5 critical/pending incidents
    const urgentIncidents = await Incident.find({ status: { $in: ['Pending', 'In Progress'] } })
      .populate('tourist', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalTourists,
        activeTrackingTourists,
        totalIncidents,
        activeEmergencyAlerts,
        pendingIncidents,
        inProgressIncidents,
        resolvedIncidents,
        cancelledIncidents,
        totalGeofences,
        safeGeofences,
        restrictedGeofences,
      },
      urgentIncidents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of tourists with current status and latest location
// @route   GET /api/admin/tourists
// @access  Private (Admin)
exports.getAllTourists = async (req, res, next) => {
  try {
    const tourists = await User.find({ role: 'tourist' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tourists.length,
      tourists,
    });
  } catch (err) {
    next(err);
  }
};
