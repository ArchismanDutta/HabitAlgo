import mongoose from 'mongoose';

// Embedded schema for payment history
const debtPaymentSchema = new mongoose.Schema({
  paymentDate: {
    type: String, // "YYYY-MM-DD" format
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  principalPaid: {
    type: Number,
    required: true
  },
  interestPaid: {
    type: Number,
    required: true
  },
  remainingBalance: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true, timestamps: true });

// Main debt schema
const debtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  debtName: {
    type: String,
    required: [true, 'Debt name is required'],
    trim: true,
    maxlength: [100, 'Debt name cannot exceed 100 characters']
  },
  debtType: {
    type: String,
    required: [true, 'Debt type is required'],
    enum: {
      values: ['mortgage', 'personal_loan', 'student_loan', 'business_loan', 'credit_card', 'car_loan', 'other'],
      message: '{VALUE} is not a valid debt type'
    },
    index: true
  },
  // Financial details
  originalAmount: {
    type: Number,
    required: [true, 'Original amount is required'],
    min: [0, 'Original amount must be positive']
  },
  currentBalance: {
    type: Number,
    required: true,
    default: function() {
      return this.originalAmount;
    }
  },
  interestRate: {
    type: Number, // Annual percentage rate
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate cannot exceed 100%']
  },
  monthlyPayment: {
    type: Number,
    required: [true, 'Monthly payment is required'],
    min: [0, 'Monthly payment must be positive']
  },
  minimumPayment: {
    type: Number,
    default: null,
    min: [0, 'Minimum payment must be positive']
  },
  // Dates
  startDate: {
    type: String, // "YYYY-MM-DD"
    required: [true, 'Start date is required']
  },
  dueDate: {
    type: Number, // Day of month (1-31)
    required: [true, 'Due date is required'],
    min: [1, 'Due date must be between 1 and 31'],
    max: [31, 'Due date must be between 1 and 31']
  },
  endDate: {
    type: String, // "YYYY-MM-DD" - estimated payoff date
    default: null
  },
  term: {
    type: Number, // Term in months
    default: null,
    min: [1, 'Term must be at least 1 month']
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'paid_off', 'paused', 'defaulted'],
    default: 'active',
    index: true
  },
  // Link to financial account (optional)
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    default: null
  },
  // Payment tracking
  totalPaid: {
    type: Number,
    default: 0
  },
  totalInterestPaid: {
    type: Number,
    default: 0
  },
  totalPrincipalPaid: {
    type: Number,
    default: 0
  },
  paymentsHistory: [debtPaymentSchema],
  // Metadata
  lenderName: {
    type: String,
    trim: true,
    default: null
  },
  accountNumber: {
    type: String,
    trim: true,
    default: null,
    select: false // Don't return by default for security
  },
  notes: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#ef4444' // Red for debt
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
debtSchema.index({ userId: 1, status: 1 });
debtSchema.index({ userId: 1, debtType: 1 });
debtSchema.index({ userId: 1, isActive: 1 });

// Virtuals
debtSchema.virtual('amountPaid').get(function() {
  return this.originalAmount - this.currentBalance;
});

debtSchema.virtual('payoffPercentage').get(function() {
  if (this.originalAmount === 0) return 0;
  return Math.round(((this.originalAmount - this.currentBalance) / this.originalAmount) * 10000) / 100;
});

debtSchema.virtual('remainingPercentage').get(function() {
  if (this.originalAmount === 0) return 0;
  return Math.round((this.currentBalance / this.originalAmount) * 10000) / 100;
});

debtSchema.virtual('monthlyInterest').get(function() {
  // Convert annual rate to monthly
  return (this.interestRate / 12 / 100) * this.currentBalance;
});

