import { useState, useEffect } from 'react';
import { Habit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Heart, Edit, TrendingUp, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useLogStore } from '@/store/useLogStore';
import { formatDate } from '@/utils/dateUtils';

interface HabitDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onEdit?: (habit: Habit) => void;
}

export default function HabitDetailModal({
  open,
  onOpenChange,
  habit,
  onEdit
}: HabitDetailModalProps) {
  const { logs } = useLogStore();
  const [showMeaning, setShowMeaning] = useState(false);
  const [stats, setStats] = useState<{
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    totalCompleted: number;
  } | null>(null);

  useEffect(() => {
    if (habit && open) {
      loadStats();
      // Auto-expand if habit has meaning
      setShowMeaning(!!(habit.why || habit.identityStatement));
    }
  }, [habit, open, logs]);

  const loadStats = () => {
    if (!habit) return;

    try {
      // Calculate stats from local logs
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Get all logs for this habit
      const habitLogs: { date: string; completed: boolean }[] = [];
      Object.entries(logs).forEach(([dateStr, dayLogs]) => {
        const log = dayLogs.find(l => l.habitId === habit._id);
        if (log) {
          habitLogs.push({ date: dateStr, completed: log.completed });
        }
      });

      // Sort by date descending
      habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = formatDate(checkDate, 'yyyy-MM-dd');

        const log = habitLogs.find(l => l.date === dateStr);
        if (log?.completed) {
          currentStreak++;
        } else if (i > 0) { // Don't break streak if today is not completed yet
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = habitLogs.length - 1; i >= 0; i--) {
        if (habitLogs[i].completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate completion rate for current month
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const monthLogs = habitLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === currentYear && logDate.getMonth() + 1 === currentMonth;
      });

      const totalCompleted = monthLogs.filter(log => log.completed).length;
      const completionRate = (totalCompleted / daysInMonth) * 100;

      setStats({
        currentStreak,
        longestStreak,
        completionRate,
        totalCompleted,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!habit) return null;

  const hasMeaning = !!(habit.why || habit.identityStatement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 xxs:px-5 sm:px-6 pt-4 xxs:pt-5 sm:pt-6">
          <DialogTitle className="flex flex-col xxs:flex-row items-start xxs:items-center justify-between gap-3">
            <div className="flex items-center gap-2 xxs:gap-3 min-w-0 flex-1">
              <div
                className="text-3xl xxs:text-4xl flex items-center justify-center h-12 w-12 xxs:h-14 xxs:w-14 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                {habit.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg xxs:text-xl sm:text-2xl font-bold truncate">{habit.name}</h2>
                <span className="text-xs xxs:text-sm text-muted-foreground truncate block">
                  {habit.category === 'Custom' ? habit.customCategory : habit.category}
                </span>
              </div>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(habit);
                  onOpenChange(false);
                }}
                className="h-8 xxs:h-9 text-xs xxs:text-sm w-full xxs:w-auto flex-shrink-0"
              >
                <Edit className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 mr-1.5 xxs:mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs xxs:text-sm">
            View your habit statistics, meaning, and details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 xxs:space-y-4 px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 mt-2 xxs:mt-3 sm:mt-4">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xxs:gap-3">
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-2.5 xxs:p-3 sm:p-4 text-center">
                  <Flame className="h-5 w-5 xxs:h-6 xxs:w-6 mx-auto mb-1 xxs:mb-2 text-orange-500" />
                  <div className="text-xl xxs:text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground">Current Streak</div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-2.5 xxs:p-3 sm:p-4 text-center">
                  <TrendingUp className="h-5 w-5 xxs:h-6 xxs:w-6 mx-auto mb-1 xxs:mb-2 text-blue-500" />
                  <div className="text-xl xxs:text-2xl font-bold">{stats.longestStreak}</div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground">Best Streak</div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-2.5 xxs:p-3 sm:p-4 text-center">
                  <div className="text-xl xxs:text-2xl font-bold text-green-500">
                    {Math.round(stats.completionRate)}%
                  </div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground">Completion Rate</div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-2.5 xxs:p-3 sm:p-4 text-center">
                  <div className="text-xl xxs:text-2xl font-bold text-primary">
                    {stats.totalCompleted}
                  </div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground">Days Completed</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Why & Identity Section */}
          {hasMeaning && (
            <Card className="border-pink-200 dark:border-pink-900 transition-all hover:shadow-lg">
              <CardContent className="p-3 xxs:p-4">
                <button
                  onClick={() => setShowMeaning(!showMeaning)}
                  className="w-full flex items-center justify-between text-left transition-all hover:opacity-80"
                >
                  <div className="flex items-center gap-1.5 xxs:gap-2">
                    <Heart className="h-4 w-4 xxs:h-5 xxs:w-5 text-pink-500 flex-shrink-0" />
                    <h3 className="font-semibold text-base xxs:text-lg">Why & Identity</h3>
                  </div>
                  {showMeaning ? (
                    <ChevronUp className="h-4 w-4 xxs:h-5 xxs:w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 xxs:h-5 xxs:w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {showMeaning && (
                  <div className="mt-3 xxs:mt-4 space-y-3 xxs:space-y-4">
                    {habit.why && (
                      <div className="space-y-1.5 xxs:space-y-2">
                        <div className="flex items-center gap-1.5 xxs:gap-2">
                          <Lightbulb className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-yellow-500 flex-shrink-0" />
                          <h4 className="font-medium text-xs xxs:text-sm">Why this matters to me:</h4>
                        </div>
                        <p className="text-xs xxs:text-sm text-muted-foreground pl-5 xxs:pl-6 leading-relaxed">
                          {habit.why}
                        </p>
                      </div>
                    )}

                    {habit.identityStatement && (
                      <div className="space-y-1.5 xxs:space-y-2">
                        <div className="flex items-center gap-1.5 xxs:gap-2">
                          <Heart className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-pink-500 flex-shrink-0" />
                          <h4 className="font-medium text-xs xxs:text-sm">Who I'm becoming:</h4>
                        </div>
                        <p className="text-xs xxs:text-sm text-muted-foreground pl-5 xxs:pl-6 leading-relaxed italic">
                          "{habit.identityStatement}"
                        </p>
                      </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2.5 xxs:p-3 rounded-lg text-xs xxs:text-sm">
                      <p className="text-muted-foreground leading-relaxed">
                        💡 Connecting your habit to <strong>meaning</strong> and{' '}
                        <strong>identity</strong> helps you stay committed, especially during
                        challenging times.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Habit Details */}
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-3 xxs:p-4 space-y-2 xxs:space-y-3">
              <h3 className="font-semibold text-sm xxs:text-base">Habit Details</h3>

              <div className="grid grid-cols-2 gap-3 xxs:gap-4 text-xs xxs:text-sm">
                <div>
                  <span className="text-muted-foreground text-[10px] xxs:text-xs">Type:</span>
                  <p className="font-medium capitalize">{habit.type}</p>
                </div>

                {habit.type === 'numeric' && habit.numericConfig && (
                  <div>
                    <span className="text-muted-foreground text-[10px] xxs:text-xs">Unit:</span>
                    <p className="font-medium capitalize">
                      {habit.numericConfig.unit === 'custom'
                        ? habit.numericConfig.customUnit
                        : habit.numericConfig.unit}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground text-[10px] xxs:text-xs">Monthly Goal:</span>
                  <p className="font-medium">{habit.targetMonthly} days</p>
                </div>

                <div>
                  <span className="text-muted-foreground text-[10px] xxs:text-xs">Created:</span>
                  <p className="font-medium">
                    {formatDate(new Date(habit.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col xxs:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-9 xxs:h-10 text-sm xxs:text-base"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {onEdit && (
              <Button
                className="flex-1 h-9 xxs:h-10 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95"
                onClick={() => {
                  onEdit(habit);
                  onOpenChange(false);
                }}
              >
                <Edit className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 mr-1.5 xxs:mr-2" />
                Edit Habit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
