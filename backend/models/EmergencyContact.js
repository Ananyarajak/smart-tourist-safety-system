const mongoose = require('mongoose');
const { validateIndianPhone, formatIndianPhone } = require('../utils/phoneUtils');

const emergencyContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return validateIndianPhone(v, true);
        },
        message: (props) =>
          `${props.value} is not a valid Indian contact number. Please provide a 10-digit mobile number with or without +91 (e.g. +91 98765 43210) or valid helpline number.`,
      },
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

emergencyContactSchema.pre('save', function (next) {
  if (this.phone) {
    this.phone = formatIndianPhone(this.phone);
  }
  next();
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