debtSchema.virtual('estimatedPayoffMonths').get(function() {
  if (this.monthlyPayment <= 0 || this.currentBalance <= 0) return 0;

  const monthlyRate = this.interestRate / 12 / 100;
  if (monthlyRate === 0) {
    return Math.ceil(this.currentBalance / this.monthlyPayment);
  }

  // Using loan payoff formula
  const months = -Math.log(1 - (this.currentBalance * monthlyRate) / this.monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
});

// Methods
debtSchema.methods.recordPayment = function(paymentData) {
  const { amount, paymentDate, principalPaid, interestPaid, notes } = paymentData;

  // Update balances
  this.currentBalance -= principalPaid;
  this.totalPaid += amount;
  this.totalPrincipalPaid += principalPaid;
  this.totalInterestPaid += interestPaid;

  // Add to payment history
  this.paymentsHistory.push({
    paymentDate,
    amount,
    principalPaid,
    interestPaid,
    remainingBalance: this.currentBalance,
    notes
  });

  // Update status if paid off
  if (this.currentBalance <= 0) {
    this.status = 'paid_off';
    this.currentBalance = 0;
  }

  return this.save();
};

// Static methods
debtSchema.statics.getActiveDebts = function(userId) {
  return this.find({ userId, status: 'active', isActive: true }).sort({ createdAt: -1 });
};

debtSchema.statics.getDebtsByType = function(userId, debtType) {
  return this.find({ userId, debtType, status: 'active', isActive: true }).sort({ debtName: 1 });
};

debtSchema.statics.calculateDebtSummary = async function(userId) {
  const debts = await this.find({ userId, isActive: true });

  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebts = debts.length;
  const runningDebts = activeDebts.length;

  const initialBalance = debts.reduce((sum, d) => sum + (Number(d.originalAmount) || 0), 0);
  const currentBalance = activeDebts.reduce((sum, d) => sum + (Number(d.currentBalance) || 0), 0);
  const totalPaid = debts.reduce((sum, d) => sum + (Number(d.totalPaid) || 0), 0);

  let paymentProgress = 0;
  if (initialBalance > 0 && isFinite(initialBalance) && isFinite(currentBalance)) {
    const progress = ((initialBalance - currentBalance) / initialBalance) * 10000;
    if (!isNaN(progress) && isFinite(progress)) {
      paymentProgress = Math.round(progress) / 100;
    }
  }

  // Final safety check
  if (isNaN(paymentProgress) || !isFinite(paymentProgress)) {
    paymentProgress = 0;
  }

  return {
    totalDebts,
    runningDebts,
    initialBalance,
    currentBalance,
    totalPaid,
    paymentProgress
  };
};

debtSchema.statics.getDebtBreakdown = async function(userId) {
  const debts = await this.find({ userId, status: 'active', isActive: true });

  const breakdown = {};
  debts.forEach(debt => {
    if (!breakdown[debt.debtType]) {
      breakdown[debt.debtType] = {
        type: debt.debtType,
        totalOriginal: 0,
        totalCurrent: 0,
        count: 0
      };
    }
    // Ensure we're adding valid numbers only
    const originalAmt = Number(debt.originalAmount) || 0;
    const currentBal = Number(debt.currentBalance) || 0;

    breakdown[debt.debtType].totalOriginal += originalAmt;
    breakdown[debt.debtType].totalCurrent += currentBal;
    breakdown[debt.debtType].count += 1;
  });

  // Final validation of all breakdown values
  Object.values(breakdown).forEach(item => {
    if (isNaN(item.totalOriginal) || !isFinite(item.totalOriginal)) {
      item.totalOriginal = 0;
    }
    if (isNaN(item.totalCurrent) || !isFinite(item.totalCurrent)) {
      item.totalCurrent = 0;
    }
  });

  return Object.values(breakdown);
};

debtSchema.statics.getPayoffProgress = async function(userId) {
  const debts = await this.find({ userId, status: 'active', isActive: true });

  const progressByType = {};
  debts.forEach(debt => {
    if (!progressByType[debt.debtType]) {
      progressByType[debt.debtType] = {
        type: debt.debtType,
        originalAmount: 0,
        currentBalance: 0,
        payoffPercentage: 0
      };
    }
    // Ensure we're adding valid numbers only
    const originalAmt = Number(debt.originalAmount) || 0;
    const currentBal = Number(debt.currentBalance) || 0;

    progressByType[debt.debtType].originalAmount += originalAmt;
    progressByType[debt.debtType].currentBalance += currentBal;
  });

  // Calculate percentages with validation
  Object.values(progressByType).forEach(item => {
    // Ensure amounts are valid numbers
    item.originalAmount = Number(item.originalAmount) || 0;
    item.currentBalance = Number(item.currentBalance) || 0;

    if (item.originalAmount > 0 && isFinite(item.originalAmount) && isFinite(item.currentBalance)) {
      const percentage = ((item.originalAmount - item.currentBalance) / item.originalAmount) * 100;

      // Triple check the calculated percentage is valid
      if (isNaN(percentage) || !isFinite(percentage)) {
        item.payoffPercentage = 0;
      } else {
        // Ensure valid number between 0-100
        item.payoffPercentage = Math.max(0, Math.min(100, Math.round(percentage * 100) / 100));
      }
    } else {
      item.payoffPercentage = 0;
    }

    // Final safety check
    if (isNaN(item.payoffPercentage) || !isFinite(item.payoffPercentage)) {
      item.payoffPercentage = 0;
    }
  });

  return Object.values(progressByType);
};

const Debt = mongoose.model('Debt', debtSchema);

export default Debt;
