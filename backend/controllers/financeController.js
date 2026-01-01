import FinancialAccount from '../models/FinancialAccount.js';
import FinancialTransaction from '../models/FinancialTransaction.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Budget from '../models/Budget.js';
import MerchantMemory from '../models/MerchantMemory.js';
import LedgerEngine from '../utils/ledgerEngine.js';
import ImpulseDetector from '../utils/impulseDetector.js';

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

/**
 * @desc    Get all accounts for user
 * @route   GET /api/v1/finance/accounts
 * @access  Private
 */
export const getAccounts = async (req, res) => {
  try {
    const { active } = req.query;

    const query = { userId: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const accounts = await FinancialAccount.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single account
 * @route   GET /api/v1/finance/accounts/:id
 * @access  Private
 */
export const getAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching account',
      error: error.message
    });
  }
};

/**
 * @desc    Create new account
 * @route   POST /api/v1/finance/accounts
 * @access  Private
 */
export const createAccount = async (req, res) => {
  try {
    const { openingBalance, ...accountData } = req.body;

    // For credit cards and loans, opening balance should be negative (liability)
    // Users might enter as positive, so we convert it
    let initialBalance = openingBalance || 0;
    if ((accountData.type === 'credit_card' || accountData.type === 'loan') && initialBalance > 0) {
      initialBalance = -initialBalance;
    }

    const account = await FinancialAccount.create({
      ...accountData,
      userId: req.user._id,
      currentBalance: initialBalance // Set initial balance
    });

    // If opening balance is provided and non-zero, create opening balance transaction
    if (initialBalance && initialBalance !== 0) {
      const FinancialTransaction = (await import('../models/FinancialTransaction.js')).default;

      const openingTransaction = await FinancialTransaction.create({
        userId: req.user._id,
        type: initialBalance > 0 ? 'deposit' : 'withdrawal',
        amount: Math.abs(initialBalance),
        date: new Date(),
        accountId: account._id,
        category: 'other',
        description: 'Opening Balance',
        paymentMethod: 'other',
        isRecurring: false,
        isImpulsive: false,
        isPlanned: true,
        impulseScore: 0,
        reconciled: true,
        autoCategorized: false,
        userCorrected: false,
        isDeleted: false
      });

      // Create ledger entries for the opening balance
      await LedgerEngine.createEntriesForTransaction(openingTransaction);
    }

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

/**
 * @desc    Update account
 * @route   PUT /api/v1/finance/accounts/:id
 * @access  Private
 */
export const updateAccount = async (req, res) => {
  try {
    // Don't allow manual balance updates or opening balance changes
    const { currentBalance, openingBalance, ...updateData } = req.body;

    const account = await FinancialAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating account',
      error: error.message
    });
  }
};

/**
 * @desc    Delete account (soft delete)
 * @route   DELETE /api/v1/finance/accounts/:id
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    account.isActive = false;
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account archived',
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

/**
 * @desc    Get net worth
 * @route   GET /api/v1/finance/networth
 * @access  Private
 */
export const getNetWorth = async (req, res) => {
  try {
    const netWorthData = await FinancialAccount.calculateNetWorth(req.user._id);

    res.status(200).json({
      success: true,
      data: netWorthData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating net worth',
      error: error.message
    });
  }
};

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

/**
 * @desc    Get all transactions
 * @route   GET /api/v1/finance/transactions
 * @access  Private
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      accountId,
      isImpulsive,
      limit = 100,
      offset = 0
    } = req.query;

    const query = {
      userId: req.user._id,
      isDeleted: false
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (accountId) query.accountId = accountId;
    if (isImpulsive !== undefined) query.isImpulsive = isImpulsive === 'true';

    const transactions = await FinancialTransaction.find(query)
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon')
      .populate('linkedHabitId', 'name category')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await FinancialTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get transactions for a specific date
 * @route   GET /api/v1/finance/transactions/date/:date
 * @access  Private
 */
export const getTransactionsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const transactions = await FinancialTransaction.getByDate(req.user._id, new Date(date));

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/v1/finance/transactions/:id
 * @access  Private
 */
