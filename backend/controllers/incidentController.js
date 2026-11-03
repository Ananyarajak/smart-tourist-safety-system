const Incident = require('../models/Incident');
const User = require('../models/User');

// @desc    Create emergency incident / SOS Alert
// @route   POST /api/incidents
// @access  Private (Tourist)
exports.createIncident = async (req, res, next) => {
  try {
    const { type, description, latitude, longitude, accuracy, address, severity } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Incident GPS coordinates (latitude and longitude) are required.',
      });
    }

    const user = await User.findById(req.user.id);

    const incident = await Incident.create({
      tourist: req.user.id,
      touristName: user.name,
      touristPhone: user.phone,
      type: type || 'SOS Emergency',
      description: description || 'Immediate SOS assistance triggered by tourist',
      location: {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        address: address || 'Current Tourist GPS Location',
      },
      status: 'Pending',
      severity: severity || 'Critical',
      responseNotes: [
        {
          note: 'Emergency incident initiated and dispatched to monitoring operators (Dial 112 Command Desk).',
          author: 'System Dispatch (Dial 112)',
          createdAt: new Date(),
        },
      ],
      assignedTo: 'Indore Police & SDRF Dispatch (Dial 112)',
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS alert registered successfully. Indian Emergency Response Support System (Dial 112) notified.',
      incident,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current tourist's incidents
// @route   GET /api/incidents/my
// @access  Private (Tourist)
exports.getMyIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ tourist: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all incidents (Admin)
// @route   GET /api/incidents
// @access  Private (Admin)
exports.getAllIncidents = async (req, res, next) => {
  try {
    const { status, type, severity } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (severity && severity !== 'All') {
      filter.severity = severity;
    }

    const incidents = await Incident.find(filter)
      .populate('tourist', 'name email phone nationality')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private (Tourist or Admin)
exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('tourist', 'name email phone nationality');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // If tourist, ensure they own it
    if (req.user.role === 'tourist' && incident.tourist._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this incident report' });
    }

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update incident status and add response notes
// @route   PUT /api/incidents/:id/status
// @access  Private (Admin)
exports.updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTo } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (status) {
      incident.status = status;
      if (status === 'Resolved') {
        incident.resolvedAt = new Date();
      }
    }

    if (assignedTo) {
      incident.assignedTo = assignedTo;
    }

    if (note) {
      incident.responseNotes.push({
        note,
        author: req.user.name || 'Admin',
        createdAt: new Date(),
      });
    }

    await incident.save();

    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      incident,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an accidental SOS alert
// @route   PUT /api/incidents/:id/cancel
// @access  Private (Tourist)
exports.cancelSosAlert = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Ensure tourist owns this incident or is admin
    if (req.user.role !== 'admin' && incident.tourist.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this alert' });
    }

    if (incident.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an incident that has already been resolved.' });
    }

    incident.status = 'Cancelled';
    incident.cancelledReason = reason || 'Cancelled by tourist as false alarm / accidental press';
    incident.responseNotes.push({
      note: `Alert cancelled by tourist: ${incident.cancelledReason}`,
      author: req.user.name,
      createdAt: new Date(),
    });

    await incident.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert was cancelled successfully',
      incident,
    });
  } catch (err) {
    next(err);
  }
};
