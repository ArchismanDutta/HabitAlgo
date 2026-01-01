import FinancialTransaction from '../models/FinancialTransaction.js';
import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';

/**
 * @desc    Get habit-finance correlations
 * @route   GET /api/v1/finance/correlations/habits
 * @access  Private
 *
 * Analyzes correlation between habit completion and spending patterns
 */
export const getHabitFinanceCorrelation = async (req, res) => {
  try {
    const { startDate, endDate, minSampleSize = 5 } = req.query;

    // Default to last 90 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get all habits
    const habits = await Habit.find({ userId: req.user._id, isActive: true });

    // Get all daily logs in date range
    const logs = await DailyLog.find({
      userId: req.user._id,
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0]
      }
    });

    // Get all transactions in date range
    const transactions = await FinancialTransaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: start, $lte: end },
      isDeleted: false
    });

    // Build date map: { date → { habits: {}, spending: number, transactions: [], mood: number } }
    const dateMap = {};

    logs.forEach(log => {
      const dateKey = log.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          habits: {},
          spending: 0,
          transactions: [],
          mood: log.mood,
          totalHabits: 0,
          completedHabits: 0
        };
      }

      dateMap[dateKey].habits[log.habitId.toString()] = {
        completed: log.completed || log.value > 0,
        value: log.value
      };

      dateMap[dateKey].totalHabits++;
      if (log.completed || log.value > 0) {
        dateMap[dateKey].completedHabits++;
      }
    });

    transactions.forEach(t => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          habits: {},
          spending: 0,
          transactions: [],
          mood: null,
          totalHabits: 0,
          completedHabits: 0
        };
      }

      dateMap[dateKey].spending += t.amount;
      dateMap[dateKey].transactions.push({
        amount: t.amount,
        category: t.category,
        merchant: t.merchant,
        isImpulsive: t.isImpulsive
      });
    });

    // Analyze correlations for each habit
    const habitCorrelations = [];

    for (const habit of habits) {
      const habitId = habit._id.toString();

      // Days when habit was completed vs not completed
      const completedDays = [];
      const notCompletedDays = [];

      Object.keys(dateMap).forEach(date => {
        const dayData = dateMap[date];

        if (dayData.habits[habitId]) {
          if (dayData.habits[habitId].completed) {
            completedDays.push(dayData);
          } else {
            notCompletedDays.push(dayData);
          }
        }
      });

      // Calculate statistics
      if (completedDays.length >= minSampleSize && notCompletedDays.length >= minSampleSize) {
        const avgSpendingCompleted = completedDays.reduce((sum, d) => sum + d.spending, 0) / completedDays.length;
        const avgSpendingNotCompleted = notCompletedDays.reduce((sum, d) => sum + d.spending, 0) / notCompletedDays.length;

        const avgImpulseCompleted = completedDays.reduce((sum, d) =>
          sum + d.transactions.filter(t => t.isImpulsive).length, 0) / completedDays.length;
        const avgImpulseNotCompleted = notCompletedDays.reduce((sum, d) =>
          sum + d.transactions.filter(t => t.isImpulsive).length, 0) / notCompletedDays.length;

        const spendingImpact = avgSpendingNotCompleted > 0
          ? ((avgSpendingCompleted - avgSpendingNotCompleted) / avgSpendingNotCompleted) * 100
          : 0;

        const impulseImpact = avgImpulseNotCompleted > 0
          ? ((avgImpulseCompleted - avgImpulseNotCompleted) / avgImpulseNotCompleted) * 100
          : 0;

        habitCorrelations.push({
          habitId: habit._id,
          habitName: habit.name,
          habitCategory: habit.category,
          avgSpendingWhenCompleted: Math.round(avgSpendingCompleted * 100) / 100,
          avgSpendingWhenNotCompleted: Math.round(avgSpendingNotCompleted * 100) / 100,
          spendingImpact: Math.round(spendingImpact * 100) / 100, // Negative = saves money
          avgImpulseWhenCompleted: Math.round(avgImpulseCompleted * 100) / 100,
          avgImpulseWhenNotCompleted: Math.round(avgImpulseNotCompleted * 100) / 100,
          impulseImpact: Math.round(impulseImpact * 100) / 100, // Negative = less impulse
          completedDays: completedDays.length,
          notCompletedDays: notCompletedDays.length,
          significance: calculateSignificance(completedDays.length, notCompletedDays.length)
        });
      }
    }

    // Sort by absolute impact
    habitCorrelations.sort((a, b) => Math.abs(b.spendingImpact) - Math.abs(a.spendingImpact));

    // Overall habit completion vs spending
    const overallCorrelation = calculateOverallCorrelation(dateMap);

    // Mood vs spending correlation
    const moodCorrelation = calculateMoodCorrelation(dateMap);

    // Category-specific correlations
    const categoryCorrelations = calculateCategoryCorrelations(transactions, dateMap);

    res.status(200).json({
      success: true,
      data: {
        habitCorrelations,
        overallCorrelation,
        moodCorrelation,
        categoryCorrelations,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          days: Object.keys(dateMap).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating habit-finance correlation',
      error: error.message
    });
  }
};