export const getTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon')
      .populate('linkedHabitId', 'name category');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Also get ledger entries for this transaction
    const ledgerEntries = await LedgerEntry.getEntriesForTransaction(transaction._id);

    res.status(200).json({
      success: true,
      data: {
        transaction,
        ledgerEntries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Create new transaction
 * @route   POST /api/v1/finance/transactions
 * @access  Private
 */
export const createTransaction = async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user._id
    };

    // Auto-categorize if merchant is provided
    if (transactionData.merchant && !transactionData.category) {
      const suggestion = await MerchantMemory.getSuggestion(
        req.user._id,
        transactionData.merchant
      );

      if (suggestion && suggestion.autoApply) {
        transactionData.category = suggestion.category;
        transactionData.subcategory = suggestion.subcategory;
        transactionData.autoCategorized = true;
        transactionData.tags = suggestion.typicalTags || [];
      }
    }

    // Detect impulse spending
    if (transactionData.type === 'expense') {
      const impulseData = await ImpulseDetector.detectImpulse(req.user._id, transactionData);
      transactionData.isImpulsive = impulseData.isImpulsive;
      transactionData.impulseScore = impulseData.score;
    }

    // Create transaction
    const transaction = await FinancialTransaction.create(transactionData);

    // Create ledger entries
    await LedgerEngine.createEntriesForTransaction(transaction);

    // Update budget if applicable
    if (transaction.type === 'expense') {
      const budget = await Budget.findBudgetForTransaction(req.user._id, transaction);
      if (budget) {
        const result = budget.addSpending(transaction.amount);

        // Check if budget needs reset
        if (budget.needsReset()) {
          budget.resetBudget();
        }

        await budget.save();
        transaction.budgetId = budget._id;
        await transaction.save();

        if (result.alertTriggered) {
          // In a real app, send notification here
          console.log(`Budget alert: ${budget.name} reached ${budget.alertThreshold}%`);
        }
      }
    }

    // Learn from this transaction
    if (transaction.merchant) {
      await MerchantMemory.learnFromTransaction(req.user._id, transaction);
    }

    // Populate and return
    await transaction.populate('accountId', 'name type color icon');
    await transaction.populate('toAccountId', 'name type color icon');

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/v1/finance/transactions/:id
 * @access  Private
 */
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if category was corrected by user
    if (transaction.autoCategorized && req.body.category && req.body.category !== transaction.category) {
      transaction.userCorrected = true;
      transaction.originalCategory = transaction.category;

      // Learn from correction
      if (transaction.merchant) {
        await MerchantMemory.learnFromTransaction(req.user._id, {
          ...transaction.toObject(),
          category: req.body.category,
          subcategory: req.body.subcategory
        });
      }
    }

    // Update transaction
    Object.assign(transaction, req.body);

    // If amount changed, need to update ledger
    if (req.body.amount && req.body.amount !== transaction.amount) {
      // Delete old ledger entries
      await LedgerEngine.deleteEntriesForTransaction(transaction._id);

      // Create new ones
      await LedgerEngine.createEntriesForTransaction(transaction);
    }

    await transaction.save();

    await transaction.populate('accountId', 'name type color icon');
    await transaction.populate('toAccountId', 'name type color icon');

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/v1/finance/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Soft delete
    transaction.isDeleted = true;
    await transaction.save();

    // Delete ledger entries and reverse balance updates
    await LedgerEngine.deleteEntriesForTransaction(transaction._id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk create transactions
 * @route   POST /api/v1/finance/transactions/bulk
 * @access  Private
 */
export const bulkCreateTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions array is required'
      });
    }

    const created = [];
    const errors = [];

    for (const txData of transactions) {
      try {
        const transactionData = {
          ...txData,
          userId: req.user._id
        };

        const transaction = await FinancialTransaction.create(transactionData);
        await LedgerEngine.createEntriesForTransaction(transaction);
        created.push(transaction);
      } catch (error) {
        errors.push({
          transaction: txData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      created: created.length,
      errors: errors.length,
      data: created,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk creating transactions',
      error: error.message
    });
  }
};
