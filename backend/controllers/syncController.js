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
        await Habit.create(data);
        results.habits.created++;
      } else if (habitData._id) {
        // Update existing
        await Habit.findByIdAndUpdate(habitData._id, habitData);
        results.habits.updated++;
      } else {
        // Create new
        await Habit.create(habitData);
        results.habits.created++;
      }
    }

    // Process log changes
    for (const logData of logs) {
      const logDate = new Date(logData.date);
      logDate.setHours(0, 0, 0, 0);

      await DailyLog.findOneAndUpdate(
        { date: logDate, habitId: logData.habitId },
        { ...logData, date: logDate },
        { upsert: true }
      );

      results.logs.updated++;
    }

    // Process deletions
    for (const id of deletedIds) {
      await Habit.findByIdAndUpdate(id, { isActive: false });
      results.deleted++;
    }

    // Update last sync time
    const settings = await Settings.getSettings();
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

    const filter = {};
    if (lastSync) {
      filter.updatedAt = { $gte: new Date(lastSync) };
    }

    // Get habits
    const habits = await Habit.find(filter.updatedAt ? filter : { isActive: true });

    // Get logs (last 90 days or since last sync)
    const logFilter = {};
    if (lastSync) {
      logFilter.updatedAt = { $gte: new Date(lastSync) };
    } else {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      logFilter.date = { $gte: ninetyDaysAgo };
    }

    const logs = await DailyLog.find(logFilter).populate('habitId');

    // Get settings
    const settings = await Settings.getSettings();

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
    const settings = await Settings.getSettings();
    const habitCount = await Habit.countDocuments({ isActive: true });
    const logCount = await DailyLog.countDocuments();

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
