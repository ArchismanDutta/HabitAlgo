import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true
  },
  // Budget can be for a category, subcategory, or merchant
  type: {
    type: String,
    required: true,
    enum: ['category', 'subcategory', 'merchant', 'total'],
    default: 'category'
  },
  category: {
    type: String,
    required: function() {
      return this.type === 'category' || this.type === 'subcategory';
    },
    index: true
  },
  subcategory: {
    type: String,
    default: null
  },
  merchant: {
    type: String,
    default: null
  },
  // Budget period
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  // Limit amount
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit must be positive'],
    get: v => Math.round(v * 100) / 100
  },
  // Current spent (calculated, not set manually)
  currentSpent: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Alert threshold (percentage)
  alertThreshold: {
    type: Number,
    default: 80, // Alert at 80% of budget
    min: 0,
    max: 100
  },
  // Has alert been sent for current period?
  alertSent: {
    type: Boolean,
    default: false
  },
  // Rollover unused budget to next period?
  rolloverUnused: {
    type: Boolean,
    default: false
  },
  // Carry over amount from previous period
  carryOver: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Start date for budget tracking
  startDate: {
    type: Date,
    default: Date.now
  },
  // End date (for finite budgets)
  endDate: {
    type: Date,
    default: null
  },
  // Color for UI
  color: {
    type: String,
    default: '#10b981'
  },
  // Icon
  icon: {
    type: String,
    default: 'target'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Last reset date (for recurring budgets)
  lastResetDate: {
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
BudgetSchema.index({ userId: 1, isActive: 1 });
BudgetSchema.index({ userId: 1, category: 1 });
BudgetSchema.index({ userId: 1, type: 1 });

// Update timestamp on save
BudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for remaining budget
BudgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.limit + this.carryOver - this.currentSpent);
});

// Virtual for percentage used
BudgetSchema.virtual('percentageUsed').get(function() {
  const total = this.limit + this.carryOver;
  if (total === 0) return 0;
  return Math.round((this.currentSpent / total) * 100);
});

// Virtual for status
BudgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= this.alertThreshold) return 'warning';
  return 'ok';
});

// Static method to get active budgets for user
BudgetSchema.statics.getActiveBudgets = function(userId) {
  return this.find({ userId, isActive: true }).sort({ category: 1 });
};

// Static method to find budget for a transaction
BudgetSchema.statics.findBudgetForTransaction = async function(userId, transaction) {
  // Try to find most specific budget first
  let budget = null;

  // 1. Check for merchant-specific budget
  if (transaction.merchant) {
    budget = await this.findOne({
      userId,
      type: 'merchant',
      merchant: transaction.merchant,
      isActive: true
    });
  }

  // 2. Check for subcategory budget
  if (!budget && transaction.subcategory) {
    budget = await this.findOne({
      userId,
      type: 'subcategory',
      category: transaction.category,
      subcategory: transaction.subcategory,
      isActive: true
    });
  }

  // 3. Check for category budget
  if (!budget && transaction.category) {
    budget = await this.findOne({
      userId,
      type: 'category',
      category: transaction.category,
      isActive: true
    });
  }

  // 4. Check for total budget
  if (!budget) {
    budget = await this.findOne({
      userId,
      type: 'total',
      isActive: true
    });
  }

  return budget;
};

// Instance method to check if budget needs reset
BudgetSchema.methods.needsReset = function() {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);

  switch (this.period) {
    case 'daily':
      return now.toDateString() !== lastReset.toDateString();
    case 'weekly':
      const weekDiff = Math.floor((now - lastReset) / (7 * 24 * 60 * 60 * 1000));
      return weekDiff >= 1;
    case 'monthly':
      return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
    case 'yearly':
      return now.getFullYear() !== lastReset.getFullYear();
    default:
      return false;
  }
};

// Instance method to reset budget
BudgetSchema.methods.resetBudget = function() {
  if (this.rolloverUnused && this.remaining > 0) {
    this.carryOver = this.remaining;
  } else {
    this.carryOver = 0;
  }

  this.currentSpent = 0;
  this.alertSent = false;
  this.lastResetDate = new Date();
};

// Instance method to add spending
BudgetSchema.methods.addSpending = function(amount) {
  this.currentSpent += amount;

  // Check if alert threshold reached
  if (!this.alertSent && this.percentageUsed >= this.alertThreshold) {
    this.alertSent = true;
    return { alertTriggered: true, status: this.status };
  }

  return { alertTriggered: false, status: this.status };
};

export default mongoose.model('Budget', BudgetSchema);
