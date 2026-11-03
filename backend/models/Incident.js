const mongoose = require('mongoose');
const { formatIndianPhone } = require('../utils/phoneUtils');

const incidentSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    touristName: {
      type: String,
      required: true,
    },
    touristPhone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['SOS Emergency', 'Medical Emergency', 'Security Hazard', 'Geofence Breach', 'Lost / Trapped', 'Other'],
      default: 'SOS Emergency',
    },
    description: {
      type: String,
      default: 'Emergency SOS alert triggered by tourist',
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, default: 0 },
      address: { type: String, default: 'Coordinates recorded' },
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Critical',
    },
    cancelledReason: {
      type: String,
      default: null,
    },
    responseNotes: [
      {
        note: { type: String, required: true },
        author: { type: String, default: 'Dispatcher / Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: {
      type: String,
      default: 'Emergency Response Center (Dial 112)',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.pre('save', function (next) {
  if (this.touristPhone) {
    this.touristPhone = formatIndianPhone(this.touristPhone);
  }
  next();
});

incidentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
