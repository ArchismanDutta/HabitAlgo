import mongoose from 'mongoose';

const exerciseInProgramSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  plannedSets: {
    type: Number,
    required: true,
    min: 1
  },
  plannedReps: {
    type: String, // "8-12" or "10"
    required: true
  },
  plannedWeight: {
    type: Number,
    min: 0
  },
  restTime: {
    type: Number, // seconds
    default: 90
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const workoutProgramSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '💪'
  },
  exercises: [exerciseInProgramSchema],
  scheduledDays: [{
    type: Number,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
workoutProgramSchema.index({ userId: 1, isActive: 1 });

const WorkoutProgram = mongoose.model('WorkoutProgram', workoutProgramSchema);

export default WorkoutProgram;
