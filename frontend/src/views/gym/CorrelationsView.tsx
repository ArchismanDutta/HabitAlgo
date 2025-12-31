import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { correlationService, CorrelationData } from '@/services/correlationService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Brain, Bed, Smile } from 'lucide-react';

export default function CorrelationsView() {
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchCorrelations();
  }, [timeRange]);

  const fetchCorrelations = async () => {
    setLoading(true);
    try {
      const correlationData = await correlationService.getHabitGymCorrelation(timeRange);
      setData(correlationData);
    } catch (error) {
      console.error('Failed to load correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header title="Habit × Gym Insights" />
        <div className="container mx-auto px-3 sm:px-6 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing correlations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.totalWorkouts < 3) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header title="Habit × Gym Insights" />
        <div className="container mx-auto px-3 sm:px-6 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Enough Data</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Complete at least 3 workouts to see how your habits impact your gym performance!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header title="Habit × Gym Insights" />

      <div className="container mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Time Range Selector */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Analysis Period</h3>
                <p className="text-sm text-muted-foreground">
                  {data.totalWorkouts} workouts analyzed
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[7, 14, 30, 60, 90].map(days => (
                  <Button
                    key={days}
                    size="sm"
                    variant={timeRange === days ? 'default' : 'outline'}
                    onClick={() => setTimeRange(days)}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Insights */}
        {data.habitCorrelations.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.habitCorrelations.slice(0, 3).map(habit => (
                <div
                  key={habit.habitId}
                  className="bg-background rounded-lg p-4 border-l-4 hover:shadow-md transition"
                  style={{ borderLeftColor: habit.habitColor }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{habit.habitIcon}</span>
                    <div>
                      <h4 className="font-semibold mb-1">{habit.habitName}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {habit.volumeImpact > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            habit.volumeImpact > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {habit.volumeImpact > 0 ? '+' : ''}
                          {habit.volumeImpact.toFixed(1)}% volume
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg: <span className="font-medium">{habit.avgVolumeWhenCompleted}kg</span> when completed vs{' '}
                        <span className="font-medium">{habit.avgVolumeWhenNotCompleted}kg</span> when skipped
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {habit.sampleSize} workouts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Habit Correlations Chart */}
        {data.habitCorrelations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Habit Impact on Volume</CardTitle>
              <p className="text-sm text-muted-foreground">
                How each habit affects your lifting performance
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.habitCorrelations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="habitName" width={90} />
                  <Tooltip />
                  <Bar dataKey="volumeImpact" radius={[0, 4, 4, 0]}>
                    {data.habitCorrelations.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.volumeImpact > 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sleep Correlation */}
        {data.sleepCorrelation?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Sleep Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.sleepCorrelation.map(sleep => (
                <div
                  key={sleep.range}
                  className="bg-accent rounded-lg p-4 text-center hover:shadow-md transition"
                >
                  <div className="text-2xl font-bold text-primary">
                    {sleep.avgVolume}kg
                  </div>
                  <div className="text-sm font-medium mt-1">{sleep.range}</div>
                  <div className="text-xs text-muted-foreground">
                    {sleep.sampleSize} workouts
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mood Correlation */}
        {data.moodCorrelation?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5" />
                Mood Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.moodCorrelation.map(mood => (
                <div
                  key={mood.level}
                  className="bg-accent rounded-lg p-4 text-center hover:shadow-md transition"
                >
                  <div className="text-2xl font-bold text-primary">
                    {mood.avgVolume}kg
                  </div>
                  <div className="text-sm font-medium mt-1">{mood.level}</div>
                  <div className="text-xs text-muted-foreground">
                    {mood.sampleSize} workouts
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
