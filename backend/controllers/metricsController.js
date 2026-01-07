import BodyMetrics from '../models/BodyMetrics.js';
import BodyGoal from '../models/BodyGoal.js';

// ===== BODY METRICS =====

// Create or update body metrics for a date
export const upsertMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const metrics = await BodyMetrics.findOneAndUpdate(
      { userId, date: req.body.date },
      { ...req.body, userId },
      { new: true, upsert: true, runValidators: true }
    );

    // Update current weight in active goal
    if (req.body.weight) {
      await BodyGoal.findOneAndUpdate(
        { userId, isActive: true },
        { currentWeight: req.body.weight }
      );
    }

    res.status(201).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get metrics by date range
export const getMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const query = { userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const metrics = await BodyMetrics.find(query).sort({ date: -1 });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get latest metrics
export const getLatestMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const metrics = await BodyMetrics.findOne({
      userId
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete metrics
export const deleteMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const metrics = await BodyMetrics.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Metrics not found'
      });
    }

    res.json({
      success: true,
      message: 'Metrics deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== BODY GOALS =====

// Create goal
export const createGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    // Deactivate existing active goals
    await BodyGoal.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    const goal = await BodyGoal.create({
      ...req.body,
      userId,
      // Set currentWeight to startWeight if not provided
      currentWeight: req.body.currentWeight || req.body.startWeight
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get goals
export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { active } = req.query;

    const query = { userId };

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const goals = await BodyGoal.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get active goal
export const getActiveGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const goal = await BodyGoal.findOne({
      userId,
      isActive: true
    });

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const goal = await BodyGoal.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const goal = await BodyGoal.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
