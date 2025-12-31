import { useEffect, useState } from 'react';
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
  const { selectedYear, selectedMonth, navigateMonth, setDate } = useCalendarStore();

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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Month Navigator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
          </CardHeader>

          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {monthDays.map((date, index) => {
                const isCurrentMonth = isDateInMonth(date, selectedYear, selectedMonth);
                const isToday =
                  formatDate(date) === formatDate(new Date());
                const completion = getCompletionForDate(date);

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all cursor-pointer
                      ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                      ${isToday ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-border'}
                      hover:border-primary hover:shadow-md
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        {date.getDate()}
                      </span>

                      {isCurrentMonth && habits.length > 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          {completion === 100 ? (
                            <div className="text-green-500 text-xl">✓</div>
                          ) : completion > 0 ? (
                            <div
                              className="h-2 w-full rounded-full bg-secondary overflow-hidden"
                            >
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          ) : (
                            <div className="h-2 w-full rounded-full bg-secondary" />
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-secondary" />
                <span>Not started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 rounded bg-gradient-to-r from-secondary via-primary/50 to-primary" />
                <span>In progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-500 text-xl">✓</div>
                <span>All done</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
