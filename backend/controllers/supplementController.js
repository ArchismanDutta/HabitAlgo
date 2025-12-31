import Supplement from '../models/Supplement.js';
import SupplementLog from '../models/SupplementLog.js';

// ===== SUPPLEMENTS =====

// Get all supplements
export const getSupplements = async (req, res) => {
  try {
    const { active } = req.query;

    const query = { userId: req.user?._id || 'default-user' };

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const supplements = await Supplement.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: supplements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single supplement
export const getSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findOne({
      _id: req.params.id,
      userId: req.user?._id || 'default-user'
    });

    if (!supplement) {
      return res.status(404).json({
        success: false,
        error: 'Supplement not found'
      });
    }

    res.json({
      success: true,
      data: supplement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create supplement
export const createSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.create({
      ...req.body,
      userId: req.user?._id || 'default-user'
    });

    res.status(201).json({
      success: true,
      data: supplement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update supplement
export const updateSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id || 'default-user' },
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplement) {
      return res.status(404).json({
        success: false,
        error: 'Supplement not found'
      });
    }

    res.json({
      success: true,
      data: supplement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete supplement (soft delete)
export const deleteSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id || 'default-user' },
      { isActive: false },
      { new: true }
    );

    if (!supplement) {
      return res.status(404).json({
        success: false,
        error: 'Supplement not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplement deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== SUPPLEMENT LOGS =====

// Log supplement intake
export const logSupplement = async (req, res) => {
  try {
    const log = await SupplementLog.create({
      ...req.body,
      userId: req.user?._id || 'default-user'
    });

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get supplement logs
export const getSupplementLogs = async (req, res) => {
  try {
    const { date, startDate, endDate, supplementId } = req.query;

    const query = { userId: req.user?._id || 'default-user' };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (supplementId) {
      query.supplementId = supplementId;
    }

    const logs = await SupplementLog.find(query)
      .populate('supplementId', 'name type icon')
      .sort({ date: -1, timing: 1 });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update supplement log
export const updateSupplementLog = async (req, res) => {
  try {
    const log = await SupplementLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id || 'default-user' },
      req.body,
      { new: true, runValidators: true }
    ).populate('supplementId', 'name type icon');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete supplement log
export const deleteSupplementLog = async (req, res) => {
  try {
    const log = await SupplementLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id || 'default-user'
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    res.json({
      success: true,
      message: 'Log deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get adherence statistics
export const getAdherenceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const supplements = await Supplement.find({
      userId: req.user?._id || 'default-user',
      isActive: true
    });

    const stats = [];

    for (const supplement of supplements) {
      const totalExpected = supplement.timing.length *
        (endDate && startDate ?
          Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) :
          30);

      const takenCount = await SupplementLog.countDocuments({
        userId: req.user?._id || 'default-user',
        supplementId: supplement._id,
        taken: true,
        ...(startDate && endDate && { date: { $gte: startDate, $lte: endDate } })
      });

      stats.push({
        supplement: supplement,
        totalExpected,
        takenCount,
        adherenceRate: totalExpected > 0 ? (takenCount / totalExpected) * 100 : 0
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
