import WorkoutSession from '../models/WorkoutSession.js';
import PersonalRecord from '../models/PersonalRecord.js';
import WorkoutProgram from '../models/WorkoutProgram.js';

// Start new workout session
export const startSession = async (req, res) => {
  try {
    const userId = req.user._id;
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
      totalVolume: 0,
      completionStats: {
        exercisesCompleted: 0,
        exercisesPlanned: exercises.length,
        setsCompleted: 0,
        setsPlanned: exercises.reduce((sum, ex) => sum + (ex.plannedSets || 3), 0),
        completionPercentage: 0
      }
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
    const userId = req.user._id;

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

    // Calculate completion stats
    session.completionStats = calculateCompletionStats(session);

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
    const userId = req.user._id;

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

    // Calculate final completion stats
    session.completionStats = calculateCompletionStats(session);

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
    const userId = req.user._id;
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
    const userId = req.user._id;

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
    const userId = req.user._id;

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

// Helper function to calculate completion statistics
function calculateCompletionStats(session) {
  const stats = {
    exercisesCompleted: 0,
    exercisesPlanned: session.exercises.length,
    setsCompleted: 0,
    setsPlanned: 0,
    completionPercentage: 0
  };

  session.exercises.forEach(exercise => {
    // Count planned sets
    if (exercise.plannedSets) {
      stats.setsPlanned += exercise.plannedSets;
    } else {
      // If no planned sets, estimate based on actual sets or default to 3
      stats.setsPlanned += exercise.sets.length || 3;
    }

    // Count completed sets
    const completedSets = exercise.sets.filter(set => set.completed).length;
    stats.setsCompleted += completedSets;

    // Count completed exercises (if exercise marked complete OR has at least 1 completed set)
    if (exercise.completed || completedSets > 0) {
      stats.exercisesCompleted++;
    }
  });

  // Calculate hybrid completion percentage
  // Weight: 50% exercises, 50% sets
  const exerciseCompletion = stats.exercisesPlanned > 0
    ? (stats.exercisesCompleted / stats.exercisesPlanned) * 100
    : 0;
  const setCompletion = stats.setsPlanned > 0
    ? (stats.setsCompleted / stats.setsPlanned) * 100
    : 0;

  stats.completionPercentage = Math.round((exerciseCompletion + setCompletion) / 2);

  return stats;
}

// Substitute exercise in active session
export const substituteExercise = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { originalExerciseId, newExerciseId, newExerciseName, reason } = req.body;

    const session = await WorkoutSession.findOne({
      _id: sessionId,
      userId,
      completed: false
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Active session not found'
      });
    }

    // Find the original exercise
    const originalExercise = session.exercises.find(
      ex => ex.exerciseId === originalExerciseId
    );

    if (!originalExercise) {
      return res.status(404).json({
        success: false,
        error: 'Original exercise not found in session'
      });
    }

    // Create substitute exercise with same planned values
    const substituteExercise = {
      exerciseId: newExerciseId,
      exerciseName: newExerciseName,
      sets: [],
      completed: false,
      isSubstitute: true,
      substitutedFor: {
        exerciseId: originalExerciseId,
        exerciseName: originalExercise.exerciseName,
        reason: reason || 'Exercise substitution'
      },
      plannedSets: originalExercise.plannedSets,
      plannedReps: originalExercise.plannedReps,
      plannedWeight: originalExercise.plannedWeight,
      restTime: originalExercise.restTime
    };

    // Add substitute exercise after the original
    const originalIndex = session.exercises.indexOf(originalExercise);
    session.exercises.splice(originalIndex + 1, 0, substituteExercise);

    // Mark original as substituted (add note)
    originalExercise.notes = `${originalExercise.notes || ''}\n[Substituted with ${newExerciseName}${reason ? ': ' + reason : ''}]`.trim();
    originalExercise.completed = true; // Mark as "completed" to skip it

    await session.save();

    res.json({
      success: true,
      data: session,
      message: `Exercise substituted: ${newExerciseName} will replace ${originalExercise.exerciseName}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}
