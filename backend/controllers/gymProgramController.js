import WorkoutProgram from '../models/WorkoutProgram.js';

// Get all programs for user
export const getPrograms = async (req, res) => {
  try {
    const { active } = req.query;
    const userId = req.user._id;

    const query = { userId };

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const programs = await WorkoutProgram.find(query)
      .populate('exercises.exerciseId', 'name category equipment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single program
export const getProgram = async (req, res) => {
  try {
    const userId = req.user._id;

    const program = await WorkoutProgram.findOne({
      _id: req.params.id,
      userId
    }).populate('exercises.exerciseId');

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create program
export const createProgram = async (req, res) => {
  try {
    const userId = req.user._id;

    const program = await WorkoutProgram.create({
      ...req.body,
      userId
    });

    const populatedProgram = await WorkoutProgram.findById(program._id)
      .populate('exercises.exerciseId');

    res.status(201).json({
      success: true,
      data: populatedProgram
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update program
export const updateProgram = async (req, res) => {
  try {
    const userId = req.user._id;

    const program = await WorkoutProgram.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('exercises.exerciseId');

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete program (soft delete)
export const deleteProgram = async (req, res) => {
  try {
    const userId = req.user._id;

    const program = await WorkoutProgram.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isActive: false },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get program for today
export const getTodayProgram = async (req, res) => {
  try {
    const userId = req.user._id;
    const dayOfWeek = new Date().getDay(); // 0-6

    const program = await WorkoutProgram.findOne({
      userId,
      isActive: true,
      scheduledDays: dayOfWeek
    }).populate('exercises.exerciseId');

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