/**
 * Calculate overall habit completion vs spending correlation
 */
function calculateOverallCorrelation(dateMap) {
  const highCompletionDays = [];
  const lowCompletionDays = [];

  Object.keys(dateMap).forEach(date => {
    const dayData = dateMap[date];

    if (dayData.totalHabits > 0) {
      const completionRate = dayData.completedHabits / dayData.totalHabits;

      if (completionRate >= 0.7) {
        highCompletionDays.push(dayData);
      } else if (completionRate <= 0.3) {
        lowCompletionDays.push(dayData);
      }
    }
  });

  if (highCompletionDays.length < 3 || lowCompletionDays.length < 3) {
    return null;
  }

  const avgSpendingHigh = highCompletionDays.reduce((sum, d) => sum + d.spending, 0) / highCompletionDays.length;
  const avgSpendingLow = lowCompletionDays.reduce((sum, d) => sum + d.spending, 0) / lowCompletionDays.length;

  const impact = avgSpendingLow > 0
    ? ((avgSpendingHigh - avgSpendingLow) / avgSpendingLow) * 100
    : 0;

  return {
    avgSpendingHighCompletion: Math.round(avgSpendingHigh * 100) / 100,
    avgSpendingLowCompletion: Math.round(avgSpendingLow * 100) / 100,
    impact: Math.round(impact * 100) / 100, // Negative = completing habits saves money
    highCompletionDays: highCompletionDays.length,
    lowCompletionDays: lowCompletionDays.length
  };
}

/**
 * Calculate mood vs spending correlation
 */
function calculateMoodCorrelation(dateMap) {
  const moodBuckets = {
    'Very Low (1-3)': { days: [], totalSpending: 0 },
    'Low (4-5)': { days: [], totalSpending: 0 },
    'Medium (6-7)': { days: [], totalSpending: 0 },
    'High (8-10)': { days: [], totalSpending: 0 }
  };

  Object.keys(dateMap).forEach(date => {
    const dayData = dateMap[date];

    if (dayData.mood) {
      let bucket;
      if (dayData.mood <= 3) bucket = 'Very Low (1-3)';
      else if (dayData.mood <= 5) bucket = 'Low (4-5)';
      else if (dayData.mood <= 7) bucket = 'Medium (6-7)';
      else bucket = 'High (8-10)';

      moodBuckets[bucket].days.push(dayData);
      moodBuckets[bucket].totalSpending += dayData.spending;
    }
  });

  const result = Object.keys(moodBuckets).map(bucket => ({
    moodRange: bucket,
    avgSpending: moodBuckets[bucket].days.length > 0
      ? Math.round((moodBuckets[bucket].totalSpending / moodBuckets[bucket].days.length) * 100) / 100
      : 0,
    days: moodBuckets[bucket].days.length
  })).filter(b => b.days >= 3);

  return result;
}

/**
 * Calculate category-specific correlations
 */
function calculateCategoryCorrelations(transactions, dateMap) {
  const categories = {};

  // Group transactions by category
  transactions.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = {
        totalAmount: 0,
        count: 0,
        impulseCount: 0,
        daysWithSpending: new Set()
      };
    }

    categories[t.category].totalAmount += t.amount;
    categories[t.category].count += 1;
    if (t.isImpulsive) categories[t.category].impulseCount += 1;

    const dateKey = t.date.toISOString().split('T')[0];
    categories[t.category].daysWithSpending.add(dateKey);
  });

  // Calculate correlation with habit completion for each category
  const categoryCorrelations = Object.keys(categories).map(category => {
    const categoryData = categories[category];
    const daysArray = Array.from(categoryData.daysWithSpending);

    let totalCompletionRate = 0;
    let validDays = 0;

    daysArray.forEach(date => {
      if (dateMap[date] && dateMap[date].totalHabits > 0) {
        totalCompletionRate += dateMap[date].completedHabits / dateMap[date].totalHabits;
        validDays++;
      }
    });

    const avgCompletionRate = validDays > 0 ? totalCompletionRate / validDays : 0;

    return {
      category,
      totalSpending: Math.round(categoryData.totalAmount * 100) / 100,
      transactionCount: categoryData.count,
      impulsePercentage: Math.round((categoryData.impulseCount / categoryData.count) * 100),
      avgDailyCompletionRate: Math.round(avgCompletionRate * 100),
      daysWithSpending: daysArray.length
    };
  }).sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 10);

  return categoryCorrelations;
}

/**
 * Calculate statistical significance
 */
function calculateSignificance(completedDays, notCompletedDays) {
  const totalDays = completedDays + notCompletedDays;
  if (totalDays < 10) return 'low';
  if (totalDays < 30) return 'medium';
  return 'high';
}

// Export helper functions for testing
export { calculateOverallCorrelation, calculateMoodCorrelation, calculateCategoryCorrelations, calculateSignificance };
