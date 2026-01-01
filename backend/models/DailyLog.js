import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true
  },

  // Check-in data
  completed: {
    type: Boolean,
    default: false
  },
  value: {
    type: Number,
    default: 0
  },

  // Metadata
  note: {
    type: String,
    maxlength: 500
  },
  mood: {
    type: Number,
    min: 1,
    max: 10
  },

  // Screen time (denormalized, stored once per day)
  screenTime: {
    morning: { type: Number, default: 0 },
    day: { type: Number, default: 0 },
    evening: { type: Number, default: 0 },
    night: { type: Number, default: 0 }
  },

  // Daily reflection (denormalized, stored once per day)
  reflection: {
    text: {
      type: String,
      maxlength: 2000
    },
    achievements: [String],
    energy: {
      type: Number,
      min: 1,
      max: 10
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
dailyLogSchema.index({ userId: 1, date: -1, habitId: 1 });
dailyLogSchema.index({ userId: 1, habitId: 1, date: -1 });

// Unique constraint: one log per habit per day per user
dailyLogSchema.index({ userId: 1, date: 1, habitId: 1 }, { unique: true });

// Static method to get logs for a specific date
dailyLogSchema.statics.getByDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('habitId');
};

// Static method to get logs for a date range
dailyLogSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).populate('habitId').sort({ date: -1 });
};

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

export default DailyLog;
