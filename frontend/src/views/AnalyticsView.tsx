import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { analyticsService } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { ChevronLeft, ChevronRight, TrendingUp, Target, Flame } from 'lucide-react';
import { getMonthName } from '@/utils/dateUtils';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '@/types';

export default function AnalyticsView() {
  const { selectedYear, selectedMonth, navigateMonth } = useCalendarStore();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [selectedYear, selectedMonth]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getChartData(selectedYear, selectedMonth);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-6xl mx-auto p-4">
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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Month Navigator */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <CardTitle className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-center min-w-0 flex-1">
                <span className="hidden sm:inline">{getMonthName(selectedMonth)} {selectedYear} Analytics</span>
                <span className="sm:hidden truncate block">{getMonthName(selectedMonth)} {selectedYear}</span>
              </CardTitle>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Completion
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {chartData?.overallCompletion.rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {chartData?.overallCompletion.completed} of{' '}
                {chartData?.overallCompletion.total} possible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Habits
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {chartData?.habitStats.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tracked this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Best Habit
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {chartData?.habitStats[0] ? (
                <>
                  <div className="text-2xl font-bold">
                    {chartData.habitStats[0].icon} {chartData.habitStats[0].name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chartData.habitStats[0].rate.toFixed(0)}% completion
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData?.dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habit Ranking Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Habit Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData?.habitStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#6366f1">
                    {chartData?.habitStats.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
