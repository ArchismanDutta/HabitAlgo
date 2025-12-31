import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useMetricsStore } from '@/store/useMetricsStore';
import { gymAnalyticsService } from '@/services/gymAnalyticsService';
import Header from '@/components/layout/Header';
import { TrendingUp, Calendar, Dumbbell, Trophy } from 'lucide-react';

export default function GymAnalyticsView() {
  const { sessionHistory, fetchSessionHistory } = useWorkoutStore();
  const { metrics, fetchMetrics } = useMetricsStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [volumeData, setVolumeData] = useState<any>(null);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [personalRecords, setPersonalRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gym Analytics" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'week' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'month' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'year' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">{Math.round(totalVolume).toLocaleString()} kg</p>
                  </div>
                  <Dumbbell className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workouts</p>
                    <p className="text-2xl font-bold">{totalWorkouts}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-bold">{Math.round(avgDuration)} min</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Personal Records</p>
                    <p className="text-2xl font-bold">{personalRecords?.totalPRs || 0}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for different analytics */}
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="prs">PRs</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Volume Progression</CardTitle>
              </CardHeader>
              <CardContent>
                {volumeByDate.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No workout data yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {volumeByDate.map((data: any) => {
                      const maxVolume = Math.max(...volumeByDate.map((v: any) => v.volume));
                      return (
                        <div key={data.date} className="flex items-center gap-4">
                          <p className="text-sm w-24">{new Date(data.date).toLocaleDateString()}</p>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                              <div
                                className="bg-orange-500 h-6 rounded-full flex items-center justify-end px-2"
                                style={{ width: `${(data.volume / maxVolume) * 100}%` }}
                              >
                                <span className="text-xs text-white font-bold">{Math.round(data.volume)} kg</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground w-20">{data.sessionCount} workout{data.sessionCount !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
              </CardHeader>
              <CardContent>
                {!personalRecords || personalRecords.groupedByExercise.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No personal records yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete workouts to set PRs!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {personalRecords.groupedByExercise.map((group: any) => (
                      <div key={group.exerciseId} className="border rounded-lg p-4">
                        <h3 className="font-bold mb-3">{group.exerciseName}</h3>
                        <div className="space-y-2">
                          {group.records.map((pr: any) => (
                            <div key={pr._id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <div>
                                <span className="text-sm font-medium">
                                  {pr.type === '1RM' ? '1RM' : pr.type === 'max_reps' ? 'Max Reps' : 'Max Volume'}
                                </span>
                                {pr.weight && pr.reps && (
                                  <p className="text-xs text-muted-foreground">
                                    {pr.weight} kg × {pr.reps} reps
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{pr.value.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(pr.date).toLocaleDateString()}
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
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No workouts yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionHistory.map(session => (
                      <div key={session._id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{session.programName}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{session.duration} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume</p>
                            <p className="font-medium">{Math.round(session.totalVolume)} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Exercises</p>
                            <p className="font-medium">{session.exercises.length}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Body Weight Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No body metrics yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.map(metric => (
                      <div key={metric._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(metric.date).toLocaleDateString()}</p>
                          {metric.bodyFat && (
                            <p className="text-xs text-muted-foreground">Body Fat: {metric.bodyFat}%</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{metric.weight} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
