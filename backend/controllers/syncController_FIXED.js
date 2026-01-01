import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';

// Push offline changes to server
export const pushChanges = async (req, res) => {
  try {
    const { habits = [], logs = [], deletedIds = [] } = req.body;

    const results = {
      habits: { created: 0, updated: 0 },
      logs: { created: 0, updated: 0 },
      deleted: 0
    };

    // Process habit changes
    for (const habitData of habits) {
      if (habitData._id && habitData._id.startsWith('temp_')) {
        // New habit from offline
        const { _id, ...data } = habitData;
        await Habit.create({ ...data, userId: req.user._id });
        results.habits.created++;
      } else if (habitData._id) {
        // Update existing (only if owned by user)
        await Habit.findOneAndUpdate(
          { _id: habitData._id, userId: req.user._id },
          habitData
        );
        results.habits.updated++;
      } else {
        // Create new
        await Habit.create({ ...habitData, userId: req.user._id });
        results.habits.created++;
      }
    }

    // Process log changes
    for (const logData of logs) {
      const logDate = new Date(logData.date);
      logDate.setHours(0, 0, 0, 0);

      await DailyLog.findOneAndUpdate(
        { date: logDate, habitId: logData.habitId, userId: req.user._id },
        { ...logData, date: logDate, userId: req.user._id },
        { upsert: true }
      );

      results.logs.updated++;
    }

    // Process deletions (only if owned by user)
    for (const id of deletedIds) {
      await Habit.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { isActive: false }
      );
      results.deleted++;
    }

    // Update last sync time
    const settings = await Settings.getSettings(req.user._id);
    settings.lastSyncTime = new Date();
    await settings.save();

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Pull latest data from server
export const pullChanges = async (req, res) => {
  try {
    const { lastSync } = req.query;

    const filter = { userId: req.user._id };
    if (lastSync) {
      filter.updatedAt = { $gte: new Date(lastSync) };
    } else {
      filter.isActive = true;
    }

    // Get habits
    const habits = await Habit.find(filter);

    // Get logs (last 90 days or since last sync)
    const logFilter = { userId: req.user._id };
    if (lastSync) {
      logFilter.updatedAt = { $gte: new Date(lastSync) };
    } else {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      logFilter.date = { $gte: ninetyDaysAgo };
    }

    const logs = await DailyLog.find(logFilter).populate('habitId');

    // Get settings
    const settings = await Settings.getSettings(req.user._id);

    res.json({
      success: true,
      data: {
        habits,
        logs,
        settings,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check sync status
export const getSyncStatus = async (req, res) => {
  try {
    const settings = await Settings.getSettings(req.user._id);
    const habitCount = await Habit.countDocuments({ userId: req.user._id, isActive: true });
    const logCount = await DailyLog.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        lastSyncTime: settings.lastSyncTime,
        habitCount,
        logCount,
        serverTime: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
