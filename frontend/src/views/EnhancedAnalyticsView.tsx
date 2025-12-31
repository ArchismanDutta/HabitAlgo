import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { analyticsService } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { getMonthName } from '@/utils/dateUtils';
import { ChartData } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import MoodWeatherTracker from '@/components/tracking/MoodWeatherTracker';

export default function EnhancedAnalyticsView() {
  const { selectedYear, selectedMonth, navigateMonth } = useCalendarStore();
  const { habits } = useHabitStore();
  const { logs } = useLogStore();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyReview, setMonthlyReview] = useState({
    start: '',
    stop: '',
    continue: ''
  });

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getChartData(selectedYear, selectedMonth);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTop3Habits = () => {
    if (!chartData) return [];
    return chartData.habitStats.slice(0, 3);
  };

  const getCategoryBreakdown = () => {
    if (!habits.length) return [];

    const categoryStats = habits.reduce((acc, habit) => {
      const category = habit.category;
      if (!acc[category]) {
        acc[category] = { count: 0, completed: 0 };
      }
      acc[category].count++;

      // Count completions for this month
      Object.values(logs).forEach(dayLogs => {
        const log = dayLogs.find(l => l.habitId === habit._id);
        if (log?.completed) {
          acc[category].completed++;
        }
      });

      return acc;
    }, {} as Record<string, { count: number; completed: number }>);

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      percentage: stats.count > 0 ? (stats.completed / (stats.count * 31)) * 100 : 0,
      completed: stats.completed,
      total: stats.count * 31
    }));
  };

  const getAverageMetrics = () => {
    // Calculate average mood, sleep from logs
    const moodValues: number[] = [];
    const sleepValues: number[] = [];

    Object.values(logs).forEach(dayLogs => {
      dayLogs.forEach(log => {
        if (log.mood) moodValues.push(log.mood);
        if (log.screenTime?.morning) sleepValues.push(log.screenTime.morning);
      });
    });

    const avgMood = moodValues.length > 0
      ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
      : 0;

    const avgSleep = sleepValues.length > 0
      ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
      : 0;

    return { avgMood, avgSleep };
  };

  const getMoodEmoji = (value: number) => {
    if (value >= 4.5) return '🤩';
    if (value >= 3.5) return '😊';
    if (value >= 2.5) return '😐';
    return '😰';
  };

  const saveMonthlyReview = () => {
    // Save to localStorage for now
    localStorage.setItem(
      `review-${selectedYear}-${selectedMonth}`,
      JSON.stringify(monthlyReview)
    );
  };

  const categoryBreakdown = getCategoryBreakdown();
  const { avgMood, avgSleep } = getAverageMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-7xl mx-auto p-4 space-y-6">
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
                {getMonthName(selectedMonth)} {selectedYear} - Enhanced Analytics
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
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Completion Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="bg-pink-100 dark:bg-pink-900 px-4 py-2 rounded">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {chartData?.overallCompletion.completed} out of {chartData?.overallCompletion.total}
                  </div>
                  <div className="text-muted-foreground">Total habit completions</div>
                </div>

                {/* Bar Chart for daily breakdown */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData?.dailyData.slice(-7)}>
                      <XAxis dataKey="day" />
                      <Bar dataKey="completed" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-semibold">Weekly progress</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{chartData?.overallCompletion.rate.toFixed(2)}%</span>
                    <div className="w-32 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${chartData?.overallCompletion.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood & Weather Tracker */}
            <MoodWeatherTracker />

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown.map(({ category, percentage, completed, total }) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        {completed}/{total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top 3 Habits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top 3 Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTop3Habits().map((habit, index) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-950 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{habit.icon}</span>
                        <span className="font-semibold">{habit.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {habit.rate.toFixed(0)}% completion
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Average Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Average Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMoodEmoji(avgMood)}</span>
                    <span className="font-medium">Average mood</span>
                  </div>
                  <span className="text-3xl">{getMoodEmoji(avgMood)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😴</span>
                    <span className="font-medium">Average sleep</span>
                  </div>
                  <span className="text-xl font-bold">{avgSleep.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">☀️</span>
                    <span className="font-medium">Average weather</span>
                  </div>
                  <span className="text-3xl">☀️</span>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Completed',
                          value: chartData?.overallCompletion.completed || 0,
                        },
                        {
                          name: 'Remaining',
                          value:
                            (chartData?.overallCompletion.total || 0) -
                            (chartData?.overallCompletion.completed || 0),
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      <Cell fill="#ec4899" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Review */}
            <Card>
              <CardHeader>
                <CardTitle className="bg-secondary px-4 py-2 rounded">
                  Monthly Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Start</Label>
                  <Textarea
                    placeholder="What new habits should I start?"
                    value={monthlyReview.start}
                    onChange={(e) =>
                      setMonthlyReview({ ...monthlyReview, start: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Stop</Label>
                  <Textarea
                    placeholder="What should I stop doing?"
                    value={monthlyReview.stop}
                    onChange={(e) =>
                      setMonthlyReview({ ...monthlyReview, stop: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Continue</Label>
                  <Textarea
                    placeholder="What's working well?"
                    value={monthlyReview.continue}
                    onChange={(e) =>
                      setMonthlyReview({ ...monthlyReview, continue: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <Button onClick={saveMonthlyReview} className="w-full">
                  Save Monthly Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
