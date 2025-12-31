import mongoose from 'mongoose';

const bodyGoalSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  type: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'recomp'],
    required: true
  },
  startWeight: {
    type: Number,
    required: true
  },
  currentWeight: {
    type: Number,
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  weeklyTarget: {
    type: Number // kg/lbs per week
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bodyGoalSchema.index({ userId: 1, isActive: 1 });

const BodyGoal = mongoose.model('BodyGoal', bodyGoalSchema);

export default BodyGoal;
