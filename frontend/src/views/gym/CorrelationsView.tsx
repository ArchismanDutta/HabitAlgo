import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { correlationService, CorrelationData } from '@/services/correlationService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Brain, Bed, Smile } from 'lucide-react';

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
        <div className="container mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-7 w-7 xxs:h-8 xxs:w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-3 xxs:mb-4"></div>
              <p className="text-sm xxs:text-base text-muted-foreground">Analyzing correlations...</p>
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
        <div className="container mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6">
          <Card>
            <CardContent className="py-8 xxs:py-10 sm:py-12 text-center">
              <Brain className="h-10 w-10 xxs:h-12 xxs:w-12 mx-auto text-muted-foreground mb-3 xxs:mb-4" />
              <h3 className="text-base xxs:text-lg font-semibold mb-1.5 xxs:mb-2">Not Enough Data</h3>
              <p className="text-xs xxs:text-sm text-muted-foreground max-w-md mx-auto">
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

      <div className="container mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6">
        {/* Time Range Selector */}
        <Card>
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xxs:gap-4">
              <div>
                <h3 className="text-base xxs:text-lg font-semibold">Analysis Period</h3>
                <p className="text-xs xxs:text-sm text-muted-foreground">
                  {data.totalWorkouts} workouts analyzed
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {[7, 14, 30, 60, 90].map(days => (
                  <Button
                    key={days}
                    size="sm"
                    variant={timeRange === days ? 'default' : 'outline'}
                    onClick={() => setTimeRange(days)}
                    className="h-8 xxs:h-9 text-xs xxs:text-sm transition-all hover:scale-105 active:scale-95"
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
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5">
              <CardTitle className="flex items-center gap-2 text-base xxs:text-lg sm:text-xl">
                <Brain className="h-4 w-4 xxs:h-5 xxs:w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 space-y-3 xxs:space-y-4">
              {data.habitCorrelations.slice(0, 3).map((habit, index) => (
                <div
                  key={habit.habitId}
                  className="bg-background rounded-lg p-3 xxs:p-4 border-l-4 transition-all hover:shadow-md"
                  style={{ borderLeftColor: habit.habitColor }}
                >
                  <div className="flex items-start gap-2 xxs:gap-3">
                    <span className="text-2xl xxs:text-3xl flex-shrink-0">{habit.habitIcon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm xxs:text-base mb-1">{habit.habitName}</h4>
                      <div className="flex items-center gap-1.5 xxs:gap-2 mb-2">
                        {habit.volumeImpact > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`text-xs xxs:text-sm font-medium ${habit.volumeImpact > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {habit.volumeImpact > 0 ? '+' : ''}{habit.volumeImpact.toFixed(1)}% volume
                        </span>
                      </div>
                      <p className="text-xs xxs:text-sm text-muted-foreground">
                        Avg: <span className="font-medium text-foreground">{habit.avgVolumeWhenCompleted}kg</span> when completed vs{' '}
                        <span className="font-medium text-foreground">{habit.avgVolumeWhenNotCompleted}kg</span> when skipped
                      </p>
                      <p className="text-[10px] xxs:text-xs text-muted-foreground mt-1">
                        Based on {habit.sampleSize} workouts ({habit.daysCompleted} completed, {habit.daysNotCompleted} skipped)
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
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5">
              <CardTitle className="text-base xxs:text-lg sm:text-xl">Habit Impact on Volume</CardTitle>
              <p className="text-xs xxs:text-sm text-muted-foreground">How each habit affects your lifting performance</p>
            </CardHeader>
            <CardContent className="px-2 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.habitCorrelations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Impact (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis
                    type="category"
                    dataKey="habitName"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const habit = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-2 xxs:p-3 shadow-lg">
                            <p className="font-semibold text-sm">{habit.habitName}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Completed: {habit.avgVolumeWhenCompleted}kg avg
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Skipped: {habit.avgVolumeWhenNotCompleted}kg avg
                            </p>
                            <p className="text-xs font-medium mt-1">
                              Impact: {habit.volumeImpact > 0 ? '+' : ''}{habit.volumeImpact}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="volumeImpact" radius={[0, 4, 4, 0]}>
                    {data.habitCorrelations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.volumeImpact > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sleep Correlation */}
        {data.sleepCorrelation && data.sleepCorrelation.length > 0 && (
          <Card>
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5">
              <CardTitle className="flex items-center gap-2 text-base xxs:text-lg sm:text-xl">
                <Bed className="h-4 w-4 xxs:h-5 xxs:w-5" />
                Sleep Impact
              </CardTitle>
              <p className="text-xs xxs:text-sm text-muted-foreground">How sleep affects your performance</p>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 xxs:gap-3">
                {data.sleepCorrelation.map(sleep => (
                  <div
                    key={sleep.range}
                    className="bg-accent rounded-lg p-3 xxs:p-4 text-center transition-all hover:shadow-md"
                  >
                    <div className="text-xl xxs:text-2xl font-bold text-primary">{sleep.avgVolume}kg</div>
                    <div className="text-xs xxs:text-sm font-medium mt-1">{sleep.range}</div>
                    <div className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5">
                      {sleep.sampleSize} workouts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Correlation */}
        {data.moodCorrelation && data.moodCorrelation.length > 0 && (
          <Card>
            <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5">
              <CardTitle className="flex items-center gap-2 text-base xxs:text-lg sm:text-xl">
                <Smile className="h-4 w-4 xxs:h-5 xxs:w-5" />
                Mood Impact
              </CardTitle>
              <p className="text-xs xxs:text-sm text-muted-foreground">How mood affects your performance</p>
            </CardHeader>
            <CardContent className="px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xxs:gap-3">
                {data.moodCorrelation.map(mood => (
                  <div
                    key={mood.level}
                    className="bg-accent rounded-lg p-3 xxs:p-4 text-center transition-all hover:shadow-md"
                  >
                    <div className="text-xl xxs:text-2xl font-bold text-primary">{mood.avgVolume}kg</div>
                    <div className="text-xs xxs:text-sm font-medium mt-1">{mood.level}</div>
                    <div className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5">
                      {mood.sampleSize} workouts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for No Correlations */}
        {data.habitCorrelations.length === 0 && (
          <Card>
            <CardContent className="py-8 xxs:py-10 sm:py-12 text-center">
              <Brain className="h-10 w-10 xxs:h-12 xxs:w-12 mx-auto text-muted-foreground mb-3 xxs:mb-4" />
              <h3 className="text-base xxs:text-lg font-semibold mb-1.5 xxs:mb-2">No Correlations Yet</h3>
              <p className="text-xs xxs:text-sm text-muted-foreground max-w-md mx-auto">
                Track your habits consistently alongside workouts to discover meaningful patterns!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
