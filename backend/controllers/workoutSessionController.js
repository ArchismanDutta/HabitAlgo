import WorkoutSession from '../models/WorkoutSession.js';
import PersonalRecord from '../models/PersonalRecord.js';
import WorkoutProgram from '../models/WorkoutProgram.js';

// Start new workout session
export const startSession = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth
    const { programId, date } = req.body;

    // Fetch the program to get its details
    const program = await WorkoutProgram.findById(programId).populate('exercises.exerciseId');

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    // Initialize exercises from program
    const exercises = program.exercises.map(ex => {
      const exercise = typeof ex.exerciseId === 'object' ? ex.exerciseId : null;
      return {
        exerciseId: typeof ex.exerciseId === 'object' ? ex.exerciseId._id : ex.exerciseId,
        exerciseName: exercise?.name || 'Unknown Exercise',
        sets: [],
        completed: false,
        // Include planned values as references (guidelines only)
        plannedSets: ex.plannedSets,
        plannedReps: ex.plannedReps,
        plannedWeight: ex.plannedWeight,
        restTime: ex.restTime
      };
    });

    const session = await WorkoutSession.create({
      userId,
      programId,
      programName: program.name,
      date,
      startTime: new Date(),
      completed: false,
      exercises,
      overallEnergy: 'normal',
      totalVolume: 0
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update workout session (log sets, exercises)
export const updateSession = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth

    const session = await WorkoutSession.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Calculate total volume
    let totalVolume = 0;
    session.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          totalVolume += set.actualWeight * set.actualReps;
        }
      });
    });
    session.totalVolume = totalVolume;
    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Complete workout session
export const completeSession = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth

    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.endTime = new Date();
    session.completed = true;

    // Calculate duration in minutes
    if (session.startTime) {
      session.duration = Math.round((session.endTime - session.startTime) / 1000 / 60);
    }

    await session.save();

    // Check for new personal records
    await checkForPRs(session);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get sessions by date range
export const getSessions = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth
    const { startDate, endDate, date } = req.query;

    const query = { userId };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const sessions = await WorkoutSession.find(query)
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single session
export const getSession = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth

    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const userId = req.user?._id || 'default-user'; // TODO: Replace with actual auth

    const session = await WorkoutSession.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to check for personal records
async function checkForPRs(session) {
  for (const exercise of session.exercises) {
    if (!exercise.sets || exercise.sets.length === 0) continue;

    const completedSets = exercise.sets.filter(s => s.completed);
    if (completedSets.length === 0) continue;

    // Calculate exercise volume for this session
    const exerciseVolume = completedSets.reduce((sum, set) =>
      sum + (set.actualWeight * set.actualReps), 0
    );

    // Find the heaviest set
    const heaviestSet = completedSets.reduce((max, set) =>
      set.actualWeight > max.actualWeight ? set : max, completedSets[0]
    );

    // Find the set with most reps at the highest weight
    const maxRepsSet = completedSets
      .filter(s => s.actualWeight === heaviestSet.actualWeight)
      .reduce((max, set) => set.actualReps > max.actualReps ? set : max, heaviestSet);

    // Check for 1RM PR (using Epley formula)
    const estimated1RM = heaviestSet.actualWeight * (1 + heaviestSet.actualReps / 30);
    const existing1RM = await PersonalRecord.findOne({
      userId: session.userId,
      exerciseId: exercise.exerciseId,
      type: '1RM'
    }).sort({ value: -1 });

    if (!existing1RM || estimated1RM > existing1RM.value) {
      await PersonalRecord.create({
        userId: session.userId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        type: '1RM',
        value: Math.round(estimated1RM * 10) / 10,
        weight: heaviestSet.actualWeight,
        reps: heaviestSet.actualReps,
        sessionId: session._id,
        date: new Date(),
        notes: 'New 1RM PR! 🎉'
      });
    }

    // Check for max reps PR (at a specific weight)
    const existingMaxReps = await PersonalRecord.findOne({
      userId: session.userId,
      exerciseId: exercise.exerciseId,
      type: 'max_reps',
      weight: maxRepsSet.actualWeight
    }).sort({ value: -1 });

    if (!existingMaxReps || maxRepsSet.actualReps > existingMaxReps.value) {
      await PersonalRecord.create({
        userId: session.userId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        type: 'max_reps',
        value: maxRepsSet.actualReps,
        weight: maxRepsSet.actualWeight,
        sessionId: session._id,
        date: new Date(),
        notes: `New rep PR at ${maxRepsSet.actualWeight}kg! 💪`
      });
    }

    // Check for max volume PR (for this exercise in a single session)
    const existingMaxVolume = await PersonalRecord.findOne({
      userId: session.userId,
      exerciseId: exercise.exerciseId,
      type: 'max_volume'
    }).sort({ value: -1 });

    if (!existingMaxVolume || exerciseVolume > existingMaxVolume.value) {
      await PersonalRecord.create({
        userId: session.userId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        type: 'max_volume',
        value: Math.round(exerciseVolume),
        sessionId: session._id,
        date: new Date(),
        notes: 'New volume PR! 📈'
      });
    }
  }
}
