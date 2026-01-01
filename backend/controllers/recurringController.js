import RecurringTransaction from '../models/RecurringTransaction.js';
import FinancialTransaction from '../models/FinancialTransaction.js';
import LedgerEngine from '../utils/ledgerEngine.js';

/**
 * @desc    Get all recurring transactions
 * @route   GET /api/v1/finance/recurring
 * @access  Private
 */
export const getRecurringTransactions = async (req, res) => {
  try {
    const { active } = req.query;

    const query = { userId: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const recurring = await RecurringTransaction.find(query)
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon')
      .sort({ nextScheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: recurring.length,
      data: recurring
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recurring transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get due recurring transactions
 * @route   GET /api/v1/finance/recurring/due
 * @access  Private
 */
export const getDueRecurring = async (req, res) => {
  try {
    const due = await RecurringTransaction.getDueTransactions(req.user._id);

    res.status(200).json({
      success: true,
      count: due.length,
      data: due
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching due recurring transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get upcoming recurring transactions
 * @route   GET /api/v1/finance/recurring/upcoming
 * @access  Private
 */
export const getUpcomingRecurring = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const upcoming = await RecurringTransaction.getUpcoming(req.user._id, parseInt(days));

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming recurring transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Create recurring transaction
 * @route   POST /api/v1/finance/recurring
 * @access  Private
 */
export const createRecurringTransaction = async (req, res) => {
  try {
    const recurringData = {
      ...req.body,
      userId: req.user._id
    };

    const recurring = await RecurringTransaction.create(recurringData);

    await recurring.populate('accountId', 'name type color icon');
    await recurring.populate('toAccountId', 'name type color icon');

    res.status(201).json({
      success: true,
      data: recurring
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating recurring transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Update recurring transaction
 * @route   PUT /api/v1/finance/recurring/:id
 * @access  Private
 */
export const updateRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon');

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recurring
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating recurring transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Delete recurring transaction
 * @route   DELETE /api/v1/finance/recurring/:id
 * @access  Private
 */
export const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    recurring.isActive = false;
    await recurring.save();

    res.status(200).json({
      success: true,
      message: 'Recurring transaction archived'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting recurring transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Execute recurring transaction (create actual transaction)
 * @route   POST /api/v1/finance/recurring/:id/execute
 * @access  Private
 */
export const executeRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Create actual transaction
    const transactionData = {
      userId: recurring.userId,
      type: recurring.type,
      amount: recurring.amount,
      date: new Date(),
      accountId: recurring.accountId,
      toAccountId: recurring.toAccountId,
      category: recurring.category,
      subcategory: recurring.subcategory,
      merchant: recurring.merchant,
      description: recurring.description || `${recurring.name} (Recurring)`,
      tags: recurring.tags,
      isRecurring: true,
      recurringTemplateId: recurring._id,
      isPlanned: true
    };

    const transaction = await FinancialTransaction.create(transactionData);
    await LedgerEngine.createEntriesForTransaction(transaction);

    // Mark recurring as created
    recurring.markCreated();
    await recurring.save();

    await transaction.populate('accountId', 'name type color icon');
    await transaction.populate('toAccountId', 'name type color icon');

    res.status(201).json({
      success: true,
      data: {
        transaction,
        recurring
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error executing recurring transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Auto-execute all due recurring transactions
 * @route   POST /api/v1/finance/recurring/auto-execute
 * @access  Private
 */
export const autoExecuteRecurring = async (req, res) => {
  try {
    const dueRecurring = await RecurringTransaction.find({
      userId: req.user._id,
      isActive: true,
      autoCreate: true,
      nextScheduledDate: { $lte: new Date() }
    });

    const executed = [];
    const errors = [];

    for (const recurring of dueRecurring) {
      try {
        const transactionData = {
          userId: recurring.userId,
          type: recurring.type,
          amount: recurring.amount,
          date: new Date(),
          accountId: recurring.accountId,
          toAccountId: recurring.toAccountId,
          category: recurring.category,
          subcategory: recurring.subcategory,
          merchant: recurring.merchant,
          description: recurring.description || `${recurring.name} (Auto)`,
          tags: recurring.tags,
          isRecurring: true,
          recurringTemplateId: recurring._id,
          isPlanned: true
        };

        const transaction = await FinancialTransaction.create(transactionData);
        await LedgerEngine.createEntriesForTransaction(transaction);

        recurring.markCreated();
        await recurring.save();

        executed.push({
          recurringId: recurring._id,
          transactionId: transaction._id,
          amount: transaction.amount
        });
      } catch (error) {
        errors.push({
          recurringId: recurring._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      executed: executed.length,
      errors: errors.length,
      data: executed,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error auto-executing recurring transactions',
      error: error.message
    });
  }
};
