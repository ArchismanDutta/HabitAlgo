import mongoose from 'mongoose';

const FinancialGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['savings', 'debt_payoff', 'investment', 'purchase', 'emergency_fund', 'other'],
    index: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be positive'],
    get: v => Math.round(v * 100) / 100
  },
  currentAmount: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Linked account (for goal-based accounts)
  linkedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    default: null
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  // Monthly contribution goal
  monthlyContribution: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Priority (1 = highest)
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  description: {
    type: String,
    default: null
  },
  // Category for purchase goals
  category: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#10b981'
  },
  icon: {
    type: String,
    default: 'target'
  },
  // Milestones
  milestones: [{
    name: String,
    amount: Number,
    achieved: { type: Boolean, default: false },
    achievedDate: Date
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isAchieved: {
    type: Boolean,
    default: false,
    index: true
  },
  achievedDate: {
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
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Compound indexes
FinancialGoalSchema.index({ userId: 1, isActive: 1 });
FinancialGoalSchema.index({ userId: 1, type: 1 });
FinancialGoalSchema.index({ userId: 1, targetDate: 1 });

// Update timestamp on save
FinancialGoalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Check if goal is achieved
  if (this.currentAmount >= this.targetAmount && !this.isAchieved) {
    this.isAchieved = true;
    this.achievedDate = new Date();
  }

  // Check milestones
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.forEach(milestone => {
      if (this.currentAmount >= milestone.amount && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
      }
    });
  }

  next();
});

// Virtual for progress percentage
FinancialGoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Virtual for remaining amount
FinancialGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for days remaining
FinancialGoalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const target = new Date(this.targetDate);
  const diff = target - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual for required monthly savings
FinancialGoalSchema.virtual('requiredMonthlySavings').get(function() {
  const remaining = this.remainingAmount;
  const monthsRemaining = Math.max(1, Math.ceil(this.daysRemaining / 30));
  return Math.round((remaining / monthsRemaining) * 100) / 100;
});

// Virtual for on track status
FinancialGoalSchema.virtual('onTrack').get(function() {
  const expectedProgress = this.calculateExpectedProgress();
  return this.progressPercentage >= expectedProgress;
});

// Instance method to calculate expected progress
FinancialGoalSchema.methods.calculateExpectedProgress = function() {
  const startDate = new Date(this.createdAt);
  const targetDate = new Date(this.targetDate);
  const today = new Date();

  const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) return 100;
  return Math.min(100, Math.round((elapsedDays / totalDays) * 100));
};

// Instance method to add contribution
FinancialGoalSchema.methods.addContribution = function(amount) {
  this.currentAmount += amount;

  // Check milestones
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.forEach(milestone => {
      if (this.currentAmount >= milestone.amount && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
      }
    });
  }

  // Check if goal achieved
  if (this.currentAmount >= this.targetAmount && !this.isAchieved) {
    this.isAchieved = true;
    this.achievedDate = new Date();
  }

  return this.save();
};

// Static method to get active goals
FinancialGoalSchema.statics.getActiveGoals = function(userId) {
  return this.find({ userId, isActive: true, isAchieved: false })
    .populate('linkedAccountId', 'name type currentBalance')
    .sort({ priority: 1, targetDate: 1 });
};

// Static method to get achieved goals
FinancialGoalSchema.statics.getAchievedGoals = function(userId) {
  return this.find({ userId, isAchieved: true })
    .populate('linkedAccountId', 'name type currentBalance')
    .sort({ achievedDate: -1 });
};

export default mongoose.model('FinancialGoal', FinancialGoalSchema);
