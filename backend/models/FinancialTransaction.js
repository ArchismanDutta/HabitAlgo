import mongoose from 'mongoose';

/**
 * FinancialTransaction - User-facing transaction model
 *
 * This model represents what users see and interact with.
 * Behind the scenes, each transaction creates ledger entries.
 *
 * Transaction types:
 * - expense: Spending money (groceries, coffee, shopping)
 * - income: Receiving money (salary, freelance, gifts)
 * - transfer: Moving money between accounts
 * - credit_card_payment: Paying off credit card
 * - loan_payment: EMI or loan payment
 * - investment: SIP, mutual fund, stocks
 * - withdrawal: ATM withdrawal, cash out
 * - deposit: Cash deposit
 */

const FinancialTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Transaction type
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['expense', 'income', 'transfer', 'credit_card_payment', 'loan_payment', 'investment', 'withdrawal', 'deposit'],
      message: '{VALUE} is not a valid transaction type'
    },
    index: true
  },
  // Amount (always positive)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    get: v => Math.round(v * 100) / 100
  },
  // Transaction date
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    index: true,
    default: Date.now
  },
  // Time of transaction (for impulse detection)
  time: {
    type: String, // HH:mm format
    default: null
  },
  // Primary account (from where money goes for expenses, to where it comes for income)
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    required: [true, 'Account is required'],
    index: true
  },
  // For transfers - destination account
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    default: null
  },
  // Category (groceries, entertainment, salary, etc.)
  category: {
    type: String,
    required: function() {
      return ['expense', 'income'].includes(this.type);
    },
    index: true
  },
  // Subcategory
  subcategory: {
    type: String,
    default: null
  },
  // Merchant name
  merchant: {
    type: String,
    default: null,
    index: true
  },
  // Description/notes
  description: {
    type: String,
    default: null
  },
  // Tags for flexible categorization
  tags: [{
    type: String,
    trim: true
  }],
  // Is this a recurring transaction?
  isRecurring: {
    type: Boolean,
    default: false,
    index: true
  },
  // Reference to recurring transaction template
  recurringTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction',
    default: null
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: 'cash'
  },
  // Is this marked as impulsive?
  isImpulsive: {
    type: Boolean,
    default: false,
    index: true
  },
  // Is this planned or unplanned?
  isPlanned: {
    type: Boolean,
    default: false
  },
  // Impulse score (0-100, calculated automatically)
  impulseScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Linked habit (if expense is related to a habit)
  linkedHabitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    default: null
  },
  // Mood at time of transaction (for correlation)
  mood: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  // Location
  location: {
    type: String,
    default: null
  },
  // Attachments (receipts, bills)
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Budget this transaction belongs to
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    default: null
  },
  // Is this reconciled with bank statement?
  reconciled: {
    type: Boolean,
    default: false
  },
  // Auto-categorized by ML?
  autoCategorized: {
    type: Boolean,
    default: false
  },
  // User corrected auto-categorization (for learning)
  userCorrected: {
    type: Boolean,
    default: false
  },
  // Original category before correction
  originalCategory: {
    type: String,
    default: null
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
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
FinancialTransactionSchema.index({ userId: 1, date: -1 });
FinancialTransactionSchema.index({ userId: 1, type: 1, date: -1 });
FinancialTransactionSchema.index({ userId: 1, category: 1, date: -1 });
FinancialTransactionSchema.index({ userId: 1, accountId: 1, date: -1 });
FinancialTransactionSchema.index({ userId: 1, merchant: 1 });
FinancialTransactionSchema.index({ userId: 1, isImpulsive: 1, date: -1 });

// Update timestamp on save
FinancialTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for day of week (for pattern detection)
FinancialTransactionSchema.virtual('dayOfWeek').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(this.date).getDay()];
});

// Virtual for hour of day (for impulse detection)
FinancialTransactionSchema.virtual('hourOfDay').get(function() {
  if (this.time) {
    return parseInt(this.time.split(':')[0]);
  }
  return new Date(this.date).getHours();
});

// Static method to get transactions by date range
FinancialTransactionSchema.statics.getByDateRange = function(userId, startDate, endDate, options = {}) {
  const query = {
    userId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false
  };

  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;
  if (options.accountId) query.accountId = options.accountId;
  if (options.isImpulsive !== undefined) query.isImpulsive = options.isImpulsive;

  return this.find(query)
    .populate('accountId', 'name type color')
    .populate('toAccountId', 'name type color')
    .sort({ date: -1, createdAt: -1 });
};

// Static method to get transactions for a specific day
FinancialTransactionSchema.statics.getByDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  })
    .populate('accountId', 'name type color')
    .populate('toAccountId', 'name type color')
    .sort({ date: -1 });
};

// Static method to get total expenses for a period
FinancialTransactionSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

// Static method to get total income for a period
FinancialTransactionSchema.statics.getTotalIncome = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'income',
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

// Static method to get category-wise spending
FinancialTransactionSchema.statics.getCategoryWiseSpending = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

export default mongoose.model('FinancialTransaction', FinancialTransactionSchema);
