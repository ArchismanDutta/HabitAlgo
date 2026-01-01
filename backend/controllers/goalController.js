import FinancialGoal from '../models/FinancialGoal.js';

/**
 * @desc    Get all goals for user
 * @route   GET /api/v1/finance/goals
 * @access  Private
 */
export const getGoals = async (req, res) => {
  try {
    const { active, achieved } = req.query;

    const query = { userId: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    if (achieved !== undefined) {
      query.isAchieved = achieved === 'true';
    }

    const goals = await FinancialGoal.find(query)
      .populate('linkedAccountId', 'name type currentBalance')
      .sort({ priority: 1, targetDate: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goals',
      error: error.message
    });
  }
};

/**
 * @desc    Get single goal
 * @route   GET /api/v1/finance/goals/:id
 * @access  Private
 */
export const getGoal = async (req, res) => {
  try {
    const goal = await FinancialGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('linkedAccountId', 'name type currentBalance');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goal',
      error: error.message
    });
  }
};

/**
 * @desc    Create new goal
 * @route   POST /api/v1/finance/goals
 * @access  Private
 */
export const createGoal = async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      userId: req.user._id
    };

    const goal = await FinancialGoal.create(goalData);

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating goal',
      error: error.message
    });
  }
};

/**
 * @desc    Update goal
 * @route   PUT /api/v1/finance/goals/:id
 * @access  Private
 */
export const updateGoal = async (req, res) => {
  try {
    const goal = await FinancialGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('linkedAccountId', 'name type currentBalance');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating goal',
      error: error.message
    });
  }
};

/**
 * @desc    Delete goal
 * @route   DELETE /api/v1/finance/goals/:id
 * @access  Private
 */
export const deleteGoal = async (req, res) => {
  try {
    const goal = await FinancialGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Soft delete
    goal.isActive = false;
    await goal.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting goal',
      error: error.message
    });
  }
};

/**
 * @desc    Add contribution to goal
 * @route   POST /api/v1/finance/goals/:id/contribute
 * @access  Private
 */
export const addContribution = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid contribution amount is required'
      });
    }

    const goal = await FinancialGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.addContribution(amount);

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding contribution',
      error: error.message
    });
  }
};

/**
 * @desc    Get goal statistics
 * @route   GET /api/v1/finance/goals/stats/summary
 * @access  Private
 */
export const getGoalStats = async (req, res) => {
  try {
    const goals = await FinancialGoal.find({
      userId: req.user._id,
      isActive: true
    });

    const totalGoals = goals.length;
    const achievedGoals = goals.filter(g => g.isAchieved).length;
    const activeGoals = totalGoals - achievedGoals;

    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = totalTargetAmount - totalCurrentAmount;

    const onTrackGoals = goals.filter(g => !g.isAchieved && g.onTrack).length;
    const offTrackGoals = activeGoals - onTrackGoals;

    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / totalGoals)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalGoals,
        activeGoals,
        achievedGoals,
        onTrackGoals,
        offTrackGoals,
        totalTargetAmount,
        totalCurrentAmount,
        totalRemaining,
        avgProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goal statistics',
      error: error.message
    });
  }
};
