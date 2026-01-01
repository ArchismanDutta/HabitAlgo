import Budget from '../models/Budget.js';
import FinancialTransaction from '../models/FinancialTransaction.js';

/**
 * @desc    Get all budgets for user
 * @route   GET /api/v1/finance/budgets
 * @access  Private
 */
export const getBudgets = async (req, res) => {
  try {
    const { active } = req.query;

    const query = { userId: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const budgets = await Budget.find(query).sort({ category: 1 });

    // Check if any budgets need reset
    for (const budget of budgets) {
      if (budget.needsReset()) {
        budget.resetBudget();
        await budget.save();
      }
    }

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets',
      error: error.message
    });
  }
};

/**
 * @desc    Get single budget
 * @route   GET /api/v1/finance/budgets/:id
 * @access  Private
 */
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budget',
      error: error.message
    });
  }
};

/**
 * @desc    Create new budget
 * @route   POST /api/v1/finance/budgets
 * @access  Private
 */
export const createBudget = async (req, res) => {
  try {
    const budgetData = {
      ...req.body,
      userId: req.user._id
    };

    const budget = await Budget.create(budgetData);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating budget',
      error: error.message
    });
  }
};

/**
 * @desc    Update budget
 * @route   PUT /api/v1/finance/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating budget',
      error: error.message
    });
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/v1/finance/budgets/:id
 * @access  Private
 */
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    budget.isActive = false;
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget archived'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting budget',
      error: error.message
    });
  }
};

/**
 * @desc    Recalculate budget spending
 * @route   POST /api/v1/finance/budgets/:id/recalculate
 * @access  Private
 */
export const recalculateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Get date range based on budget period
    const now = new Date();
    let startDate = new Date(budget.lastResetDate);

    // Get transactions for this budget
    const query = {
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: now },
      isDeleted: false
    };

    if (budget.type === 'category') {
      query.category = budget.category;
      if (budget.subcategory) {
        query.subcategory = budget.subcategory;
      }
    } else if (budget.type === 'merchant') {
      query.merchant = budget.merchant;
    }

    const transactions = await FinancialTransaction.find(query);
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    budget.currentSpent = totalSpent;
    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recalculating budget',
      error: error.message
    });
  }
};

/**
 * @desc    Reset all budgets for current period
 * @route   POST /api/v1/finance/budgets/reset
 * @access  Private
 */
export const resetAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true
    });

    let resetCount = 0;

    for (const budget of budgets) {
      if (budget.needsReset()) {
        budget.resetBudget();
        await budget.save();
        resetCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${resetCount} budgets reset`,
      resetCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting budgets',
      error: error.message
    });
  }
};
