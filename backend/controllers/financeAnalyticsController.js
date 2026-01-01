import FinancialTransaction from '../models/FinancialTransaction.js';
import FinancialSummary from '../models/FinancialSummary.js';
import FinancialAccount from '../models/FinancialAccount.js';
import LedgerEntry from '../models/LedgerEntry.js';

/**
 * @desc    Get financial summary for a month
 * @route   GET /api/v1/finance/analytics/summary
 * @access  Private
 */
export const getFinancialSummary = async (req, res) => {
  try {
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Get or create summary
    let summary = await FinancialSummary.findOne({
      userId: req.user._id,
      year: currentYear,
      month: currentMonth
    });

    // If not found or outdated (older than 1 hour), recalculate
    if (!summary || (new Date() - summary.calculatedAt) > 3600000) {
      summary = await FinancialSummary.recalculate(req.user._id, currentYear, currentMonth);
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get spending trends
 * @route   GET /api/v1/finance/analytics/trends
 * @access  Private
 */
export const getSpendingTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const trends = [];
    const today = new Date();

    for (let i = 0; i < parseInt(months); i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      const summary = await FinancialSummary.findOne({
        userId: req.user._id,
        year,
        month
      });

      if (summary) {
        trends.unshift({
          year,
          month,
          monthName: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          netSavings: summary.netSavings,
          savingsRate: summary.savingsRate,
          healthScore: summary.healthScore
        });
      }
    }

    res.status(200).json({
      success: true,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching spending trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get category-wise breakdown
 * @route   GET /api/v1/finance/analytics/categories
 * @access  Private
 */
export const getCategoryBreakdown = async (req, res) => {
  try {
    const { year, month, type = 'expense' } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const breakdown = await LedgerEntry.getCategoryBreakdown(
      req.user._id,
      startDate,
      endDate,
      type
    );

    res.status(200).json({
      success: true,
      count: breakdown.length,
      data: breakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category breakdown',
      error: error.message
    });
  }
};

/**
 * @desc    Get spending by day of week
 * @route   GET /api/v1/finance/analytics/day-of-week
 * @access  Private
 */
export const getSpendingByDayOfWeek = async (req, res) => {
  try {
    const { months = 3 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const transactions = await FinancialTransaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = {};

    dayNames.forEach(day => {
      dayData[day] = { total: 0, count: 0, transactions: [] };
    });

    transactions.forEach(t => {
      const day = dayNames[new Date(t.date).getDay()];
      dayData[day].total += t.amount;
      dayData[day].count += 1;
    });

    const result = Object.keys(dayData).map(day => ({
      day,
      total: Math.round(dayData[day].total * 100) / 100,
      count: dayData[day].count,
      average: dayData[day].count > 0
        ? Math.round((dayData[day].total / dayData[day].count) * 100) / 100
        : 0
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching day of week spending',
      error: error.message
    });
  }
};

/**
 * @desc    Get spending by time of day
 * @route   GET /api/v1/finance/analytics/time-of-day
 * @access  Private
 */
export const getSpendingByTimeOfDay = async (req, res) => {
  try {
    const { months = 3 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    const endDate = new Date();

    const transactions = await FinancialTransaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const timeRanges = {
      'Morning (6AM-12PM)': { start: 6, end: 12, total: 0, count: 0 },
      'Afternoon (12PM-6PM)': { start: 12, end: 18, total: 0, count: 0 },
      'Evening (6PM-10PM)': { start: 18, end: 22, total: 0, count: 0 },
      'Night (10PM-6AM)': { start: 22, end: 6, total: 0, count: 0 }
    };

    transactions.forEach(t => {
      const hour = t.hourOfDay;

      for (const [range, data] of Object.entries(timeRanges)) {
        if (data.end > data.start) {
          if (hour >= data.start && hour < data.end) {
            data.total += t.amount;
            data.count += 1;
          }
        } else {
          // Night range wraps around midnight
          if (hour >= data.start || hour < data.end) {
            data.total += t.amount;
            data.count += 1;
          }
        }
      }
    });

    const result = Object.keys(timeRanges).map(range => ({
      timeRange: range,
      total: Math.round(timeRanges[range].total * 100) / 100,
      count: timeRanges[range].count,
      average: timeRanges[range].count > 0
        ? Math.round((timeRanges[range].total / timeRanges[range].count) * 100) / 100
        : 0
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching time of day spending',
      error: error.message
    });
  }
};

/**
 * @desc    Get impulse spending analysis
 * @route   GET /api/v1/finance/analytics/impulse
 * @access  Private
 */
export const getImpulseAnalysis = async (req, res) => {
  try {
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const allExpenses = await FinancialTransaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const impulseExpenses = allExpenses.filter(t => t.isImpulsive);

    const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalImpulse = impulseExpenses.reduce((sum, t) => sum + t.amount, 0);

    const impulseByCategory = {};
    impulseExpenses.forEach(t => {
      if (!impulseByCategory[t.category]) {
        impulseByCategory[t.category] = { total: 0, count: 0 };
      }
      impulseByCategory[t.category].total += t.amount;
      impulseByCategory[t.category].count += 1;
    });

    const topImpulseCategories = Object.keys(impulseByCategory)
      .map(cat => ({
        category: cat,
        total: impulseByCategory[cat].total,
        count: impulseByCategory[cat].count,
        average: impulseByCategory[cat].total / impulseByCategory[cat].count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        totalImpulse,
        impulsePercentage: totalExpenses > 0 ? (totalImpulse / totalExpenses) * 100 : 0,
        impulseCount: impulseExpenses.length,
        totalCount: allExpenses.length,
        avgImpulseAmount: impulseExpenses.length > 0
          ? totalImpulse / impulseExpenses.length
          : 0,
        topCategories: topImpulseCategories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching impulse analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get top merchants
 * @route   GET /api/v1/finance/analytics/merchants
 * @access  Private
 */
export const getTopMerchants = async (req, res) => {
  try {
    const { year, month, limit = 10 } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const result = await FinancialTransaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
          isDeleted: false,
          merchant: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$merchant',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const merchants = result.map(m => ({
      merchant: m._id,
      total: Math.round(m.total * 100) / 100,
      count: m.count,
      avgAmount: Math.round(m.avgAmount * 100) / 100
    }));

    res.status(200).json({
      success: true,
      count: merchants.length,
      data: merchants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top merchants',
      error: error.message
    });
  }
};

/**
 * @desc    Recalculate summary for a month
 * @route   POST /api/v1/finance/analytics/recalculate
 * @access  Private
 */
export const recalculateSummary = async (req, res) => {
  try {
    const { year, month } = req.body;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const summary = await FinancialSummary.recalculate(req.user._id, currentYear, currentMonth);

    res.status(200).json({
      success: true,
      message: 'Summary recalculated',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recalculating summary',
      error: error.message
    });
  }
};
