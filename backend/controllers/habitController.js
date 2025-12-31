import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';

// Get all habits
export const getAllHabits = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (active === 'true') {
      filter.isActive = true;
    }

    const habits = await Habit.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: habits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get habit by ID with recent logs
export const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    // Get last 30 days of logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await DailyLog.find({
      habitId: req.params.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.json({ success: true, data: { habit, logs } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new habit
export const createHabit = async (req, res) => {
  try {
    const habit = await Habit.create(req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update habit
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    res.json({ success: true, data: habit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete habit (soft delete)
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    res.json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle habit active status
export const toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    habit.isActive = !habit.isActive;
    await habit.save();

    res.json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
