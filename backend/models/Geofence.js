const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Geofence name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['Safe', 'Restricted', 'Caution'],
      default: 'Safe',
      index: true,
    },
    center: {
      latitude: {
        type: Number,
        required: [true, 'Center latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Center longitude is required'],
      },
    },
    radius: {
      type: Number,
      required: [true, 'Radius in meters is required'],
      min: [10, 'Radius must be at least 10 meters'],
      default: 500, // in meters
    },
    alertMessage: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#10b981', // green for safe, red for restricted, amber for caution
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign default colors based on type if not explicitly supplied
geofenceSchema.pre('save', function (next) {
  if (!this.color || this.color === '#10b981') {
    if (this.type === 'Restricted') this.color = '#ef4444';
    else if (this.type === 'Caution') this.color = '#f59e0b';
    else this.color = '#10b981';
  }
  next();
});

module.exports = mongoose.model('Geofence', geofenceSchema);
