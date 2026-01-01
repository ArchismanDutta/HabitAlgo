import DailyLog from '../models/DailyLog.js';
import MonthlySummary from '../models/MonthlySummary.js';

// Get logs with optional filters
export const getLogs = async (req, res) => {
  try {
    const { date, habitId, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (habitId) {
      filter.habitId = habitId;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await DailyLog.find(filter)
      .populate('habitId')
      .sort({ date: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get logs for a specific date
export const getLogsByDate = async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('habitId');

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create or update daily log (upsert)
export const createOrUpdateLog = async (req, res) => {
  try {
    const { date, habitId, completed, value, note, mood } = req.body;

    // Normalize date to start of day
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const log = await DailyLog.findOneAndUpdate(
      { date: logDate, habitId, userId: req.user._id },
      { completed, value, note, mood, date: logDate, userId: req.user._id },
      { upsert: true, new: true, runValidators: true }
    ).populate('habitId');

    // Trigger monthly summary recalculation
    const year = logDate.getFullYear();
    const month = logDate.getMonth() + 1;
    await MonthlySummary.recalculate(habitId, year, month, req.user._id);

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Bulk create/update logs
export const bulkCreateOrUpdateLogs = async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Logs must be a non-empty array'
      });
    }

    const operations = logs.map(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      return {
        updateOne: {
          filter: { date: logDate, habitId: log.habitId, userId: req.user._id },
          update: {
            completed: log.completed,
            value: log.value,
            note: log.note,
            mood: log.mood,
            date: logDate,
            userId: req.user._id
          },
          upsert: true
        }
      };
    });

    const result = await DailyLog.bulkWrite(operations);

    // Recalculate summaries for affected months
    const affectedMonths = new Set();
    logs.forEach(log => {
      const logDate = new Date(log.date);
      const key = `${log.habitId}_${logDate.getFullYear()}_${logDate.getMonth() + 1}`;
      affectedMonths.add(key);
    });

    for (const key of affectedMonths) {
      const [habitId, year, month] = key.split('_');
      await MonthlySummary.recalculate(habitId, parseInt(year), parseInt(month), req.user._id);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update specific log
export const updateLog = async (req, res) => {
  try {
    const log = await DailyLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('habitId');

    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete log
export const deleteLog = async (req, res) => {
  try {
    const log = await DailyLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save reflection
export const saveReflection = async (req, res) => {
  try {
    const { date, text, achievements, energy } = req.body;

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Find any log for this date to attach reflection
    let log = await DailyLog.findOne({ date: logDate, userId: req.user._id });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'No logs found for this date'
      });
    }

    log.reflection = { text, achievements, energy };
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get reflection for date
export const getReflection = async (req, res) => {
  try {
    const logDate = new Date(req.params.date);
    logDate.setHours(0, 0, 0, 0);

    const log = await DailyLog.findOne({
      userId: req.user._id,
      date: logDate,
      'reflection.text': { $exists: true, $ne: '' }
    });

    if (!log) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: log.reflection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save screen time
export const saveScreenTime = async (req, res) => {
  try {
    const { date, morning, day, evening, night } = req.body;

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Find any log for this date to attach screen time
    let log = await DailyLog.findOne({ date: logDate, userId: req.user._id });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'No logs found for this date'
      });
    }

    log.screenTime = { morning, day, evening, night };
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get screen time for month
export const getScreenTimeByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      'screenTime.morning': { $exists: true }
    }).select('date screenTime').sort({ date: 1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
