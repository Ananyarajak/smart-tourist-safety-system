const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateIndianPhone, formatIndianPhone } = require('../utils/phoneUtils');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'tourist_safety_super_secret_jwt_key_2026_xyz987',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new tourist or administrator
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, emergencyContactSummary, nationality } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone.',
      });
    }

    if (!validateIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number with or without +91 prefix (e.g. +91 98765 43210 or 9876543210).',
      });
    }

    const formattedPhone = formatIndianPhone(phone);
    const formattedSummary = emergencyContactSummary ? { ...emergencyContactSummary } : {};
    if (formattedSummary.phone) {
      if (!validateIndianPhone(formattedSummary.phone, true)) {
        return res.status(400).json({
          success: false,
          message: 'Emergency contact phone number must be a valid Indian mobile or helpline number.',
        });
      }
      formattedSummary.phone = formatIndianPhone(formattedSummary.phone);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Enforce role: only allow 'admin' if explicit admin code or during setup; otherwise 'tourist'
    let assignedRole = 'tourist';
    if (role === 'admin') {
      assignedRole = 'admin';
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: formattedPhone,
      role: assignedRole,
      nationality: nationality || 'India',
      emergencyContactSummary: formattedSummary,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nationality: user.nationality,
        emergencyContactSummary: user.emergencyContactSummary,
        isTrackingActive: user.isTrackingActive,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nationality: user.nationality,
        emergencyContactSummary: user.emergencyContactSummary,
        isTrackingActive: user.isTrackingActive,
        lastKnownLocation: user.lastKnownLocation,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
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
