const Geofence = require('../models/Geofence');
const GeofenceLog = require('../models/GeofenceLog');

// @desc    Get all geofences
// @route   GET /api/geofences
// @access  Public or Authenticated
exports.getGeofences = async (req, res, next) => {
  try {
    const { type, activeOnly } = req.query;
    const filter = {};

    if (activeOnly !== 'false') {
      filter.isActive = true;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }

    const geofences = await Geofence.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: geofences.length,
      geofences,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new geofence
// @route   POST /api/geofences
// @access  Private (Admin)
exports.createGeofence = async (req, res, next) => {
  try {
    const { name, description, type, center, radius, alertMessage, color, isActive } = req.body;

    if (!name || !center || center.latitude === undefined || center.longitude === undefined || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Name, center coordinates (latitude & longitude), and radius are required.',
      });
    }

    let defaultColor = color;
    if (!defaultColor) {
      if (type === 'Restricted') defaultColor = '#ef4444';
      else if (type === 'Caution') defaultColor = '#f59e0b';
      else defaultColor = '#10b981';
    }

    const geofence = await Geofence.create({
      name,
      description: description || '',
      type: type || 'Safe',
      center: {
        latitude: Number(center.latitude),
        longitude: Number(center.longitude),
      },
      radius: Number(radius),
      alertMessage: alertMessage || '',
      color: defaultColor,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Geofence created successfully',
      geofence,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a geofence
// @route   PUT /api/geofences/:id
// @access  Private (Admin)
exports.updateGeofence = async (req, res, next) => {
  try {
    const { name, description, type, center, radius, alertMessage, color, isActive } = req.body;

    const geofence = await Geofence.findById(req.params.id);
    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }

    if (name) geofence.name = name;
    if (description !== undefined) geofence.description = description;
    if (type) {
      geofence.type = type;
      if (!color) {
        if (type === 'Restricted') geofence.color = '#ef4444';
        else if (type === 'Caution') geofence.color = '#f59e0b';
        else geofence.color = '#10b981';
      }
    }
    if (center && center.latitude !== undefined && center.longitude !== undefined) {
      geofence.center = {
        latitude: Number(center.latitude),
        longitude: Number(center.longitude),
      };
    }
    if (radius) geofence.radius = Number(radius);
    if (alertMessage !== undefined) geofence.alertMessage = alertMessage;
    if (color) geofence.color = color;
    if (isActive !== undefined) geofence.isActive = Boolean(isActive);

    await geofence.save();

    res.status(200).json({
      success: true,
      message: 'Geofence updated successfully',
      geofence,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a geofence
// @route   DELETE /api/geofences/:id
// @access  Private (Admin)
exports.deleteGeofence = async (req, res, next) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }

    await Geofence.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Geofence deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get geofence event logs
// @route   GET /api/geofences/events
// @access  Private (Admin)
exports.getGeofenceLogs = async (req, res, next) => {
  try {
    const logs = await GeofenceLog.find()
      .populate('tourist', 'name email phone')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};
