import mongoose from 'mongoose';

const setPerformanceSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true
  },
  plannedReps: {
    type: Number,
    required: true
  },
  actualReps: {
    type: Number,
    required: true
  },
  plannedWeight: {
    type: Number,
    required: true
  },
  actualWeight: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  restTime: {
    type: Number // seconds
  },
  rpe: {
    type: Number, // Rate of Perceived Exertion (1-10)
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const exercisePerformanceSchema = new mongoose.Schema({
  exerciseId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String,
    required: true
  },
  sets: [setPerformanceSchema],
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  energy: {
    type: String,
    enum: ['low', 'normal', 'high', 'extra_power']
  },
  // Substitution tracking
  isSubstitute: {
    type: Boolean,
    default: false
  },
  substitutedFor: {
    exerciseId: String,
    exerciseName: String,
    reason: String // e.g., "Equipment unavailable", "Injury", "Personal preference"
  },
  // Optional reference values from program (guidelines only)
  plannedSets: {
    type: Number
  },
  plannedReps: {
    type: String
  },
  plannedWeight: {
    type: Number
  },
  restTime: {
    type: Number
  }
}, { _id: false });

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutProgram',
    required: true
  },
  programName: {
    type: String,
    required: true
  },
  date: {
    type: String, // "2025-12-31"
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // minutes
  },
  completed: {
    type: Boolean,
    default: false
  },
  exercises: [exercisePerformanceSchema],
  overallEnergy: {
    type: String,
    enum: ['low', 'normal', 'high', 'extra_power'],
    default: 'normal'
  },
  bodyWeight: {
    type: Number
  },
  totalVolume: {
    type: Number, // Total weight lifted (weight × reps)
    default: 0
  },
  completionStats: {
    exercisesCompleted: {
      type: Number,
      default: 0
    },
    exercisesPlanned: {
      type: Number,
      default: 0
    },
    setsCompleted: {
      type: Number,
      default: 0
    },
    setsPlanned: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
workoutSessionSchema.index({ userId: 1, date: -1 });
workoutSessionSchema.index({ userId: 1, programId: 1 });

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

export default WorkoutSession;
