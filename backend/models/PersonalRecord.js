import mongoose from 'mongoose';

const personalRecordSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  exerciseId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['1RM', 'max_reps', 'max_volume'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  weight: {
    type: Number // For max_reps type
  },
  reps: {
    type: Number // For 1RM type
  },
  date: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    ref: 'WorkoutSession'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
personalRecordSchema.index({ userId: 1, exerciseId: 1, type: 1 });
personalRecordSchema.index({ userId: 1, date: -1 });

const PersonalRecord = mongoose.model('PersonalRecord', personalRecordSchema);

export default PersonalRecord;
