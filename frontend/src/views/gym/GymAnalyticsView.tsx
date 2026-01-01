import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useMetricsStore } from '@/store/useMetricsStore';
import { gymAnalyticsService } from '@/services/gymAnalyticsService';
import Header from '@/components/layout/Header';
import { TrendingUp, Calendar, Dumbbell, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function GymAnalyticsView() {
  const { sessionHistory, fetchSessionHistory } = useWorkoutStore();
  const { metrics, fetchMetrics } = useMetricsStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [volumeData, setVolumeData] = useState<any>(null);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [personalRecords, setPersonalRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);

  const tabs = ['volume', 'prs', 'sessions', 'body'];
  const tabLabels = ['Volume', 'PRs', 'Sessions', 'Body Metrics'];

  useEffect(() => {
    // Debounce analytics fetching to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const endDate = new Date().toISOString().split('T')[0];
          let startDate = new Date();
          let days = 30;

          if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
            days = 7;
          } else if (timeRange === 'month') {
            startDate.setDate(startDate.getDate() - 30);
            days = 30;
          } else {
            startDate.setFullYear(startDate.getFullYear() - 1);
            days = 365;
          }

          // Fetch analytics from backend
          const [volume, summary, prs] = await Promise.all([
            gymAnalyticsService.getVolumeAnalytics({ period: timeRange }),
            gymAnalyticsService.getProgressSummary(days),
            gymAnalyticsService.getPersonalRecords()
          ]);

          setVolumeData(volume);
          setProgressSummary(summary);
          setPersonalRecords(prs);

          // Also fetch for UI
          fetchSessionHistory({
            startDate: startDate.toISOString().split('T')[0],
            endDate
          });

          fetchMetrics({
            startDate: startDate.toISOString().split('T')[0],
            endDate
          });
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          toast.error('Failed to load analytics data');
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [timeRange]);

  // Use backend analytics data when available, fallback to client-side calculations
  const totalVolume = volumeData?.summary?.totalVolume || 0;
  const totalWorkouts = volumeData?.summary?.totalWorkouts || 0;
  const avgDuration = progressSummary?.duration?.average || 0;
  const volumeByDate = volumeData?.volumeData || [];

  const handleSwipe = (swipeDirection: number) => {
    const newIndex = activeTab + swipeDirection;
    if (newIndex >= 0 && newIndex < tabs.length) {
      setDirection(swipeDirection);
      setActiveTab(newIndex);
    }
  };

  const handleDotClick = (index: number) => {
    setDirection(index > activeTab ? 1 : -1);
    setActiveTab(index);
  };

  const renderTabContent = (tabValue: string) => {
    switch (tabValue) {
      case 'volume':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Volume Progression</CardTitle>
            </CardHeader>
            <CardContent>
              {volumeByDate.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No workout data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {volumeByDate.map((data: any) => {
                    const maxVolume = Math.max(...volumeByDate.map((v: any) => v.volume));
                    return (
                      <div key={data.date} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm sm:text-base font-semibold">
                            {new Date(data.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {data.sessionCount} workout{data.sessionCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 sm:h-9 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-8 sm:h-9 rounded-full flex items-center justify-end px-3 transition-all duration-300 hover:from-orange-600 hover:to-orange-700"
                            style={{ width: `${Math.max((data.volume / maxVolume) * 100, 8)}%` }}
                          >
                            <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                              {Math.round(data.volume)} kg
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'prs':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Personal Records</CardTitle>
            </CardHeader>
            <CardContent>
              {!personalRecords || personalRecords.groupedByExercise.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No personal records yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete workouts to set PRs!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {personalRecords.groupedByExercise.map((group: any) => (
                    <div key={group.exerciseId} className="border rounded-lg p-3 sm:p-4">
                      <h3 className="font-bold mb-3 text-sm sm:text-base">{group.exerciseName}</h3>
                      <div className="space-y-2">
                        {group.records.map((pr: any) => (
                          <div key={pr._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="flex-1">
                              <span className="text-xs sm:text-sm font-medium">
                                {pr.type === '1RM' ? '1RM' : pr.type === 'max_reps' ? 'Max Reps' : 'Max Volume'}
                              </span>
                              {pr.weight && pr.reps && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {pr.weight} kg × {pr.reps} reps
                                </p>
                              )}
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 sm:text-right">
                              <p className="font-bold text-green-600 text-base sm:text-lg">{pr.value.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(pr.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: window.innerWidth >= 640 ? 'numeric' : undefined
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'sessions':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No workouts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map(session => (
                    <div key={session._id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="font-bold text-sm sm:text-base">{session.programName}</h3>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Duration</p>
                          <p className="font-medium text-sm sm:text-base">{session.duration} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Volume</p>
                          <p className="font-medium text-sm sm:text-base">{Math.round(session.totalVolume)} kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Exercises</p>
                          <p className="font-medium text-sm sm:text-base">{session.exercises.length}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'body':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Body Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No body metrics yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {metrics.map(metric => (
                    <div key={metric._id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {new Date(metric.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {metric.bodyFat && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Body Fat: {metric.bodyFat}%
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl sm:text-2xl font-bold">{metric.weight} kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gym Analytics" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Performance Analytics</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setTimeRange('week')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                timeRange === 'week' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                timeRange === 'month' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                timeRange === 'year' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Volume</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{Math.round(totalVolume).toLocaleString()} kg</p>
                  </div>
                  <Dumbbell className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500 shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Workouts</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalWorkouts}</p>
                  </div>
                  <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500 shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Avg Duration</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Math.round(avgDuration)} min</p>
                  </div>
                  <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-green-500 shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Personal Records</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{personalRecords?.totalPRs || 0}</p>
                  </div>
                  <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-500 shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile Swipeable View */}
        <div className="sm:hidden">
          {/* Tab Title with Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleSwipe(-1)}
              disabled={activeTab === 0}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold">{tabLabels[activeTab]}</h3>

            <button
              onClick={() => handleSwipe(1)}
              disabled={activeTab === tabs.length - 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Swipeable Content */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderTabContent(tabs[activeTab])}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-0.5 mt-2">
            {tabs.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-0.5 rounded-full transition-all ${
                  index === activeTab ? 'w-3 bg-primary' : 'w-0.5 bg-muted-foreground/30'
                }`}
                aria-label={`Go to ${tabLabels[index]}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Tabs View */}
        <Tabs defaultValue="volume" className="w-full hidden sm:block">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="prs">PRs</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="mt-6">
            {renderTabContent('volume')}
          </TabsContent>

          <TabsContent value="prs" className="mt-6">
            {renderTabContent('prs')}
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            {renderTabContent('sessions')}
          </TabsContent>

          <TabsContent value="body" className="mt-6">
            {renderTabContent('body')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
