import mongoose from 'mongoose';

/**
 * FinancialSummary - Cached monthly financial summaries for performance
 *
 * Similar to MonthlySummary for habits, this model caches computed
 * monthly financial metrics to avoid expensive aggregations.
 */

const FinancialSummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    index: true
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12,
    index: true
  },
  // Income
  totalIncome: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  incomeByCategory: [{
    category: String,
    amount: Number,
    count: Number
  }],
  // Expenses
  totalExpenses: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  expensesByCategory: [{
    category: String,
    amount: Number,
    count: Number,
    avgAmount: Number
  }],
  // Net savings
  netSavings: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  savingsRate: {
    type: Number, // Percentage
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Transaction counts
  totalTransactions: {
    type: Number,
    default: 0
  },
  incomeTransactions: {
    type: Number,
    default: 0
  },
  expenseTransactions: {
    type: Number,
    default: 0
  },
  transferTransactions: {
    type: Number,
    default: 0
  },
  // Averages
  avgDailyExpense: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  avgTransactionAmount: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Largest transaction
  largestExpense: {
    amount: Number,
    category: String,
    description: String,
    date: Date
  },
  largestIncome: {
    amount: Number,
    category: String,
    description: String,
    date: Date
  },
  // Day-wise breakdown
  expensesByDay: [{
    date: Date,
    amount: Number,
    count: Number
  }],
  // Payment methods
  paymentMethodBreakdown: [{
    method: String,
    amount: Number,
    count: Number
  }],
  // Impulse spending
  impulseSpending: {
    total: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  // Budget adherence
  budgetAdherence: {
    totalBudget: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    adherenceRate: { type: Number, default: 0 } // Percentage
  },
  // Account balances at end of month
  accountBalances: [{
    accountId: mongoose.Schema.Types.ObjectId,
    accountName: String,
    balance: Number
  }],
  // Net worth at end of month
  netWorth: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Top spending days
  topSpendingDays: [{
    date: Date,
    amount: Number,
    transactionCount: Number
  }],
  // Day of week patterns
  dayOfWeekPattern: [{
    day: String, // Monday, Tuesday, etc.
    avgSpending: Number,
    transactionCount: Number
  }],
  // Financial health score (0-100)
  healthScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  // Last calculated timestamp
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes
FinancialSummarySchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
FinancialSummarySchema.index({ userId: 1, year: -1, month: -1 });

// Update timestamp on save
FinancialSummarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get or create summary for a month
FinancialSummarySchema.statics.getOrCreate = async function(userId, year, month) {
  let summary = await this.findOne({ userId, year, month });

  if (!summary) {
    summary = await this.create({
      userId,
      year,
      month,
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingsRate: 0,
      totalTransactions: 0,
      calculatedAt: new Date()
    });
  }

  return summary;
};

// Static method to recalculate summary from transactions
FinancialSummarySchema.statics.recalculate = async function(userId, year, month) {
  const FinancialTransaction = mongoose.model('FinancialTransaction');
  const Budget = mongoose.model('Budget');
  const FinancialAccount = mongoose.model('FinancialAccount');

  // Get date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Get all transactions for the month
  const transactions = await FinancialTransaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false
  }).sort({ date: 1 });

  // Initialize summary
  let summary = await this.getOrCreate(userId, year, month);

  // Calculate income
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  summary.totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  summary.incomeTransactions = incomeTransactions.length;

  // Income by category
  const incomeByCat = {};
  incomeTransactions.forEach(t => {
    if (!incomeByCat[t.category]) {
      incomeByCat[t.category] = { amount: 0, count: 0 };
    }
    incomeByCat[t.category].amount += t.amount;
    incomeByCat[t.category].count += 1;
  });
  summary.incomeByCategory = Object.keys(incomeByCat).map(cat => ({
    category: cat,
    amount: incomeByCat[cat].amount,
    count: incomeByCat[cat].count
  }));

  // Calculate expenses
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  summary.totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  summary.expenseTransactions = expenseTransactions.length;

  // Expenses by category
  const expenseByCat = {};
  expenseTransactions.forEach(t => {
    if (!expenseByCat[t.category]) {
      expenseByCat[t.category] = { amount: 0, count: 0 };
    }
    expenseByCat[t.category].amount += t.amount;
    expenseByCat[t.category].count += 1;
  });
  summary.expensesByCategory = Object.keys(expenseByCat).map(cat => ({
    category: cat,
    amount: expenseByCat[cat].amount,
    count: expenseByCat[cat].count,
    avgAmount: expenseByCat[cat].amount / expenseByCat[cat].count
  })).sort((a, b) => b.amount - a.amount);

  // Net savings
  summary.netSavings = summary.totalIncome - summary.totalExpenses;
  summary.savingsRate = summary.totalIncome > 0
    ? (summary.netSavings / summary.totalIncome) * 100
    : 0;

  // Transaction counts
  summary.totalTransactions = transactions.length;
  summary.transferTransactions = transactions.filter(t => t.type === 'transfer').length;

  // Averages
  const daysInMonth = new Date(year, month, 0).getDate();
  summary.avgDailyExpense = summary.totalExpenses / daysInMonth;
  summary.avgTransactionAmount = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
    : 0;

  // Largest transactions
  const sortedExpenses = expenseTransactions.sort((a, b) => b.amount - a.amount);
  if (sortedExpenses.length > 0) {
    const largest = sortedExpenses[0];
    summary.largestExpense = {
      amount: largest.amount,
      category: largest.category,
      description: largest.description,
      date: largest.date
    };
  }

  const sortedIncome = incomeTransactions.sort((a, b) => b.amount - a.amount);
  if (sortedIncome.length > 0) {
    const largest = sortedIncome[0];
    summary.largestIncome = {
      amount: largest.amount,
      category: largest.category,
      description: largest.description,
      date: largest.date
    };
  }

  // Expenses by day
  const expensesByDay = {};
  expenseTransactions.forEach(t => {
    const dateStr = t.date.toISOString().split('T')[0];
    if (!expensesByDay[dateStr]) {
      expensesByDay[dateStr] = { amount: 0, count: 0 };
    }
    expensesByDay[dateStr].amount += t.amount;
    expensesByDay[dateStr].count += 1;
  });
  summary.expensesByDay = Object.keys(expensesByDay).map(dateStr => ({
    date: new Date(dateStr),
    amount: expensesByDay[dateStr].amount,
    count: expensesByDay[dateStr].count
  })).sort((a, b) => a.date - b.date);

  // Top spending days
  summary.topSpendingDays = [...summary.expensesByDay]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Payment method breakdown
  const paymentMethodBreakdown = {};
  transactions.forEach(t => {
    if (!paymentMethodBreakdown[t.paymentMethod]) {
      paymentMethodBreakdown[t.paymentMethod] = { amount: 0, count: 0 };
    }
    paymentMethodBreakdown[t.paymentMethod].amount += t.amount;
    paymentMethodBreakdown[t.paymentMethod].count += 1;
  });
  summary.paymentMethodBreakdown = Object.keys(paymentMethodBreakdown).map(method => ({
    method,
    amount: paymentMethodBreakdown[method].amount,
    count: paymentMethodBreakdown[method].count
  }));

  // Impulse spending
  const impulseTransactions = expenseTransactions.filter(t => t.isImpulsive);
  summary.impulseSpending = {
    total: impulseTransactions.reduce((sum, t) => sum + t.amount, 0),
    count: impulseTransactions.length,
    percentage: summary.totalExpenses > 0
      ? (impulseTransactions.reduce((sum, t) => sum + t.amount, 0) / summary.totalExpenses) * 100
      : 0
  };

  // Budget adherence
  const budgets = await Budget.find({ userId, isActive: true });
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  summary.budgetAdherence = {
    totalBudget,
    totalSpent: summary.totalExpenses,
    adherenceRate: totalBudget > 0
      ? Math.min(100, ((totalBudget - summary.totalExpenses) / totalBudget) * 100)
      : 0
  };

  // Day of week pattern
  const dayOfWeekPattern = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dayNames.forEach(day => {
    dayOfWeekPattern[day] = { total: 0, count: 0 };
  });

  expenseTransactions.forEach(t => {
    const day = dayNames[new Date(t.date).getDay()];
    dayOfWeekPattern[day].total += t.amount;
    dayOfWeekPattern[day].count += 1;
  });

  summary.dayOfWeekPattern = Object.keys(dayOfWeekPattern).map(day => ({
    day,
    avgSpending: dayOfWeekPattern[day].count > 0
      ? dayOfWeekPattern[day].total / dayOfWeekPattern[day].count
      : 0,
    transactionCount: dayOfWeekPattern[day].count
  }));

  // Account balances at end of month
  const accounts = await FinancialAccount.find({ userId, isActive: true });
  summary.accountBalances = accounts.map(acc => ({
    accountId: acc._id,
    accountName: acc.name,
    balance: acc.currentBalance
  }));

  // Net worth
  const netWorthData = await FinancialAccount.calculateNetWorth(userId);
  summary.netWorth = netWorthData.netWorth;

  // Financial health score (simple algorithm)
  summary.healthScore = calculateHealthScore({
    savingsRate: summary.savingsRate,
    budgetAdherence: summary.budgetAdherence.adherenceRate,
    impulsePercentage: summary.impulseSpending.percentage,
    netWorth: summary.netWorth
  });

  summary.calculatedAt = new Date();
  await summary.save();

  return summary;
};

// Helper function to calculate financial health score
function calculateHealthScore(metrics) {
  let score = 0;

  // Savings rate (0-40 points)
  if (metrics.savingsRate >= 30) score += 40;
  else if (metrics.savingsRate >= 20) score += 30;
  else if (metrics.savingsRate >= 10) score += 20;
  else if (metrics.savingsRate >= 0) score += 10;

  // Budget adherence (0-30 points)
  if (metrics.budgetAdherence >= 80) score += 30;
  else if (metrics.budgetAdherence >= 60) score += 20;
  else if (metrics.budgetAdherence >= 40) score += 10;

  // Impulse spending (0-20 points) - lower is better
  if (metrics.impulsePercentage <= 5) score += 20;
  else if (metrics.impulsePercentage <= 10) score += 15;
  else if (metrics.impulsePercentage <= 20) score += 10;
  else if (metrics.impulsePercentage <= 30) score += 5;

  // Net worth (0-10 points)
  if (metrics.netWorth > 100000) score += 10;
  else if (metrics.netWorth > 50000) score += 7;
  else if (metrics.netWorth > 0) score += 5;

  return Math.min(100, Math.max(0, score));
}

export default mongoose.model('FinancialSummary', FinancialSummarySchema);
