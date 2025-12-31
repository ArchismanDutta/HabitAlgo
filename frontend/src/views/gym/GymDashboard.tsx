import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGymStore } from '@/store/useGymStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useSupplementStore } from '@/store/useSupplementStore';
import Header from '@/components/layout/Header';
import { Dumbbell, Calendar, TrendingUp, Trophy, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ProgramEditor from '@/components/gym/programs/ProgramEditor';

export default function GymDashboard() {
  const navigate = useNavigate();
  const { todayProgram, recentSessions, fetchTodayProgram, fetchRecentSessions } = useGymStore();
  const { startWorkout } = useWorkoutStore();
  const { latestMetrics, activeGoal, fetchLatestMetrics, fetchActiveGoal } = useMetricsStore();
  const { supplements, todayLogs, fetchSupplements, fetchTodayLogs, logSupplement } = useSupplementStore();

  const [starting, setStarting] = useState(false);
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodayProgram();
    fetchRecentSessions();
    fetchLatestMetrics();
    fetchActiveGoal();
    fetchSupplements();
    fetchTodayLogs();
  }, []);

  // Calculate weekly volume from recent sessions
  const weeklyVolume = recentSessions
    .filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    })
    .reduce((sum, s) => sum + (s.totalVolume || 0), 0);

  const handleStartWorkout = async () => {
    if (!todayProgram) return;

    setStarting(true);
    try {
      await startWorkout(todayProgram._id, today);
      toast.success('Workout started! 💪');
      navigate('/gym/active-workout');
    } catch (error) {
      toast.error('Failed to start workout');
      setStarting(false);
    }
  };

  const handleViewDetails = () => {
    setShowProgramEditor(true);
  };

  const handleSupplementToggle = async (supplementId: string) => {
    try {
      const currentHour = new Date().getHours();
      let timing: any = 'morning';

      if (currentHour < 12) timing = 'morning';
      else if (currentHour < 15) timing = 'pre_workout';
      else if (currentHour < 19) timing = 'post_workout';
      else timing = 'night';

      // Check if log already exists
      const existingLog = todayLogs.find(
        log => (typeof log.supplementId === 'string' ? log.supplementId : log.supplementId._id) === supplementId && log.timing === timing
      );

      await logSupplement(supplementId, today, timing, !existingLog?.taken);
      toast.success(existingLog?.taken ? 'Unchecked' : 'Checked! ✓');
    } catch (error) {
      toast.error('Failed to log supplement');
    }
  };

  const isSupplementTaken = (supplementId: string, timing: string) => {
    return todayLogs.some(
      log => (typeof log.supplementId === 'string' ? log.supplementId : log.supplementId._id) === supplementId &&
             log.timing === timing &&
             log.taken
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header title="Gym Dashboard" />

      <div className="container mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs xxs:text-sm text-muted-foreground truncate">Current Weight</p>
                  <p className="text-xl xxs:text-2xl sm:text-3xl font-bold mt-0.5 xxs:mt-1">{latestMetrics?.weight || '--'} <span className="text-sm xxs:text-base">kg</span></p>
                </div>
                <TrendingUp className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs xxs:text-sm text-muted-foreground truncate">Weekly Volume</p>
                  <p className="text-xl xxs:text-2xl sm:text-3xl font-bold mt-0.5 xxs:mt-1">{Math.round(weeklyVolume).toLocaleString()} <span className="text-sm xxs:text-base">kg</span></p>
                </div>
                <Dumbbell className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs xxs:text-sm text-muted-foreground truncate">Active Program</p>
                  <p className="text-base xxs:text-lg sm:text-xl font-bold truncate mt-0.5 xxs:mt-1">{todayProgram?.name || 'None'}</p>
                </div>
                <Calendar className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs xxs:text-sm text-muted-foreground truncate">Goal Progress</p>
                  <p className="text-xl xxs:text-2xl sm:text-3xl font-bold mt-0.5 xxs:mt-1">
                    {activeGoal ? `${Math.round((activeGoal.currentWeight - activeGoal.startWeight) / (activeGoal.targetWeight - activeGoal.startWeight) * 100)}%` : '--'}
                  </p>
                </div>
                <Trophy className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        {todayProgram && (
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base xxs:text-lg sm:text-xl">
                <Dumbbell className="h-4 w-4 xxs:h-5 xxs:w-5" />
                Today's Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="space-y-3 xxs:space-y-4">
                <div>
                  <h3 className="text-lg xxs:text-xl sm:text-2xl font-bold" style={{ color: todayProgram.color }}>
                    {todayProgram.icon} {todayProgram.name}
                  </h3>
                  {todayProgram.description && (
                    <p className="text-xs xxs:text-sm text-muted-foreground mt-1 xxs:mt-2">{todayProgram.description}</p>
                  )}
                  <p className="text-xs xxs:text-sm text-muted-foreground mt-1.5 xxs:mt-2">
                    {todayProgram.exercises.length} exercises
                  </p>
                </div>

                <div className="flex flex-col xxs:flex-row gap-2 xxs:gap-3">
                  <Button
                    onClick={handleStartWorkout}
                    disabled={starting}
                    className="flex-1 h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95"
                  >
                    {starting ? 'Starting...' : 'Start Workout'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewDetails}
                    className="h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Workout Today */}
        {!todayProgram && (
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-6 px-4 xxs:px-5 sm:px-6">
              <div className="text-center py-6 xxs:py-8 sm:py-10">
                <Calendar className="h-10 w-10 xxs:h-12 xxs:w-12 sm:h-14 sm:w-14 mx-auto text-muted-foreground mb-3 xxs:mb-4" />
                <h3 className="text-base xxs:text-lg sm:text-xl font-semibold mb-1.5 xxs:mb-2">No Workout Scheduled Today</h3>
                <p className="text-xs xxs:text-sm text-muted-foreground mb-3 xxs:mb-4 max-w-md mx-auto">
                  Rest day or create a program for today
                </p>
                <Button asChild className="h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95">
                  <Link to="/gym/programs">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Program
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xxs:gap-4 sm:gap-6">
          {/* Supplement Tracker */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
              <CardTitle className="flex items-center justify-between text-base xxs:text-lg sm:text-xl">
                <span>Today's Supplements</span>
                <Button variant="ghost" size="sm" asChild className="h-8 xxs:h-9 text-xs xxs:text-sm transition-all hover:scale-105">
                  <Link to="/gym/supplements">Manage</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              {supplements.filter(s => s.isActive).length === 0 ? (
                <div className="text-center py-4 xxs:py-6">
                  <p className="text-xs xxs:text-sm text-muted-foreground mb-2 xxs:mb-3">No supplements added yet</p>
                  <Button size="sm" asChild className="h-9 xxs:h-10 text-xs xxs:text-sm transition-all hover:scale-105 active:scale-95">
                    <Link to="/gym/supplements">
                      <Plus className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 mr-1.5 xxs:mr-2" />
                      Add Supplement
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 xxs:space-y-3">
                  {supplements.filter(s => s.isActive).map(supplement => (
                    <div key={supplement._id} className="flex items-center justify-between p-2.5 xxs:p-3 sm:p-4 border rounded-lg transition-all hover:shadow-md">
                      <div className="flex items-center gap-2 xxs:gap-3 min-w-0 flex-1">
                        <span className="text-xl xxs:text-2xl flex-shrink-0">{supplement.icon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm xxs:text-base truncate">{supplement.name}</p>
                          <p className="text-[10px] xxs:text-xs text-muted-foreground truncate">{supplement.dosage}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 xxs:gap-1 flex-shrink-0">
                        {supplement.timing.map(timing => (
                          <button
                            key={timing}
                            onClick={() => handleSupplementToggle(supplement._id)}
                            className={`px-1.5 xxs:px-2 py-1 text-[10px] xxs:text-xs rounded transition-all hover:scale-105 active:scale-95 min-h-[28px] ${
                              isSupplementTaken(supplement._id, timing)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {timing.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Progress */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
              <CardTitle className="flex items-center justify-between text-base xxs:text-lg sm:text-xl">
                <span>Recent Sessions</span>
                <Button variant="ghost" size="sm" asChild className="h-8 xxs:h-9 text-xs xxs:text-sm transition-all hover:scale-105">
                  <Link to="/gym/analytics">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              {recentSessions.length === 0 ? (
                <div className="text-center py-4 xxs:py-6">
                  <p className="text-xs xxs:text-sm text-muted-foreground">No workout sessions yet</p>
                  <p className="text-[10px] xxs:text-xs text-muted-foreground mt-1">Complete your first workout to see progress!</p>
                </div>
              ) : (
                <div className="space-y-2 xxs:space-y-3">
                  {recentSessions.slice(0, 5).map(session => (
                    <div key={session._id} className="flex items-center justify-between gap-3 p-2.5 xxs:p-3 sm:p-4 border rounded-lg transition-all hover:shadow-md">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm xxs:text-base truncate">{session.programName}</p>
                        <p className="text-[10px] xxs:text-xs text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} • {session.duration} min
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xs xxs:text-sm sm:text-base">{Math.round(session.totalVolume)} kg</p>
                        <p className="text-[10px] xxs:text-xs text-muted-foreground">volume</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 xxs:gap-3 sm:gap-4">
          <Button variant="outline" className="h-16 xxs:h-20 sm:h-24 transition-all hover:scale-105 hover:shadow-md active:scale-95" asChild>
            <Link to="/gym/calendar" className="flex flex-col gap-1.5 xxs:gap-2">
              <Calendar className="h-5 w-5 xxs:h-6 xxs:w-6 sm:h-7 sm:w-7" />
              <span className="text-xs xxs:text-sm sm:text-base font-medium">Calendar</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 xxs:h-20 sm:h-24 transition-all hover:scale-105 hover:shadow-md active:scale-95" asChild>
            <Link to="/gym/programs" className="flex flex-col gap-1.5 xxs:gap-2">
              <Dumbbell className="h-5 w-5 xxs:h-6 xxs:w-6 sm:h-7 sm:w-7" />
              <span className="text-xs xxs:text-sm sm:text-base font-medium">Programs</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 xxs:h-20 sm:h-24 transition-all hover:scale-105 hover:shadow-md active:scale-95" asChild>
            <Link to="/gym/exercises" className="flex flex-col gap-1.5 xxs:gap-2">
              <Trophy className="h-5 w-5 xxs:h-6 xxs:w-6 sm:h-7 sm:w-7" />
              <span className="text-xs xxs:text-sm sm:text-base font-medium">Exercises</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 xxs:h-20 sm:h-24 transition-all hover:scale-105 hover:shadow-md active:scale-95" asChild>
            <Link to="/gym/metrics" className="flex flex-col gap-1.5 xxs:gap-2">
              <TrendingUp className="h-5 w-5 xxs:h-6 xxs:w-6 sm:h-7 sm:w-7" />
              <span className="text-xs xxs:text-sm sm:text-base font-medium">Metrics</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 xxs:h-20 sm:h-24 transition-all hover:scale-105 hover:shadow-md active:scale-95" asChild>
            <Link to="/gym/analytics" className="flex flex-col gap-1.5 xxs:gap-2">
              <TrendingUp className="h-5 w-5 xxs:h-6 xxs:w-6 sm:h-7 sm:w-7" />
              <span className="text-xs xxs:text-sm sm:text-base font-medium">Analytics</span>
            </Link>
          </Button>
        </div>

        {/* Program Editor Modal */}
        {todayProgram && (
          <ProgramEditor
            program={todayProgram}
            open={showProgramEditor}
            onOpenChange={setShowProgramEditor}
            onSuccess={fetchTodayProgram}
          />
        )}
      </div>
    </div>
  );
}
