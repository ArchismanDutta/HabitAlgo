import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonthCount, formatDate, getMonthName } from '@/utils/dateUtils';
import { toast } from 'sonner';

export default function GridView() {
  const { habits, fetchHabits } = useHabitStore();
  const { logs, fetchLogsForRange, upsertLog } = useLogStore();
  const { selectedYear, selectedMonth, navigateMonth } = useCalendarStore();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

  useEffect(() => {
    fetchHabits();
    const startDate = formatDate(new Date(selectedYear, selectedMonth - 1, 1));
    const endDate = formatDate(new Date(selectedYear, selectedMonth, 0));
    fetchLogsForRange(startDate, endDate);
  }, [selectedYear, selectedMonth]);

  const daysInMonth = getDaysInMonthCount(selectedYear, selectedMonth);
  const weeks = Math.ceil(daysInMonth / 7);

  const getDayOfWeek = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  };

  const handleToggle = async (habitId: string, day: number) => {
    const date = formatDate(new Date(selectedYear, selectedMonth - 1, day));
    const dateKey = date;
    const dateLogs = logs[dateKey] || [];
    const existingLog = dateLogs.find(l => l.habitId === habitId);

    try {
      // Upsert log - this updates the local state immediately
      await upsertLog({
        date,
        habitId,
        completed: !existingLog?.completed,
        value: 0
      });

      // Note: upsertLog already updates the local state, so no need to refetch
      // But we'll refetch to ensure sync with any backend changes
      const startDate = formatDate(new Date(selectedYear, selectedMonth - 1, 1));
      const endDate = formatDate(new Date(selectedYear, selectedMonth, 0));
      await fetchLogsForRange(startDate, endDate);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      toast.error('Failed to update');
    }
  };

  const isCompleted = (habitId: string, day: number) => {
    const date = formatDate(new Date(selectedYear, selectedMonth - 1, day));
    const dateLogs = logs[date] || [];
    return dateLogs.find(l => l.habitId === habitId)?.completed || false;
  };

  const renderWeekView = (weekNum: number) => {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(weekNum * 7, daysInMonth);
    const daysInWeek: number[] = [];

    for (let day = startDay; day <= endDay; day++) {
      daysInWeek.push(day);
    }

    return (
      <div key={weekNum} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 bg-secondary px-3 py-2 rounded">
          Week {weekNum}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-2 bg-pink-100 dark:bg-pink-900 font-bold sticky left-0 z-10 border-r-2 border-pink-300 dark:border-pink-700">
                  #
                </th>
                <th className="text-left p-2 bg-pink-100 dark:bg-pink-900 font-bold min-w-[200px] max-w-[300px] sticky left-[52px] z-10 border-r-2 border-pink-300 dark:border-pink-700">
                  Habits
                </th>
                {daysInWeek.map(day => (
                  <th key={day} className="text-center p-2 bg-muted min-w-[60px]">
                    <div className="text-sm font-semibold">{day}</div>
                    <div className="text-xs text-muted-foreground">{getDayOfWeek(day)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, index) => (
                <tr key={habit._id} className="border-b hover:bg-accent/50">
                  <td className="p-2 text-center font-semibold bg-background sticky left-0 z-10 border-r border-border">
                    {index + 1}
                  </td>
                  <td className="p-2 bg-background sticky left-[52px] z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <div className="truncate max-w-[180px]">
                        <div className="font-medium truncate">{habit.name}</div>
                        {habit.type === 'numeric' && (
                          <div className="text-xs text-muted-foreground truncate">
                            Target: {habit.targetMonthly} {habit.numericConfig?.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {daysInWeek.map(day => {
                    const completed = isCompleted(habit._id, day);
                    return (
                      <td key={day} className="p-1 text-center">
                        <button
                          onClick={() => handleToggle(habit._id, day)}
                          className={`w-10 h-10 rounded border-2 transition-all inline-flex items-center justify-center ${
                            completed
                              ? 'bg-green-500 border-green-600 text-white'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary'
                          }`}
                          aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'} for day ${day}`}
                        >
                          {completed && <span className="text-lg font-bold">✓</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="text-left p-2 bg-pink-100 dark:bg-pink-900 font-bold sticky left-0 z-10 border-r-2 border-pink-300 dark:border-pink-700">
                #
              </th>
              <th className="text-left p-2 bg-pink-100 dark:bg-pink-900 font-bold min-w-[180px] max-w-[250px] sticky left-[52px] z-10 border-r-2 border-pink-300 dark:border-pink-700">
                Habits
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <th key={day} className="text-center p-1 bg-muted min-w-[50px]">
                  <div className="text-xs font-semibold">{day}</div>
                  <div className="text-xs text-muted-foreground">{getDayOfWeek(day).slice(0, 3)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, index) => (
              <tr key={habit._id} className="border-b hover:bg-accent/50">
                <td className="p-2 text-center font-semibold bg-background sticky left-0 z-10 border-r border-border">
                  {index + 1}
                </td>
                <td className="p-2 bg-background sticky left-[52px] z-10 border-r border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className="font-medium truncate max-w-[150px]">{habit.name}</span>
                  </div>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const completed = isCompleted(habit._id, day);
                  return (
                    <td key={day} className="p-0.5 text-center">
                      <button
                        onClick={() => handleToggle(habit._id, day)}
                        className={`w-8 h-8 rounded border transition-all inline-flex items-center justify-center ${
                          completed
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary'
                        }`}
                        aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'} for day ${day}`}
                      >
                        {completed && <span className="text-sm font-bold">✓</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-[1600px] mx-auto p-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <CardTitle className="text-2xl">
                  {getMonthName(selectedMonth)} {selectedYear}
                </CardTitle>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                >
                  By Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                >
                  Full Month
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="bg-pink-100 dark:bg-pink-900 px-4 py-2 rounded">
              Daily Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No habits yet. Create your first habit to get started!
              </div>
            ) : viewMode === 'week' ? (
              Array.from({ length: weeks }, (_, i) => i + 1).map(week => renderWeekView(week))
            ) : (
              renderMonthView()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
