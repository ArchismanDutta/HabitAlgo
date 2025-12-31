import mongoose from 'mongoose';

const monthlySummarySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },

  // Computed metrics
  totalDays: {
    type: Number,
    default: 0
  },
  completedDays: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },

  // Weekly breakdown
  weeklyStats: [{
    week: Number,
    completed: Number,
    total: Number,
    rate: Number
  }],

  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique compound index
monthlySummarySchema.index({ year: 1, month: 1, habitId: 1 }, { unique: true });
monthlySummarySchema.index({ habitId: 1, year: -1, month: -1 });

// Static method to recalculate summary
monthlySummarySchema.statics.recalculate = async function(habitId, year, month) {
  const DailyLog = mongoose.model('DailyLog');

  // Get all logs for this habit in this month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const logs = await DailyLog.find({
    habitId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const daysInMonth = new Date(year, month, 0).getDate();
  const completedDays = logs.filter(log => log.completed).length;
  const completionRate = (completedDays / daysInMonth) * 100;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);

      // Check if this is current streak (up to today)
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);
      if (logDate.getTime() === today.getTime()) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate total value (for numeric habits)
  const totalValue = logs.reduce((sum, log) => sum + (log.value || 0), 0);

  // Weekly breakdown
  const weeklyStats = [];
  for (let week = 1; week <= 5; week++) {
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = Math.min(week * 7, daysInMonth);
    const weekLogs = logs.filter(log => {
      const day = new Date(log.date).getDate();
      return day >= weekStart && day <= weekEnd;
    });
    const weekCompleted = weekLogs.filter(log => log.completed).length;
    const weekTotal = weekEnd - weekStart + 1;

    weeklyStats.push({
      week,
      completed: weekCompleted,
      total: weekTotal,
      rate: (weekCompleted / weekTotal) * 100
    });
  }

  // Upsert summary
  return await this.findOneAndUpdate(
    { year, month, habitId },
    {
      totalDays: daysInMonth,
      completedDays,
      completionRate,
      currentStreak,
      longestStreak,
      totalValue,
      weeklyStats,
      lastCalculated: new Date()
    },
    { upsert: true, new: true }
  );
};

const MonthlySummary = mongoose.model('MonthlySummary', monthlySummarySchema);

export default MonthlySummary;
