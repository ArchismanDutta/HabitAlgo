import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import WorkoutCalendar from '@/components/gym/calendar/WorkoutCalendar';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useGymStore } from '@/store/useGymStore';
import { formatDate } from '@/utils/dateUtils';
import { Dumbbell, Clock, TrendingUp, Play, Eye, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function GymCalendarView() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const {
    sessionHistory,
    fetchSessionHistory,
    startWorkout
  } = useWorkoutStore();
  const { programs, fetchPrograms } = useGymStore();

  useEffect(() => {
    fetchPrograms();
    fetchMonthData();
  }, [currentMonth, currentYear]);

  const fetchMonthData = () => {
    // Calculate start and end dates for the month
    const startDate = formatDate(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
    const endDate = formatDate(new Date(currentYear, currentMonth + 1, 0), 'yyyy-MM-dd');

    fetchSessionHistory({ startDate, endDate });
  };

  const selectedSession = selectedDate
    ? sessionHistory.find(s => s.date === formatDate(selectedDate, 'yyyy-MM-dd'))
    : null;

  const selectedDayProgram = selectedDate
    ? programs.find(p => p.scheduledDays.includes(selectedDate.getDay()) && p.isActive)
    : null;

  const handleStartWorkout = async () => {
    if (!selectedDayProgram || !selectedDate) return;

    try {
      const dateStr = formatDate(selectedDate, 'yyyy-MM-dd');
      await startWorkout(selectedDayProgram._id, dateStr);
      toast.success('Workout started!');
      navigate('/gym/active-workout');
    } catch (error) {
      toast.error('Failed to start workout');
    }
  };

  const handleViewSession = () => {
    if (selectedSession) {
      // Navigate to session details or analytics
      toast.info('Session details coming soon!');
    }
  };

  const getMonthStats = () => {
    const completedSessions = sessionHistory.filter(s => s.completed);
    const totalVolume = sessionHistory.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
    const avgDuration = sessionHistory.length > 0
      ? sessionHistory.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionHistory.length
      : 0;

    return {
      totalWorkouts: completedSessions.length,
      totalVolume: Math.round(totalVolume),
      avgDuration: Math.round(avgDuration),
      missedWorkouts: sessionHistory.filter(s => !s.completed).length
    };
  };

  const stats = getMonthStats();

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header title="Workout Calendar" />

      <div className="container mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Month Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 text-center">
              <Dumbbell className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 mx-auto mb-1 xxs:mb-2 text-blue-500" />
              <div className="text-xl xxs:text-2xl sm:text-3xl font-bold">{stats.totalWorkouts}</div>
              <div className="text-[10px] xxs:text-xs text-muted-foreground">Workouts</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 text-center">
              <TrendingUp className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 mx-auto mb-1 xxs:mb-2 text-green-500" />
              <div className="text-xl xxs:text-2xl sm:text-3xl font-bold">{stats.totalVolume.toLocaleString()}</div>
              <div className="text-[10px] xxs:text-xs text-muted-foreground">Total Volume (kg)</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 text-center">
              <Clock className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 mx-auto mb-1 xxs:mb-2 text-orange-500" />
              <div className="text-xl xxs:text-2xl sm:text-3xl font-bold">{stats.avgDuration}</div>
              <div className="text-[10px] xxs:text-xs text-muted-foreground">Avg Duration (min)</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 text-center">
              <Calendar className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 mx-auto mb-1 xxs:mb-2 text-purple-500" />
              <div className="text-xl xxs:text-2xl sm:text-3xl font-bold">{stats.missedWorkouts}</div>
              <div className="text-[10px] xxs:text-xs text-muted-foreground">Missed</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <WorkoutCalendar
          sessions={sessionHistory}
          programs={programs}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={handleMonthChange}
        />

        {/* Selected Day Details */}
        {selectedDate && (
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
              <CardTitle className="text-base xxs:text-lg sm:text-xl">
                {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              {selectedSession ? (
                <div className="space-y-3 xxs:space-y-4">
                  {/* Session Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base xxs:text-lg font-semibold truncate">
                          {selectedSession.programName}
                        </h3>
                        {selectedSession.completed && (
                          <Badge className="bg-green-500 text-white flex-shrink-0">
                            Completed
                          </Badge>
                        )}
                        {!selectedSession.completed && (
                          <Badge variant="outline" className="flex-shrink-0">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 xxs:gap-3 text-xs xxs:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="h-3.5 w-3.5 xxs:h-4 xxs:w-4" />
                          <span>{selectedSession.exercises.length} exercises</span>
                        </div>
                        {selectedSession.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 xxs:h-4 xxs:w-4" />
                            <span>{selectedSession.duration} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 xxs:h-4 xxs:w-4" />
                          <span>{Math.round(selectedSession.totalVolume)} kg volume</span>
                        </div>
                        {selectedSession.bodyWeight && (
                          <div className="flex items-center gap-1.5">
                            <span>Body: {selectedSession.bodyWeight} kg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleViewSession}
                      className="flex-1 h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ) : selectedDayProgram ? (
                <div className="space-y-3 xxs:space-y-4">
                  {/* Scheduled Program */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{selectedDayProgram.icon}</span>
                      <div>
                        <h3 className="text-base xxs:text-lg font-semibold">
                          {selectedDayProgram.name}
                        </h3>
                        <p className="text-xs xxs:text-sm text-muted-foreground">
                          Scheduled for today
                        </p>
                      </div>
                    </div>
                    {selectedDayProgram.description && (
                      <p className="text-xs xxs:text-sm text-muted-foreground mb-2">
                        {selectedDayProgram.description}
                      </p>
                    )}
                    <p className="text-xs xxs:text-sm text-muted-foreground">
                      {selectedDayProgram.exercises.length} exercises planned
                    </p>
                  </div>

                  {/* Start Workout Button */}
                  <Button
                    onClick={handleStartWorkout}
                    className="w-full h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 xxs:py-8">
                  <Calendar className="h-10 w-10 xxs:h-12 xxs:w-12 mx-auto text-muted-foreground mb-3 xxs:mb-4" />
                  <p className="text-sm xxs:text-base text-muted-foreground mb-3 xxs:mb-4">
                    No workout scheduled or logged for this day
                  </p>
                  <Button
                    onClick={() => navigate('/gym/programs')}
                    variant="outline"
                    className="h-9 xxs:h-10 text-xs xxs:text-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Program
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
