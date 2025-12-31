import { DailyLog } from '@/types';
import { normalizeDate } from './dateUtils';

export const calculateStreak = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = normalizeDate(new Date());

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = normalizeDate(sortedLogs[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === expectedDate.getTime() && sortedLogs[i].completed) {
      streak++;
    } else if (logDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].completed) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return '😴';
  if (streak < 7) return '🔥';
  if (streak < 30) return '🚀';
  if (streak < 100) return '⭐';
  return '👑';
};

export const getStreakColor = (streak: number): string => {
  if (streak === 0) return 'text-gray-400';
  if (streak < 7) return 'text-orange-500';
  if (streak < 30) return 'text-blue-500';
  if (streak < 100) return 'text-purple-500';
  return 'text-yellow-500';
};
