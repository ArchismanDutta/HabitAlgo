import mongoose from 'mongoose';

const supplementLogSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  supplementId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    ref: 'Supplement',
    required: true
  },
  date: {
    type: String, // "2025-12-31"
    required: true
  },
  timing: {
    type: String,
    enum: ['morning', 'pre_workout', 'post_workout', 'night'],
    required: true
  },
  taken: {
    type: Boolean,
    default: true
  },
  amount: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
supplementLogSchema.index({ userId: 1, date: -1 });
supplementLogSchema.index({ userId: 1, supplementId: 1, date: 1 });

const SupplementLog = mongoose.model('SupplementLog', supplementLogSchema);

export default SupplementLog;
