const mongoose = require('mongoose');

const touristLocationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: null,
    },
    heading: {
      type: Number,
      default: null,
    },
    altitude: {
      type: Number,
      default: null,
    },
    address: {
      type: String,
      default: '',
    },
    currentZone: {
      geofenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Geofence' },
      name: String,
      type: { type: String, enum: ['Safe', 'Restricted', 'Caution', 'None'], default: 'None' },
    },
    isInRestrictedZone: {
      type: Boolean,
      default: false,
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

// Composite index for fast location history lookup per tourist
touristLocationSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('TouristLocation', touristLocationSchema);
