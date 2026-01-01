import mongoose from 'mongoose';

/**
 * LedgerEntry - The single source of truth for all financial events
 *
 * Every financial transaction creates ledger entries following double-entry bookkeeping:
 * - Total debits must equal total credits
 * - Each entry has one account and one direction (debit or credit)
 * - Balances are computed from ledger entries, never stored
 *
 * Examples:
 * 1. Income (salary ₹50,000):
 *    - DEBIT Bank Account ₹50,000
 *    - CREDIT Income ₹50,000
 *
 * 2. Expense (groceries ₹500):
 *    - DEBIT Expense:Groceries ₹500
 *    - CREDIT Bank Account ₹500
 *
 * 3. Transfer (Bank to Wallet ₹1,000):
 *    - DEBIT Wallet ₹1,000
 *    - CREDIT Bank ₹1,000
 *
 * 4. Credit Card Payment (₹5,000):
 *    - DEBIT Credit Card (reduces liability) ₹5,000
 *    - CREDIT Bank ₹5,000
 */

const LedgerEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Transaction group ID - all entries in one transaction share this
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialTransaction',
    required: true,
    index: true
  },
  // Date of the transaction
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    index: true
  },
  // Account this entry affects (can be null for virtual accounts like Income/Expense categories)
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialAccount',
    default: null,
    index: true
  },
  // Entry type
  entryType: {
    type: String,
    required: true,
    enum: ['debit', 'credit'],
    index: true
  },
  // Amount (always positive)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
    get: v => Math.round(v * 100) / 100
  },
  // Category for expense/income entries (when accountId is null)
  category: {
    type: String,
    default: null,
    index: true
  },
  // Subcategory
  subcategory: {
    type: String,
    default: null
  },
  // Description
  description: {
    type: String,
    default: null
  },
  // Merchant name (for learning and auto-categorization)
  merchant: {
    type: String,
    default: null,
    index: true
  },
  // Tags for flexible filtering
  tags: [{
    type: String,
    trim: true
  }],
  // Is this a reconciled entry (matched with bank statement)
  reconciled: {
    type: Boolean,
    default: false,
    index: true
  },
  // Created timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for efficient queries
LedgerEntrySchema.index({ userId: 1, date: -1 });
LedgerEntrySchema.index({ userId: 1, accountId: 1, date: -1 });
LedgerEntrySchema.index({ userId: 1, category: 1, date: -1 });
LedgerEntrySchema.index({ userId: 1, transactionId: 1 });
LedgerEntrySchema.index({ userId: 1, merchant: 1 });

// Static method to calculate account balance
LedgerEntrySchema.statics.calculateAccountBalance = async function(accountId, upToDate = new Date()) {
  const result = await this.aggregate([
    {
      $match: {
        accountId: new mongoose.Types.ObjectId(accountId),
        date: { $lte: upToDate }
      }
    },
    {
      $group: {
        _id: '$entryType',
        total: { $sum: '$amount' }
      }
    }
  ]);

  let debits = 0;
  let credits = 0;

  result.forEach(item => {
    if (item._id === 'debit') debits = item.total;
    if (item._id === 'credit') credits = item.total;
  });

  // For most accounts: balance = debits - credits
  // For liability accounts (credit cards, loans): balance = credits - debits (negative)
  return debits - credits;
};

// Static method to get all entries for a transaction
LedgerEntrySchema.statics.getEntriesForTransaction = function(transactionId) {
  return this.find({ transactionId }).sort({ entryType: 1 }); // debits first
};

// Static method to verify double-entry integrity
LedgerEntrySchema.statics.verifyDoubleEntry = async function(transactionId) {
  const entries = await this.find({ transactionId });

  const totalDebits = entries
    .filter(e => e.entryType === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = entries
    .filter(e => e.entryType === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const diff = Math.abs(totalDebits - totalCredits);
  return diff < 0.01; // Allow for floating point errors
};

// Static method to get entries by date range
LedgerEntrySchema.statics.getEntriesByDateRange = function(userId, startDate, endDate, options = {}) {
  const query = {
    userId,
    date: { $gte: startDate, $lte: endDate }
  };

  if (options.accountId) query.accountId = options.accountId;
  if (options.category) query.category = options.category;
  if (options.merchant) query.merchant = new RegExp(options.merchant, 'i');

  return this.find(query).sort({ date: -1, createdAt: -1 });
};

// Static method to get category-wise breakdown
LedgerEntrySchema.statics.getCategoryBreakdown = async function(userId, startDate, endDate, type = 'expense') {
  // For expenses, we look at debit entries with categories
  // For income, we look at credit entries with categories
  const entryType = type === 'expense' ? 'debit' : 'credit';

  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        entryType,
        category: { $ne: null },
        accountId: null // Category entries don't have accountId
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        subcategories: {
          $push: {
            subcategory: '$subcategory',
            amount: '$amount'
          }
        }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  return result.map(item => ({
    category: item._id,
    total: Math.round(item.total * 100) / 100,
    count: item.count,
    subcategories: item.subcategories.filter(s => s.subcategory)
  }));
};

export default mongoose.model('LedgerEntry', LedgerEntrySchema);
