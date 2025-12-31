import mongoose from 'mongoose';

const measurementsSchema = new mongoose.Schema({
  chest: Number,
  waist: Number,
  hips: Number,
  biceps: Number,
  thighs: Number,
  calves: Number,
  neck: Number,
  shoulders: Number
}, { _id: false });

const bodyMetricsSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  date: {
    type: String, // "2025-12-31"
    required: true
  },
  weight: {
    type: Number
  },
  bodyFat: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  measurements: measurementsSchema,
  photos: [{
    type: String // URLs or base64
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bodyMetricsSchema.index({ userId: 1, date: -1 });

// Ensure only one entry per user per date
bodyMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });

const BodyMetrics = mongoose.model('BodyMetrics', bodyMetricsSchema);

export default BodyMetrics;
