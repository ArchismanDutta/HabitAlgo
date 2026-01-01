import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';
import WorkoutSession from '../models/WorkoutSession.js';

// Get habit-gym correlation data
export const getHabitGymCorrelation = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user?.id; // Assuming auth middleware

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all active habits
    const habits = await Habit.find({ userId: req.user._id, isActive: true });

    // Get all daily logs in range
    const dailyLogs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('habitId');

    // Get all workout sessions in range
    const workoutSessions = await WorkoutSession.find({
      userId: req.user._id,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      },
      completed: true
    });

    // Group data by date
    const dateMap = {};

    // Process daily logs
    dailyLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          habits: {},
          hasWorkout: false,
          workoutMetrics: null,
          mood: log.mood || null,
          sleep: log.screenTime?.morning || null
        };
      }

      if (log.habitId) {
        const habitName = log.habitId.name;
        dateMap[dateKey].habits[habitName] = log.completed;
      }
    });

    // Process workout sessions
    workoutSessions.forEach(session => {
      const dateKey = session.date;
      if (dateMap[dateKey]) {
        dateMap[dateKey].hasWorkout = true;
        dateMap[dateKey].workoutMetrics = {
          volume: session.totalVolume || 0,
          duration: session.duration || 0,
          energy: session.overallEnergy || 'normal',
          exerciseCount: session.exercises?.length || 0
        };
      }
    });

    // Calculate correlations for each habit
    const correlations = habits.map(habit => {
      const habitName = habit.name;

      // Days when habit was completed with workout
      const completedWithWorkout = [];
      // Days when habit was not completed with workout
      const notCompletedWithWorkout = [];

      Object.values(dateMap).forEach(day => {
        if (day.hasWorkout && day.workoutMetrics) {
          const habitCompleted = day.habits[habitName] === true;

          if (habitCompleted) {
            completedWithWorkout.push(day.workoutMetrics);
          } else {
            notCompletedWithWorkout.push(day.workoutMetrics);
          }
        }
      });

      // Calculate averages
      const avgVolumeWhenCompleted = completedWithWorkout.length > 0
        ? completedWithWorkout.reduce((sum, m) => sum + m.volume, 0) / completedWithWorkout.length
        : 0;

      const avgVolumeWhenNotCompleted = notCompletedWithWorkout.length > 0
        ? notCompletedWithWorkout.reduce((sum, m) => sum + m.volume, 0) / notCompletedWithWorkout.length
        : 0;

      const avgDurationWhenCompleted = completedWithWorkout.length > 0
        ? completedWithWorkout.reduce((sum, m) => sum + m.duration, 0) / completedWithWorkout.length
        : 0;

      const avgDurationWhenNotCompleted = notCompletedWithWorkout.length > 0
        ? notCompletedWithWorkout.reduce((sum, m) => sum + m.duration, 0) / notCompletedWithWorkout.length
        : 0;

      // Calculate percentage difference
      const volumeDifference = avgVolumeWhenNotCompleted > 0
        ? ((avgVolumeWhenCompleted - avgVolumeWhenNotCompleted) / avgVolumeWhenNotCompleted) * 100
        : 0;

      const durationDifference = avgDurationWhenNotCompleted > 0
        ? ((avgDurationWhenCompleted - avgDurationWhenNotCompleted) / avgDurationWhenNotCompleted) * 100
        : 0;

      return {
        habitId: habit._id,
        habitName: habit.name,
        habitIcon: habit.icon,
        habitColor: habit.color,
        daysCompleted: completedWithWorkout.length,
        daysNotCompleted: notCompletedWithWorkout.length,
        avgVolumeWhenCompleted: Math.round(avgVolumeWhenCompleted),
        avgVolumeWhenNotCompleted: Math.round(avgVolumeWhenNotCompleted),
        volumeImpact: Math.round(volumeDifference * 10) / 10,
        avgDurationWhenCompleted: Math.round(avgDurationWhenCompleted),
        avgDurationWhenNotCompleted: Math.round(avgDurationWhenNotCompleted),
        durationImpact: Math.round(durationDifference * 10) / 10,
        sampleSize: completedWithWorkout.length + notCompletedWithWorkout.length
      };
    }).filter(c => c.sampleSize >= 3) // Only show correlations with at least 3 data points
      .sort((a, b) => Math.abs(b.volumeImpact) - Math.abs(a.volumeImpact));

    // Sleep correlation
    const sleepData = Object.values(dateMap)
      .filter(day => day.hasWorkout && day.sleep !== null)
      .map(day => ({
        sleep: day.sleep,
        volume: day.workoutMetrics.volume
      }));

    const sleepCorrelation = calculateSleepImpact(sleepData);

    // Mood correlation
    const moodData = Object.values(dateMap)
      .filter(day => day.hasWorkout && day.mood !== null)
      .map(day => ({
        mood: day.mood,
        volume: day.workoutMetrics.volume,
        energy: day.workoutMetrics.energy
      }));

    const moodCorrelation = calculateMoodImpact(moodData);

    res.json({
      success: true,
      data: {
        habitCorrelations: correlations,
        sleepCorrelation,
        moodCorrelation,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days: parseInt(days)
        },
        totalWorkouts: workoutSessions.length
      }
    });
  } catch (error) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper: Calculate sleep impact
function calculateSleepImpact(data) {
  if (data.length < 3) return null;

  // Group by sleep ranges
  const sleepRanges = {
    '<6h': [],
    '6-7h': [],
    '7-8h': [],
    '8-9h': [],
    '>9h': []
  };

  data.forEach(({ sleep, volume }) => {
    if (sleep < 6) sleepRanges['<6h'].push(volume);
    else if (sleep < 7) sleepRanges['6-7h'].push(volume);
    else if (sleep < 8) sleepRanges['7-8h'].push(volume);
    else if (sleep <= 9) sleepRanges['8-9h'].push(volume);
    else sleepRanges['>9h'].push(volume);
  });

  const sleepImpact = Object.entries(sleepRanges).map(([range, volumes]) => ({
    range,
    avgVolume: volumes.length > 0
      ? Math.round(volumes.reduce((sum, v) => sum + v, 0) / volumes.length)
      : 0,
    sampleSize: volumes.length
  })).filter(s => s.sampleSize > 0);

  return sleepImpact;
}

// Helper: Calculate mood impact
function calculateMoodImpact(data) {
  if (data.length < 3) return null;

  // Group by mood levels
  const moodGroups = {
    'Low (1-3)': [],
    'Medium (4-7)': [],
    'High (8-10)': []
  };

  data.forEach(({ mood, volume }) => {
    if (mood <= 3) moodGroups['Low (1-3)'].push(volume);
    else if (mood <= 7) moodGroups['Medium (4-7)'].push(volume);
    else moodGroups['High (8-10)'].push(volume);
  });

  const moodImpact = Object.entries(moodGroups).map(([level, volumes]) => ({
    level,
    avgVolume: volumes.length > 0
      ? Math.round(volumes.reduce((sum, v) => sum + v, 0) / volumes.length)
      : 0,
    sampleSize: volumes.length
  })).filter(m => m.sampleSize > 0);

  return moodImpact;
}
