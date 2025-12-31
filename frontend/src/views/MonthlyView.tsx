import { useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthDays, isDateInMonth, formatDate, getMonthName } from '@/utils/dateUtils';

export default function MonthlyView() {
  const { habits, fetchHabits } = useHabitStore();
  const { logs, fetchLogsForRange } = useLogStore();
  const { selectedYear, selectedMonth, navigateMonth } = useCalendarStore();

  useEffect(() => {
    fetchHabits();

    // Fetch logs for the entire month
    const startDate = formatDate(new Date(selectedYear, selectedMonth - 1, 1));
    const endDate = formatDate(new Date(selectedYear, selectedMonth, 0));
    fetchLogsForRange(startDate, endDate);
  }, [selectedYear, selectedMonth]);

  const monthDays = getMonthDays(selectedYear, selectedMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCompletionForDate = (date: Date) => {
    const dateKey = formatDate(date);
    const dateLogs = logs[dateKey] || [];
    const completed = dateLogs.filter(l => l.completed).length;
    const total = habits.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container max-w-6xl mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Month Navigator */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
            <div className="flex items-center justify-between gap-3 xxs:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="h-9 w-9 xxs:h-10 xxs:w-10 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4 xxs:h-5 xxs:w-5" />
              </Button>

              <CardTitle className="text-lg xxs:text-xl sm:text-2xl text-center">
                {getMonthName(selectedMonth)} {selectedYear}
              </CardTitle>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="h-9 w-9 xxs:h-10 xxs:w-10 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="h-4 w-4 xxs:h-5 xxs:w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-2 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 xxs:gap-1 sm:gap-2">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-[10px] xxs:text-xs sm:text-sm text-muted-foreground p-1 xxs:p-1.5 sm:p-2"
                >
                  <span className="hidden xxs:inline">{day}</span>
                  <span className="xxs:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}

              {/* Calendar days */}
              {monthDays.map((date) => {
                const isCurrentMonth = isDateInMonth(date, selectedYear, selectedMonth);
                const isToday =
                  formatDate(date) === formatDate(new Date());
                const completion = getCompletionForDate(date);

                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      aspect-square p-1 xxs:p-1.5 sm:p-2 rounded-md xxs:rounded-lg border transition-all cursor-pointer
                      ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                      ${isToday ? 'border-primary border-2 ring-1 xxs:ring-2 ring-primary/20' : 'border-border'}
                      hover:border-primary hover:shadow-md active:scale-95
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-[10px] xxs:text-xs sm:text-sm font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
                        {date.getDate()}
                      </span>

                      {isCurrentMonth && habits.length > 0 && (
                        <div className="flex-1 flex items-center justify-center mt-0.5 xxs:mt-1">
                          {completion === 100 ? (
                            <div className="text-green-500 text-base xxs:text-lg sm:text-xl">✓</div>
                          ) : completion > 0 ? (
                            <div
                              className="h-1 xxs:h-1.5 sm:h-2 w-full rounded-full bg-secondary overflow-hidden"
                            >
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          ) : (
                            <div className="h-1 xxs:h-1.5 sm:h-2 w-full rounded-full bg-secondary" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="transition-all hover:shadow-lg">
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
            <div className="flex flex-wrap items-center justify-center gap-3 xxs:gap-4 sm:gap-6 text-xs xxs:text-sm">
              <div className="flex items-center gap-1.5 xxs:gap-2">
                <div className="h-3 w-3 xxs:h-4 xxs:w-4 rounded bg-secondary flex-shrink-0" />
                <span className="whitespace-nowrap">Not started</span>
              </div>
              <div className="flex items-center gap-1.5 xxs:gap-2">
                <div className="h-3 w-8 xxs:h-4 xxs:w-12 rounded bg-gradient-to-r from-secondary via-primary/50 to-primary flex-shrink-0" />
                <span className="whitespace-nowrap">In progress</span>
              </div>
              <div className="flex items-center gap-1.5 xxs:gap-2">
                <div className="text-green-500 text-lg xxs:text-xl flex-shrink-0">✓</div>
                <span className="whitespace-nowrap">All done</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
