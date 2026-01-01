import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Dumbbell, CheckCircle2 } from 'lucide-react';
import { WorkoutSession, WorkoutProgram } from '@/types/gym';
import { getMonthName, formatDate } from '@/utils/dateUtils';

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
  programs: WorkoutProgram[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export default function WorkoutCalendar({
  sessions,
  programs,
  selectedDate,
  onDateSelect,
  currentMonth,
  currentYear,
  onMonthChange
}: WorkoutCalendarProps) {

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekDaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        onMonthChange(11, currentYear - 1);
      } else {
        onMonthChange(currentMonth - 1, currentYear);
      }
    } else {
      if (currentMonth === 11) {
        onMonthChange(0, currentYear + 1);
      } else {
        onMonthChange(currentMonth + 1, currentYear);
      }
    }
  };

  const getSessionForDate = (date: Date): WorkoutSession | undefined => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    return sessions.find(s => s.date === dateStr);
  };

  const getProgramForDay = (dayOfWeek: number): WorkoutProgram | null => {
    return programs.find(p => p.scheduledDays.includes(dayOfWeek) && p.isActive) || null;
  };

  const getDayData = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    const session = getSessionForDate(date);
    const scheduledProgram = getProgramForDay(dayOfWeek);
    const isToday = formatDate(new Date(), 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd');
    const isSelected = selectedDate && formatDate(selectedDate, 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd');

    return { date, session, scheduledProgram, isToday, isSelected };
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1 xxs:p-1.5 sm:p-2"></div>
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const { date, session, scheduledProgram, isToday, isSelected } = getDayData(day);
      const hasWorkout = !!session;
      const isCompleted = session?.completed;
      const isMissed = scheduledProgram && !session && date < new Date();

      days.push(
        <div
          key={day}
          onClick={() => onDateSelect(date)}
          className={`
            aspect-square p-1 xxs:p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all
            border-2
            ${isSelected ? 'border-primary bg-primary/10 scale-105' : 'border-transparent'}
            ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
            ${hasWorkout ? 'bg-gradient-to-br' : ''}
            ${isCompleted ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' : ''}
            ${!isCompleted && hasWorkout ? 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900' : ''}
            ${isMissed ? 'bg-red-50 dark:bg-red-950/20' : ''}
            ${!hasWorkout && !isMissed && scheduledProgram ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
            hover:shadow-md hover:scale-105 active:scale-95
          `}
        >
          <div className="h-full flex flex-col justify-between">
            {/* Day number */}
            <div className="flex items-center justify-between">
              <span className={`text-xs xxs:text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                {day}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-3 w-3 xxs:h-3.5 xxs:w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
            </div>

            {/* Program/Session indicator */}
            <div className="flex flex-col gap-0.5 mt-auto">
              {hasWorkout && (
                <div className="flex items-center gap-0.5">
                  <Dumbbell className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 flex-shrink-0" />
                  {session.totalVolume > 0 && (
                    <span className="text-[8px] xxs:text-[9px] font-medium truncate">
                      {Math.round(session.totalVolume)}kg
                    </span>
                  )}
                </div>
              )}
              {scheduledProgram && !hasWorkout && (
                <div className="text-[8px] xxs:text-[9px] truncate opacity-70">
                  {scheduledProgram.icon}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-3 xxs:p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 xxs:mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 xxs:h-9 xxs:w-9 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 xxs:h-5 xxs:w-5" />
          </Button>

          <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-center min-w-0 flex-1 truncate">
            {getMonthName(currentMonth + 1)} {currentYear}
          </h3>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 xxs:h-9 xxs:w-9 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-4 w-4 xxs:h-5 xxs:w-5" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 xxs:gap-1.5 sm:gap-2 mb-1 xxs:mb-2">
          {weekDays.map((day, index) => (
            <div key={day} className="text-center text-[10px] xxs:text-xs sm:text-sm font-semibold text-muted-foreground">
              <span className="hidden sm:inline">{weekDaysFull[index]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 xxs:gap-1.5 sm:gap-2">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="mt-4 xxs:mt-5 sm:mt-6 pt-3 xxs:pt-4 border-t">
          <div className="flex flex-wrap items-center justify-center gap-2 xxs:gap-3 sm:gap-4 text-[10px] xxs:text-xs">
            <div className="flex items-center gap-1 xxs:gap-1.5">
              <div className="h-3 w-3 xxs:h-4 xxs:w-4 rounded bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1 xxs:gap-1.5">
              <div className="h-3 w-3 xxs:h-4 xxs:w-4 rounded bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 border"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1 xxs:gap-1.5">
              <div className="h-3 w-3 xxs:h-4 xxs:w-4 rounded bg-blue-50 dark:bg-blue-950 border"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1 xxs:gap-1.5">
              <div className="h-3 w-3 xxs:h-4 xxs:w-4 rounded bg-red-50 dark:bg-red-950 border"></div>
              <span>Missed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
