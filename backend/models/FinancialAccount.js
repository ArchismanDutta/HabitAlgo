import mongoose from 'mongoose';

const FinancialAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Account name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Account type is required'],
    enum: {
      values: ['bank_checking', 'bank_savings', 'credit_card', 'wallet', 'cash', 'investment', 'loan', 'goal'],
      message: '{VALUE} is not a valid account type'
    },
    index: true
  },
  subtype: {
    type: String,
    enum: ['emergency_fund', 'travel_fund', 'house_fund', 'education_fund', 'retirement', 'other'],
    default: null
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  // Computed balance - NEVER set manually, always calculated from ledger
  currentBalance: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100 // Round to 2 decimal places
  },
  // For credit cards - the credit limit
  creditLimit: {
    type: Number,
    default: null
  },
  // For loans - original loan amount
  originalAmount: {
    type: Number,
    default: null
  },
  // For goals - target amount
  targetAmount: {
    type: Number,
    default: null
  },
  // For goals - target date
  targetDate: {
    type: Date,
    default: null
  },
  // Account metadata
  accountNumber: {
    type: String,
    default: null,
    select: false // Don't return by default for security
  },
  bankName: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  icon: {
    type: String,
    default: 'wallet'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Tracking
  lastTransactionDate: {
    type: Date,
    default: null
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

// Compound index for user + active accounts
FinancialAccountSchema.index({ userId: 1, isActive: 1 });
FinancialAccountSchema.index({ userId: 1, type: 1 });

// Update timestamp on save
FinancialAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for available credit (for credit cards)
FinancialAccountSchema.virtual('availableCredit').get(function() {
  if (this.type === 'credit_card' && this.creditLimit) {
    // Credit card balance is negative (liability), so available = limit - abs(balance)
    return this.creditLimit + this.currentBalance; // currentBalance is negative
  }
  return null;
});

// Virtual for goal progress percentage
FinancialAccountSchema.virtual('goalProgress').get(function() {
  if (this.type === 'goal' && this.targetAmount) {
    return Math.round((this.currentBalance / this.targetAmount) * 100);
  }
  return null;
});

// Static method to get all active accounts for a user
FinancialAccountSchema.statics.getActiveAccounts = function(userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get account by type
FinancialAccountSchema.statics.getAccountsByType = function(userId, type) {
  return this.find({ userId, type, isActive: true }).sort({ name: 1 });
};

// Static method to calculate total net worth
FinancialAccountSchema.statics.calculateNetWorth = async function(userId) {
  const accounts = await this.find({ userId, isActive: true });

  const assets = accounts
    .filter(acc => ['bank_checking', 'bank_savings', 'wallet', 'cash', 'investment', 'goal'].includes(acc.type))
    .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  const liabilities = accounts
    .filter(acc => ['credit_card', 'loan'].includes(acc.type))
    .reduce((sum, acc) => sum + Math.abs(acc.currentBalance || 0), 0);

  return {
    assets: assets || 0,
    liabilities: liabilities || 0,
    netWorth: (assets || 0) - (liabilities || 0)
  };
};

export default mongoose.model('FinancialAccount', FinancialAccountSchema);
