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
      <div key={weekNum} className="mb-4 xxs:mb-5 sm:mb-6">
        <h3 className="text-sm xxs:text-base sm:text-lg font-semibold mb-2 xxs:mb-3 bg-secondary px-2 xxs:px-3 py-1.5 xxs:py-2 rounded">
          Week {weekNum}
        </h3>
        <div className="overflow-x-auto rounded-lg border -mx-3 xxs:-mx-2 sm:mx-0">
          <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-1 xxs:p-1.5 sm:p-2 bg-pink-100 dark:bg-pink-900 font-bold sticky left-0 z-10 border-r-2 border-pink-300 dark:border-pink-700 text-[10px] xxs:text-xs sm:text-sm w-[28px] xxs:w-[36px] sm:w-[52px]">
                  #
                </th>
                <th className="text-left p-1 xxs:p-1.5 sm:p-2 bg-pink-100 dark:bg-pink-900 font-bold w-[150px] xxs:w-[180px] sm:w-[220px] sticky left-[28px] xxs:left-[36px] sm:left-[52px] z-10 border-r-2 border-pink-300 dark:border-pink-700 text-[10px] xxs:text-xs sm:text-sm">
                  Habits
                </th>
                {daysInWeek.map(day => (
                  <th key={day} className="text-center p-0.5 xxs:p-1 sm:p-1.5 bg-muted min-w-[38px] xxs:min-w-[44px] sm:min-w-[52px]">
                    <div className="text-xs xxs:text-sm font-semibold">{day}</div>
                    <div className="text-[10px] xxs:text-xs text-muted-foreground hidden xxs:block">{getDayOfWeek(day)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, index) => (
                <tr key={habit._id} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="p-1 xxs:p-1.5 sm:p-2 text-center font-semibold bg-background sticky left-0 z-10 border-r border-border text-[10px] xxs:text-xs sm:text-sm">
                    {index + 1}
                  </td>
                  <td className="p-1 xxs:p-1.5 sm:p-2 bg-background sticky left-[28px] xxs:left-[36px] sm:left-[52px] z-10 border-r border-border w-[150px] xxs:w-[180px] sm:w-[220px]">
                    <div className="flex items-center gap-1 xxs:gap-1.5 sm:gap-2">
                      <span className="text-sm xxs:text-base sm:text-lg flex-shrink-0">{habit.icon}</span>
                      <div className="truncate flex-1 min-w-0">
                        <div className="font-medium truncate text-[10px] xxs:text-xs sm:text-sm">{habit.name}</div>
                        {habit.type === 'numeric' && (
                          <div className="text-[9px] xxs:text-[10px] sm:text-xs text-muted-foreground truncate">
                            Target: {habit.targetMonthly} {habit.numericConfig?.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {daysInWeek.map(day => {
                    const completed = isCompleted(habit._id, day);
                    return (
                      <td key={day} className="p-0.5 text-center">
                        <button
                          onClick={() => handleToggle(habit._id, day)}
                          className={`w-7 h-7 xxs:w-8 xxs:h-8 sm:w-9 sm:h-9 rounded border-2 transition-all inline-flex items-center justify-center hover:scale-110 active:scale-95 ${
                            completed
                              ? 'bg-green-500 border-green-600 text-white'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary'
                          }`}
                          aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'} for day ${day}`}
                        >
                          {completed && <span className="text-sm xxs:text-base sm:text-lg font-bold">✓</span>}
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
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="overflow-x-auto rounded-lg border -mx-3 xxs:-mx-2 sm:mx-0">
        <div className="min-w-max">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="text-left p-1 xxs:p-1.5 sm:p-2 bg-pink-100 dark:bg-pink-900 font-bold sticky left-0 z-10 border-r-2 border-pink-300 dark:border-pink-700 text-[10px] xxs:text-xs sm:text-sm w-[28px] xxs:w-[36px] sm:w-[52px]">
                #
              </th>
              <th className="text-left p-1 xxs:p-1.5 sm:p-2 bg-pink-100 dark:bg-pink-900 font-bold w-[130px] xxs:w-[160px] sm:w-[200px] sticky left-[28px] xxs:left-[36px] sm:left-[52px] z-10 border-r-2 border-pink-300 dark:border-pink-700 text-[10px] xxs:text-xs sm:text-sm">
                Habits
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <th key={day} className="text-center p-0.5 bg-muted min-w-[32px] xxs:min-w-[38px] sm:min-w-[44px]">
                  <div className="text-[10px] xxs:text-xs font-semibold">{day}</div>
                  <div className="text-[9px] xxs:text-[10px] sm:text-xs text-muted-foreground hidden xs:block">{getDayOfWeek(day).slice(0, 3)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, index) => (
              <tr key={habit._id} className="border-b hover:bg-accent/50 transition-colors">
                <td className="p-1 xxs:p-1.5 sm:p-2 text-center font-semibold bg-background sticky left-0 z-10 border-r border-border text-[10px] xxs:text-xs sm:text-sm">
                  {index + 1}
                </td>
                <td className="p-1 xxs:p-1.5 sm:p-2 bg-background sticky left-[28px] xxs:left-[36px] sm:left-[52px] z-10 border-r border-border w-[130px] xxs:w-[160px] sm:w-[200px]">
                  <div className="flex items-center gap-1 xxs:gap-1.5 sm:gap-2">
                    <span className="text-sm xxs:text-base sm:text-lg flex-shrink-0">{habit.icon}</span>
                    <span className="font-medium truncate flex-1 min-w-0 text-[10px] xxs:text-xs sm:text-sm">{habit.name}</span>
                  </div>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const completed = isCompleted(habit._id, day);
                  return (
                    <td key={day} className="p-0.5 text-center">
                      <button
                        onClick={() => handleToggle(habit._id, day)}
                        className={`w-6 h-6 xxs:w-7 xxs:h-7 sm:w-8 sm:h-8 rounded border transition-all inline-flex items-center justify-center hover:scale-110 active:scale-95 ${
                          completed
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary'
                        }`}
                        aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'} for day ${day}`}
                      >
                        {completed && <span className="text-[10px] xxs:text-xs sm:text-sm font-bold">✓</span>}
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

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container max-w-[1600px] mx-auto px-2 xxs:px-3 sm:px-4 py-3 xxs:py-4 sm:py-6 space-y-3 xxs:space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="px-3 xxs:px-4 sm:px-6 py-3 xxs:py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xxs:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 xxs:h-9 xxs:w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 sm:h-5 sm:w-5" />
                </Button>

                <CardTitle className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-center min-w-0 flex-1 sm:flex-none truncate">
                  {getMonthName(selectedMonth)} {selectedYear}
                </CardTitle>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 xxs:h-9 xxs:w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              <div className="flex gap-1.5 xxs:gap-2 w-full sm:w-auto">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                  className="flex-1 sm:flex-none h-8 xxs:h-9 text-xs xxs:text-sm transition-all hover:scale-105 active:scale-95"
                >
                  By Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                  className="flex-1 sm:flex-none h-8 xxs:h-9 text-xs xxs:text-sm transition-all hover:scale-105 active:scale-95"
                >
                  Full Month
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="px-3 xxs:px-4 sm:px-6 py-3 xxs:py-4 sm:py-6">
            <CardTitle className="bg-pink-100 dark:bg-pink-900 px-3 xxs:px-4 py-1.5 xxs:py-2 rounded text-sm xxs:text-base sm:text-lg">
              Daily Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 xxs:px-3 sm:px-6 pb-3 xxs:pb-4 sm:pb-6">
            {habits.length === 0 ? (
              <div className="text-center py-8 xxs:py-10 sm:py-12 text-xs xxs:text-sm sm:text-base text-muted-foreground">
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
