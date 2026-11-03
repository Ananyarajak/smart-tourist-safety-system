const User = require('../models/User');
const TouristLocation = require('../models/TouristLocation');
const Geofence = require('../models/Geofence');
const GeofenceLog = require('../models/GeofenceLog');
const { evaluateGeofences } = require('../utils/geofenceUtils');
const { validateIndianPhone, formatIndianPhone } = require('../utils/phoneUtils');

// @desc    Get tourist profile
// @route   GET /api/tourist/profile
// @access  Private (Tourist & Admin)
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nationality: user.nationality,
        emergencyContactSummary: user.emergencyContactSummary,
        isTrackingActive: user.isTrackingActive,
        lastKnownLocation: user.lastKnownLocation,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update tourist profile
// @route   PUT /api/tourist/profile
// @access  Private (Tourist)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, nationality, emergencyContactSummary } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) {
      if (!validateIndianPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit Indian mobile number with or without +91 prefix (e.g. +91 98765 43210).',
        });
      }
      fieldsToUpdate.phone = formatIndianPhone(phone);
    }
    if (nationality) fieldsToUpdate.nationality = nationality;
    if (emergencyContactSummary) {
      const summary = { ...emergencyContactSummary };
      if (summary.phone) {
        if (!validateIndianPhone(summary.phone, true)) {
          return res.status(400).json({
            success: false,
            message: 'Emergency contact phone number must be a valid Indian mobile or helpline number.',
          });
        }
        summary.phone = formatIndianPhone(summary.phone);
      }
      fieldsToUpdate.emergencyContactSummary = summary;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        nationality: updatedUser.nationality,
        emergencyContactSummary: updatedUser.emergencyContactSummary,
        isTrackingActive: updatedUser.isTrackingActive,
        lastKnownLocation: updatedUser.lastKnownLocation,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Post real-time GPS location & evaluate geofences
// @route   POST /api/tourist/location
// @access  Private (Tourist)
exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, speed, heading, altitude, address } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required.',
      });
    }

    // Fetch active geofences to evaluate
    const activeGeofences = await Geofence.find({ isActive: true });
    const geofenceResult = evaluateGeofences(latitude, longitude, activeGeofences);

    // Get tourist's previous location to determine enter/exit events
    const lastLocation = await TouristLocation.findOne({ user: req.user.id }).sort({ timestamp: -1 });

    // Detect geofence events and save logs
    const currentZoneId = geofenceResult.currentZone.geofenceId ? geofenceResult.currentZone.geofenceId.toString() : null;
    const previousZoneId = lastLocation && lastLocation.currentZone && lastLocation.currentZone.geofenceId ? lastLocation.currentZone.geofenceId.toString() : null;

    if (currentZoneId !== previousZoneId) {
      // Exited previous zone
      if (previousZoneId) {
        const exitedFence = activeGeofences.find((g) => g._id.toString() === previousZoneId);
        if (exitedFence) {
          await GeofenceLog.create({
            tourist: req.user.id,
            geofence: exitedFence._id,
            geofenceName: exitedFence.name,
            geofenceType: exitedFence.type,
            eventType: 'EXIT',
            location: { latitude, longitude },
          });
        }
      }
      // Entered new zone
      if (currentZoneId) {
        const enteredFence = activeGeofences.find((g) => g._id.toString() === currentZoneId);
        if (enteredFence) {
          await GeofenceLog.create({
            tourist: req.user.id,
            geofence: enteredFence._id,
            geofenceName: enteredFence.name,
            geofenceType: enteredFence.type,
            eventType: 'ENTER',
            location: { latitude, longitude },
          });
        }
      }
    }

    // Create TouristLocation entry in MongoDB
    const locationRecord = await TouristLocation.create({
      user: req.user.id,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      speed: speed || null,
      heading: heading || null,
      altitude: altitude || null,
      address: address || '',
      currentZone: geofenceResult.currentZone,
      isInRestrictedZone: geofenceResult.isInRestrictedZone,
      timestamp: new Date(),
    });

    // Update user's last known location and active tracking state
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        isTrackingActive: true,
        lastKnownLocation: {
          latitude,
          longitude,
          accuracy: accuracy || 0,
          updatedAt: new Date(),
          address: address || (geofenceResult.currentZone.name !== 'Open Area' ? geofenceResult.currentZone.name : 'Active GPS Tracking Point'),
        },
      },
    });

    res.status(201).json({
      success: true,
      location: locationRecord,
      geofenceStatus: {
        insideCount: geofenceResult.insideGeofences.length,
        currentZone: geofenceResult.currentZone,
        isInRestrictedZone: geofenceResult.isInRestrictedZone,
        restrictedAlert: geofenceResult.restrictedAlert,
        activeGeofencesInside: geofenceResult.insideGeofences,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle tracking status (start / stop)
// @route   POST /api/tourist/tracking/toggle
// @access  Private (Tourist)
exports.toggleTracking = async (req, res, next) => {
  try {
    const { isTrackingActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isTrackingActive: Boolean(isTrackingActive) } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      isTrackingActive: user.isTrackingActive,
      message: user.isTrackingActive ? 'Location tracking activated' : 'Location tracking stopped',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get tourist location history
// @route   GET /api/tourist/location/history
// @access  Private (Tourist & Admin)
exports.getLocationHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    // If admin is requesting specific tourist history
    const userId = req.user.role === 'admin' && req.query.touristId ? req.query.touristId : req.user.id;

    const history = await TouristLocation.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    next(err);
  }
};
