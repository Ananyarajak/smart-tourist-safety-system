const mongoose = require('mongoose');

const geofenceLogSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    geofence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      required: true,
    },
    geofenceName: {
      type: String,
      required: true,
    },
    geofenceType: {
      type: String,
      enum: ['Safe', 'Restricted', 'Caution'],
      required: true,
    },
    eventType: {
      type: String,
      enum: ['ENTER', 'EXIT'],
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    distanceMeters: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GeofenceLog', geofenceLogSchema);
