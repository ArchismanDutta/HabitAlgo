import FinancialTransaction from '../models/FinancialTransaction.js';
import DailyLog from '../models/DailyLog.js';
import Budget from '../models/Budget.js';

/**
 * ImpulseDetector - Detects impulsive spending behavior
 *
 * Signals that indicate impulsive spending:
 * 1. Time of day (late night, early morning)
 * 2. Day of week (weekends, Fridays)
 * 3. Amount relative to budget
 * 4. Frequency of spending in short period
 * 5. Mood (if available) - emotional spending
 * 6. Habit completion status - compensation spending
 * 7. Category patterns - entertainment, shopping
 * 8. Unplanned flag
 */

class ImpulseDetector {
  /**
   * Detect if a transaction is impulsive
   * @param {String} userId - User ID
   * @param {Object} transaction - Transaction data
   * @returns {Object} { isImpulsive: boolean, score: number, reasons: array }
   */
  static async detectImpulse(userId, transaction) {
    let score = 0;
    const reasons = [];
    const weights = {
      timeOfDay: 15,
      dayOfWeek: 10,
      amount: 20,
      frequency: 20,
      mood: 15,
      habitStatus: 10,
      category: 10,
      unplanned: 20
    };

    // 1. Time of day analysis
    const timeScore = this.analyzeTimeOfDay(transaction);
    if (timeScore > 0) {
      score += weights.timeOfDay * (timeScore / 100);
      reasons.push({
        factor: 'time_of_day',
        score: timeScore,
        description: this.getTimeDescription(transaction)
      });
    }

    // 2. Day of week analysis
    const dayScore = this.analyzeDayOfWeek(transaction);
    if (dayScore > 0) {
      score += weights.dayOfWeek * (dayScore / 100);
      reasons.push({
        factor: 'day_of_week',
        score: dayScore,
        description: this.getDayDescription(transaction)
      });
    }

    // 3. Amount analysis (relative to budget and average)
    const amountScore = await this.analyzeAmount(userId, transaction);
    if (amountScore > 0) {
      score += weights.amount * (amountScore / 100);
      reasons.push({
        factor: 'amount',
        score: amountScore,
        description: 'Amount significantly above average'
      });
    }

    // 4. Frequency analysis (multiple transactions in short period)
    const frequencyScore = await this.analyzeFrequency(userId, transaction);
    if (frequencyScore > 0) {
      score += weights.frequency * (frequencyScore / 100);
      reasons.push({
        factor: 'frequency',
        score: frequencyScore,
        description: 'Multiple transactions in short period'
      });
    }

    // 5. Mood analysis
    const moodScore = await this.analyzeMood(userId, transaction);
    if (moodScore > 0) {
      score += weights.mood * (moodScore / 100);
      reasons.push({
        factor: 'mood',
        score: moodScore,
        description: 'Low mood detected - possible emotional spending'
      });
    }

    // 6. Habit status analysis
    const habitScore = await this.analyzeHabitStatus(userId, transaction);
    if (habitScore > 0) {
      score += weights.habitStatus * (habitScore / 100);
      reasons.push({
        factor: 'habit_status',
        score: habitScore,
        description: 'Spending during missed habits - possible compensation'
      });
    }

    // 7. Category analysis
    const categoryScore = this.analyzeCategory(transaction);
    if (categoryScore > 0) {
      score += weights.category * (categoryScore / 100);
      reasons.push({
        factor: 'category',
        score: categoryScore,
        description: 'High-impulse category'
      });
    }

    // 8. Unplanned flag
    if (transaction.isPlanned === false) {
      score += weights.unplanned;
      reasons.push({
        factor: 'unplanned',
        score: 100,
        description: 'Marked as unplanned'
      });
    }

    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score));

    return {
      isImpulsive: score >= 50, // Threshold for impulsive
      score: Math.round(score),
      reasons,
      confidence: this.calculateConfidence(reasons)
    };
  }

  /**
   * Analyze time of day
   * Returns 0-100 score
   */
  static analyzeTimeOfDay(transaction) {
    const hour = transaction.time
      ? parseInt(transaction.time.split(':')[0])
      : new Date(transaction.date).getHours();

    // High impulse times:
    // 10 PM - 2 AM: Very high (100)
    // 2 AM - 6 AM: High (80)
    // 6 AM - 9 AM: Medium (50)
    // 12 PM - 2 PM: Low (30) - lunch break
    // 6 PM - 10 PM: Medium (50) - after work
    // 9 AM - 12 PM: Very low (0)
    // 2 PM - 6 PM: Very low (0)

    if (hour >= 22 || hour < 2) return 100; // Late night
    if (hour >= 2 && hour < 6) return 80; // Very early morning
    if (hour >= 6 && hour < 9) return 50; // Early morning
    if (hour >= 18 && hour < 22) return 50; // Evening
    if (hour >= 12 && hour < 14) return 30; // Lunch
    return 0; // Normal hours
  }

  /**
   * Analyze day of week
   * Returns 0-100 score
   */
  static analyzeDayOfWeek(transaction) {
    const day = new Date(transaction.date).getDay();

    // Friday: 70 (pre-weekend spending)
    // Saturday: 80
    // Sunday: 60
    // Monday: 40 (post-weekend compensation)
    // Tuesday-Thursday: 0

    const dayScores = {
      0: 60, // Sunday
      1: 40, // Monday
      2: 0,  // Tuesday
      3: 0,  // Wednesday
      4: 0,  // Thursday
      5: 70, // Friday
      6: 80  // Saturday
    };

    return dayScores[day];
  }

  /**
   * Analyze amount relative to budget and average
   */
  static async analyzeAmount(userId, transaction) {
    try {
      // Get average spending for this category
      const startOfMonth = new Date(transaction.date);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const categoryTransactions = await FinancialTransaction.find({
        userId,
        category: transaction.category,
        type: 'expense',
        date: { $gte: startOfMonth },
        isDeleted: false
      });

      if (categoryTransactions.length === 0) return 0;

      const avgAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length;

      // If this transaction is significantly higher than average
      const ratio = transaction.amount / avgAmount;

      if (ratio >= 3) return 100; // 3x average
      if (ratio >= 2) return 80; // 2x average
      if (ratio >= 1.5) return 60; // 1.5x average
      if (ratio >= 1.2) return 40; // 1.2x average

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze spending frequency
   * Multiple transactions in short period suggests impulse
   */
  static async analyzeFrequency(userId, transaction) {
    try {
      // Check transactions in last 3 hours
      const threeHoursAgo = new Date(transaction.date);
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

      const recentTransactions = await FinancialTransaction.countDocuments({
        userId,
        type: 'expense',
        date: { $gte: threeHoursAgo, $lt: transaction.date },
        isDeleted: false
      });

      // More transactions in 3 hours = higher impulse score
      if (recentTransactions >= 5) return 100;
      if (recentTransactions >= 4) return 80;
      if (recentTransactions >= 3) return 60;
      if (recentTransactions >= 2) return 40;

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze mood from daily log
   * Low mood correlates with emotional spending
   */
  static async analyzeMood(userId, transaction) {
    try {
      // If transaction has mood, use it
      if (transaction.mood) {
        if (transaction.mood <= 3) return 100; // Very low mood
        if (transaction.mood <= 5) return 60; // Low mood
        if (transaction.mood >= 8) return 30; // High mood (celebration spending)
        return 0;
      }

      // Otherwise, check daily log for that date
      const dateStr = transaction.date.toISOString().split('T')[0];
      const logs = await DailyLog.find({
        userId,
        date: dateStr
      });

      if (logs.length === 0 || !logs[0].mood) return 0;

      const mood = logs[0].mood;
      if (mood <= 3) return 100;
      if (mood <= 5) return 60;
      if (mood >= 8) return 30;

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze habit completion status
   * Spending during missed habits suggests compensation
   */
  static async analyzeHabitStatus(userId, transaction) {
    try {
      const dateStr = transaction.date.toISOString().split('T')[0];

      const logs = await DailyLog.find({
        userId,
        date: dateStr
      });

      if (logs.length === 0) return 0;

      const totalHabits = logs.length;
      const completedHabits = logs.filter(log => log.completed || log.value > 0).length;

      const completionRate = completedHabits / totalHabits;

      // Lower completion rate = higher impulse score
      if (completionRate <= 0.3) return 100; // 30% or less completed
      if (completionRate <= 0.5) return 60; // 50% or less completed
      if (completionRate <= 0.7) return 30; // 70% or less completed

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze category
   * Some categories are more impulse-prone than others
   */
  static analyzeCategory(transaction) {
    const impulsiveCategories = {
      'entertainment': 80,
      'shopping': 90,
      'dining_out': 70,
      'fast_food': 85,
      'online_shopping': 95,
      'snacks': 75,
      'alcohol': 80,
      'gaming': 70,
      'subscriptions': 60
    };

    const category = transaction.category?.toLowerCase() || '';
    return impulsiveCategories[category] || 0;
  }

  /**
   * Calculate confidence based on number of signals
   */
  static calculateConfidence(reasons) {
    // More signals = higher confidence
    if (reasons.length >= 5) return 'high';
    if (reasons.length >= 3) return 'medium';
    if (reasons.length >= 1) return 'low';
    return 'very_low';
  }

  /**
   * Get time description
   */
  static getTimeDescription(transaction) {
    const hour = transaction.time
      ? parseInt(transaction.time.split(':')[0])
      : new Date(transaction.date).getHours();

    if (hour >= 22 || hour < 2) return 'Late night spending (10 PM - 2 AM)';
    if (hour >= 2 && hour < 6) return 'Very early morning spending (2 AM - 6 AM)';
    if (hour >= 18 && hour < 22) return 'Evening spending (6 PM - 10 PM)';
    if (hour >= 12 && hour < 14) return 'Lunch hour spending';
    return 'Normal hours';
  }

  /**
   * Get day description
   */
  static getDayDescription(transaction) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = new Date(transaction.date).getDay();
    const dayName = days[day];

    if (day === 5) return `${dayName} - Pre-weekend spending`;
    if (day === 6) return `${dayName} - Weekend spending`;
    if (day === 0) return `${dayName} - Weekend spending`;
    if (day === 1) return `${dayName} - Post-weekend spending`;
    return dayName;
  }
}

export default ImpulseDetector;
