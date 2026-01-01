import mongoose from 'mongoose';

/**
 * RecurringTransaction - Template for recurring transactions
 *
 * Examples:
 * - SIP (Systematic Investment Plan) - monthly
 * - EMI (Equated Monthly Installment) - monthly
 * - Subscriptions (Netflix, Spotify) - monthly/yearly
 * - Salary - monthly
 * - Rent - monthly
 * - Electricity bill - monthly
 * - Insurance premium - yearly
 */

const RecurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Recurring transaction name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income', 'transfer', 'investment'],
    index: true
  },
  // Recurring type
  recurringType: {
    type: String,
    required: true,
    enum: ['sip', 'emi', 'subscription', 'salary', 'bill', 'rent', 'other'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    get: v => Math.round(v * 100) / 100
  },
  // Frequency
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  // Day of month (1-31) for monthly transactions
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  // Day of week (0-6) for weekly transactions
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: null
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    required: true
  },
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    default: null
  },
  category: {
    type: String,
    required: function() {
      return ['expense', 'income'].includes(this.type);
    }
  },
  subcategory: {
    type: String,
    default: null
  },
  merchant: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Start date
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  // End date (for finite recurring transactions like EMIs)
  endDate: {
    type: Date,
    default: null
  },
  // Number of installments (for EMIs)
  totalInstallments: {
    type: Number,
    default: null
  },
  completedInstallments: {
    type: Number,
    default: 0
  },
  // Auto-create transaction?
  autoCreate: {
    type: Boolean,
    default: false
  },
  // Remind user before transaction?
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  // Days before to remind
  reminderDaysBefore: {
    type: Number,
    default: 3,
    min: 0,
    max: 30
  },
  // Last created transaction date
  lastCreatedDate: {
    type: Date,
    default: null
  },
  // Next scheduled date
  nextScheduledDate: {
    type: Date,
    default: null,
    index: true
  },
  // Color and icon for UI
  color: {
    type: String,
    default: '#3b82f6'
  },
  icon: {
    type: String,
    default: 'repeat'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
RecurringTransactionSchema.index({ userId: 1, isActive: 1 });
RecurringTransactionSchema.index({ userId: 1, nextScheduledDate: 1 });
RecurringTransactionSchema.index({ userId: 1, recurringType: 1 });

// Update timestamp on save
RecurringTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Calculate next scheduled date if not set
  if (!this.nextScheduledDate) {
    this.nextScheduledDate = this.calculateNextDate(this.startDate);
  }

  next();
});

// Virtual for progress (for EMIs)
RecurringTransactionSchema.virtual('progress').get(function() {
  if (this.totalInstallments) {
    return Math.round((this.completedInstallments / this.totalInstallments) * 100);
  }
  return null;
});

// Virtual for remaining installments
RecurringTransactionSchema.virtual('remainingInstallments').get(function() {
  if (this.totalInstallments) {
    return Math.max(0, this.totalInstallments - this.completedInstallments);
  }
  return null;
});

// Virtual for total amount (for EMIs)
RecurringTransactionSchema.virtual('totalAmount').get(function() {
  if (this.totalInstallments) {
    return this.amount * this.totalInstallments;
  }
  return null;
});

// Instance method to calculate next date
RecurringTransactionSchema.methods.calculateNextDate = function(fromDate = new Date()) {
  const date = new Date(fromDate);

  switch (this.frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      if (this.dayOfMonth) {
        date.setDate(Math.min(this.dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  // If end date is set and next date exceeds it, return null
  if (this.endDate && date > this.endDate) {
    return null;
  }

  return date;
};

// Instance method to check if transaction is due
RecurringTransactionSchema.methods.isDue = function() {
  if (!this.isActive || !this.nextScheduledDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduledDate = new Date(this.nextScheduledDate);
  scheduledDate.setHours(0, 0, 0, 0);

  return scheduledDate <= today;
};

// Instance method to mark as created
RecurringTransactionSchema.methods.markCreated = function() {
  this.lastCreatedDate = new Date();
  this.completedInstallments += 1;

  // Calculate next date
  this.nextScheduledDate = this.calculateNextDate(this.lastCreatedDate);

  // If no more dates (EMI completed), mark as inactive
  if (!this.nextScheduledDate) {
    this.isActive = false;
  }
};

// Static method to get due recurring transactions
RecurringTransactionSchema.statics.getDueTransactions = function(userId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    isActive: true,
    nextScheduledDate: { $lte: today }
  })
    .populate('accountId', 'name type color')
    .populate('toAccountId', 'name type color')
    .sort({ nextScheduledDate: 1 });
};

// Static method to get upcoming recurring transactions
RecurringTransactionSchema.statics.getUpcoming = function(userId, days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    userId,
    isActive: true,
    nextScheduledDate: { $gte: today, $lte: futureDate }
  })
    .populate('accountId', 'name type color')
    .populate('toAccountId', 'name type color')
    .sort({ nextScheduledDate: 1 });
};

// Static method to get all active recurring transactions
RecurringTransactionSchema.statics.getActive = function(userId) {
  return this.find({ userId, isActive: true })
    .populate('accountId', 'name type color')
    .populate('toAccountId', 'name type color')
    .sort({ nextScheduledDate: 1 });
};

export default mongoose.model('RecurringTransaction', RecurringTransactionSchema);
