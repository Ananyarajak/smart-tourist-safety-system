const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validateIndianPhone, formatIndianPhone } = require('../utils/phoneUtils');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
      validate: {
        validator: function (v) {
          return validateIndianPhone(v);
        },
        message: (props) =>
          `${props.value} is not a valid Indian mobile number. Please provide a 10-digit number with or without +91 prefix (e.g., +91 98765 43210).`,
      },
    },
    role: {
      type: String,
      enum: ['tourist', 'admin'],
      default: 'tourist',
    },
    nationality: {
      type: String,
      default: 'India',
      trim: true,
    },
    emergencyContactSummary: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    isTrackingActive: {
      type: Boolean,
      default: false,
    },
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      updatedAt: Date,
      address: String,
    },
  },
  {
    timestamps: true,
  }
);

// Format phone and hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('phone') && this.phone) {
    this.phone = formatIndianPhone(this.phone);
  }
  if (this.emergencyContactSummary && this.emergencyContactSummary.phone) {
    this.emergencyContactSummary.phone = formatIndianPhone(this.emergencyContactSummary.phone);
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
