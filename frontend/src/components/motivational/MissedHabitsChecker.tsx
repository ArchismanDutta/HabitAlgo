import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { Habit } from '@/types';
import { getTodayString } from '@/utils/dateUtils';
import MissedHabitPrompt from './MissedHabitPrompt';
import { toast } from 'sonner';

/**
 * Component that monitors for missed habits and shows motivational prompts
 * Shows prompts for habits with "why" or "identityStatement" that haven't been completed
 * Triggers based on time of day (e.g., evening) or can be manually triggered
 */
export default function MissedHabitsChecker() {
  const { habits } = useHabitStore();
  const { logs, upsertLog, fetchLogsForDate } = useLogStore();
  const [currentMissedHabit, setCurrentMissedHabit] = useState<Habit | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);
  const [promptQueue, setPromptQueue] = useState<Habit[]>([]);

  const today = getTodayString();

  useEffect(() => {
    // Check for missed habits in the evening (6 PM onwards)
    const checkMissedHabits = () => {
      const now = new Date();
      const hour = now.getHours();

      // Only check between 6 PM and 11:59 PM
      if (hour >= 18 && hour < 24 && !checkedToday) {
        performMissedHabitsCheck();
        setCheckedToday(true);
      }

      // Reset check flag at midnight
      if (hour === 0) {
        setCheckedToday(false);
      }
    };

    // Check immediately
    checkMissedHabits();

    // Set up interval to check every 30 minutes
    const interval = setInterval(checkMissedHabits, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [habits, logs, checkedToday]);

  useEffect(() => {
    // Show next prompt from queue
    if (promptQueue.length > 0 && !showPrompt) {
      const nextHabit = promptQueue[0];
      setCurrentMissedHabit(nextHabit);
      setShowPrompt(true);
    }
  }, [promptQueue, showPrompt]);

  const performMissedHabitsCheck = () => {
    const todayLogs = logs[today] || [];

    // Find habits that:
    // 1. Are not completed today
    // 2. Have either "why" or "identityStatement" defined
    // 3. Are active
    const missedHabitsWithMeaning = habits.filter((habit) => {
      const log = todayLogs.find((l) => l.habitId === habit._id);
      const isCompleted = log?.completed || false;
      const hasMeaning = !!(habit.why || habit.identityStatement);

      return !isCompleted && hasMeaning && habit.isActive;
    });

    if (missedHabitsWithMeaning.length > 0) {
      // Add to queue (limit to 3 prompts max to avoid overwhelming user)
      setPromptQueue(missedHabitsWithMeaning.slice(0, 3));
    }
  };

  const handleComplete = async () => {
    if (!currentMissedHabit) return;

    try {
      await upsertLog({
        date: today,
        habitId: currentMissedHabit._id,
        completed: true,
        value: 0,
      });

      toast.success(`Great! "${currentMissedHabit.name}" completed! 🎉`);
      fetchLogsForDate(today);

      // Remove from queue and show next
      moveToNextPrompt();
    } catch (error) {
      toast.error('Failed to complete habit');
    }
  };

  const handleSkip = () => {
    if (!currentMissedHabit) return;

    toast.info(`"${currentMissedHabit.name}" skipped for today`);

    // Remove from queue and show next
    moveToNextPrompt();
  };

  const moveToNextPrompt = () => {
    setShowPrompt(false);
    setCurrentMissedHabit(null);
    setPromptQueue((prev) => prev.slice(1));
  };

  return (
    <MissedHabitPrompt
      open={showPrompt}
      onOpenChange={(open) => {
        setShowPrompt(open);
        if (!open) {
          moveToNextPrompt();
        }
      }}
      habit={currentMissedHabit}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
