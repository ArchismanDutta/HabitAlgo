import WorkoutSession from '../models/WorkoutSession.js';
import PersonalRecord from '../models/PersonalRecord.js';
import BodyMetrics from '../models/BodyMetrics.js';

// Get volume analytics
export const getVolumeAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    const userId = req.user._id;

    let start = new Date();
    let end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Calculate start date based on period
      if (period === 'week') {
        start.setDate(start.getDate() - 7);
      } else if (period === 'month') {
        start.setDate(start.getDate() - 30);
      } else if (period === 'year') {
        start.setFullYear(start.getFullYear() - 1);
      }
    }

    const sessions = await WorkoutSession.find({
      userId,
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0]
      },
      completed: true
    }).sort({ date: 1 });

    // Group by date or week
    const volumeData = [];
    const volumeByDate = new Map();

    sessions.forEach(session => {
      const date = session.date;
      const currentVolume = volumeByDate.get(date) || 0;
      volumeByDate.set(date, currentVolume + session.totalVolume);
    });

    volumeByDate.forEach((volume, date) => {
      volumeData.push({
        date,
        volume,
        sessionCount: sessions.filter(s => s.date === date).length
      });
    });

    // Calculate totals
    const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
    const totalWorkouts = sessions.length;

    res.json({
      success: true,
      data: {
        volumeData,
        summary: {
          totalVolume,
          totalWorkouts,
          averageVolume: totalWorkouts > 0 ? totalVolume / totalWorkouts : 0,
          period
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get personal records
export const getPersonalRecords = async (req, res) => {
  try {
    const { exerciseId, type } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (exerciseId) query.exerciseId = exerciseId;
    if (type) query.type = type;

    const prs = await PersonalRecord.find(query).sort({ date: -1 });

    // Group by exercise
    const prsByExercise = new Map();

    prs.forEach(pr => {
      if (!prsByExercise.has(pr.exerciseId)) {
        prsByExercise.set(pr.exerciseId, []);
      }
      prsByExercise.get(pr.exerciseId).push(pr);
    });

    const groupedPRs = Array.from(prsByExercise.entries()).map(([exerciseId, records]) => ({
      exerciseId,
      exerciseName: records[0].exerciseName,
      records: records.slice(0, 5) // Latest 5 PRs per exercise
    }));

    res.json({
      success: true,
      data: {
        personalRecords: prs,
        groupedByExercise: groupedPRs,
        totalPRs: prs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get progress for a specific exercise
export const getExerciseProgress = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user._id;

    const sessions = await WorkoutSession.find({
      userId,
      'exercises.exerciseId': exerciseId,
      completed: true
    })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const progress = sessions.map(session => {
      const exercise = session.exercises.find(e => e.exerciseId === exerciseId);

      // Calculate max weight and total volume for this exercise in this session
      const maxWeight = Math.max(...exercise.sets.map(s => s.actualWeight));
      const maxReps = Math.max(...exercise.sets.map(s => s.actualReps));
      const totalVolume = exercise.sets.reduce((sum, s) => sum + (s.actualWeight * s.actualReps), 0);

      return {
        date: session.date,
        sessionId: session._id,
        maxWeight,
        maxReps,
        totalVolume,
        sets: exercise.sets,
        notes: exercise.notes
      };
    }).reverse(); // Oldest to newest

    res.json({
      success: true,
      data: {
        exerciseId,
        exerciseName: sessions.length > 0 ? sessions[0].exercises.find(e => e.exerciseId === exerciseId)?.exerciseName : null,
        progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get overall progress summary
export const getProgressSummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user._id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get sessions
    const sessions = await WorkoutSession.find({
      userId,
      date: { $gte: startDate.toISOString().split('T')[0] },
      completed: true
    });

    // Get metrics
    const metrics = await BodyMetrics.find({
      userId,
      date: { $gte: startDate.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    // Get recent PRs
    const recentPRs = await PersonalRecord.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 }).limit(5);

    // Calculate stats
    const totalWorkouts = sessions.length;
    const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (totalWorkouts || 1);

    // Weight change
    const weightChange = metrics.length >= 2
      ? metrics[metrics.length - 1].weight - metrics[0].weight
      : 0;

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        workouts: {
          total: totalWorkouts,
          avgPerWeek: (totalWorkouts / (parseInt(days) / 7)).toFixed(1)
        },
        volume: {
          total: Math.round(totalVolume),
          average: Math.round(totalVolume / (totalWorkouts || 1))
        },
        duration: {
          average: Math.round(avgDuration)
        },
        bodyMetrics: {
          weightChange: weightChange.toFixed(1),
          currentWeight: metrics.length > 0 ? metrics[metrics.length - 1].weight : null,
          startWeight: metrics.length > 0 ? metrics[0].weight : null
        },
        recentPRs: recentPRs.map(pr => ({
          exerciseName: pr.exerciseName,
          type: pr.type,
          value: pr.value,
          date: pr.date
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get strength comparison (compare performance across time periods)
export const getStrengthComparison = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    const thisMonthStart = new Date(now);
    thisMonthStart.setDate(now.getDate() - 30);

    const lastMonthStart = new Date(now);
    lastMonthStart.setDate(now.getDate() - 60);

    // This week
    const thisWeekSessions = await WorkoutSession.find({
      userId,
      date: { $gte: thisWeekStart.toISOString().split('T')[0] },
      completed: true
    });

    // Last week
    const lastWeekSessions = await WorkoutSession.find({
      userId,
      date: {
        $gte: lastWeekStart.toISOString().split('T')[0],
        $lt: thisWeekStart.toISOString().split('T')[0]
      },
      completed: true
    });

    // This month
    const thisMonthSessions = await WorkoutSession.find({
      userId,
      date: { $gte: thisMonthStart.toISOString().split('T')[0] },
      completed: true
    });

    // Last month
    const lastMonthSessions = await WorkoutSession.find({
      userId,
      date: {
        $gte: lastMonthStart.toISOString().split('T')[0],
        $lt: thisMonthStart.toISOString().split('T')[0]
      },
      completed: true
    });

    const calcStats = (sessions) => ({
      workouts: sessions.length,
      volume: sessions.reduce((sum, s) => sum + s.totalVolume, 0),
      avgDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (sessions.length || 1)
    });

    res.json({
      success: true,
      data: {
        weekly: {
          current: calcStats(thisWeekSessions),
          previous: calcStats(lastWeekSessions),
          change: {
            workouts: thisWeekSessions.length - lastWeekSessions.length,
            volume: calcStats(thisWeekSessions).volume - calcStats(lastWeekSessions).volume
          }
        },
        monthly: {
          current: calcStats(thisMonthSessions),
          previous: calcStats(lastMonthSessions),
          change: {
            workouts: thisMonthSessions.length - lastMonthSessions.length,
            volume: calcStats(thisMonthSessions).volume - calcStats(lastMonthSessions).volume
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
