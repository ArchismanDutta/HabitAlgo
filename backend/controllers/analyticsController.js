import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';
import MonthlySummary from '../models/MonthlySummary.js';

// Get current month summary
export const getCurrentSummary = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const summaries = await MonthlySummary.find({
      userId: req.user._id,
      year,
      month
    })
      .populate('habitId')
      .sort({ completionRate: -1 });

    res.json({ success: true, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get monthly data
export const getMonthlyData = async (req, res) => {
  try {
    const { year, month } = req.query;

    const summaries = await MonthlySummary.find({
      userId: req.user._id,
      year: parseInt(year),
      month: parseInt(month)
    })
      .populate('habitId')
      .sort({ completionRate: -1 });

    res.json({ success: true, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all habit streaks
export const getStreaks = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const streakData = [];

    for (const habit of habits) {
      // Get recent logs (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const logs = await DailyLog.find({
        userId: req.user._id,
        habitId: habit._id,
        date: { $gte: ninetyDaysAgo }
      }).sort({ date: -1 });

      const streak = calculateStreak(logs);

      streakData.push({
        habitId: habit._id,
        habitName: habit.name,
        currentStreak: streak,
        color: habit.color,
        icon: habit.icon
      });
    }

    res.json({ success: true, data: streakData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trends (weekly/monthly)
export const getTrends = async (req, res) => {
  try {
    const { habitId, period = 'month' } = req.query;

    let startDate;
    const endDate = new Date();

    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    const filter = {
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };
    if (habitId) {
      filter.habitId = habitId;
    }

    const logs = await DailyLog.find(filter)
      .populate('habitId')
      .sort({ date: 1 });

    // Group by date
    const trendData = logs.reduce((acc, log) => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, completed: 0, total: 0 };
      }
      acc[dateKey].total++;
      if (log.completed) {
        acc[dateKey].completed++;
      }
      return acc;
    }, {});

    const trends = Object.values(trendData).map(day => ({
      ...day,
      rate: (day.completed / day.total) * 100
    }));

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get chart data for dashboard
export const getChartData = async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Get all active habits
    const habits = await Habit.find({ userId: req.user._id, isActive: true });

    // Get logs for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('habitId');

    // Daily completion data for line chart
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(targetYear, targetMonth - 1, day);
      const dayLogs = logs.filter(log =>
        new Date(log.date).getDate() === day
      );

      const completed = dayLogs.filter(log => log.completed).length;
      const total = habits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;

      dailyData.push({
        day,
        date: dayDate.toISOString().split('T')[0],
        completed,
        total,
        rate
      });
    }

    // Overall completion for donut chart
    const totalPossible = habits.length * daysInMonth;
    const totalCompleted = logs.filter(log => log.completed).length;
    const overallRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    // Habit ranking for bar chart
    const habitStats = habits.map(habit => {
      const habitLogs = logs.filter(log => {
        const logHabitId = log.habitId?._id || log.habitId;
        return logHabitId && logHabitId.toString() === habit._id.toString();
      });
      const completed = habitLogs.filter(log => log.completed).length;
      const rate = daysInMonth > 0 ? (completed / daysInMonth) * 100 : 0;

      return {
        habitId: habit._id,
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
        completed,
        total: daysInMonth,
        rate
      };
    }).sort((a, b) => b.rate - a.rate);

    res.json({
      success: true,
      data: {
        dailyData,
        overallCompletion: {
          completed: totalCompleted,
          total: totalPossible,
          rate: overallRate
        },
        habitStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Recalculate summaries
export const recalculateSummaries = async (req, res) => {
  try {
    const { year, month, habitId } = req.body;

    if (habitId) {
      // Recalculate for specific habit
      await MonthlySummary.recalculate(habitId, year, month, req.user._id);
    } else {
      // Recalculate for all habits
      const habits = await Habit.find({ userId: req.user._id, isActive: true });
      for (const habit of habits) {
        await MonthlySummary.recalculate(habit._id, year, month, req.user._id);
      }
    }

    res.json({ success: true, message: 'Summaries recalculated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to calculate streak
function calculateStreak(logs) {
  if (logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    // Check if log is for the expected consecutive day
    if (logDate.getTime() === expectedDate.getTime() && logs[i].completed) {
      streak++;
    } else if (logDate.getTime() < expectedDate.getTime()) {
      // Gap found, streak broken
      break;
    }
  }

  return streak;
}
