import { useEffect, useState } from 'react';
import financeService from '../../services/financeService';
import { Card } from '../../components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Calendar, AlertCircle, ShoppingBag } from 'lucide-react';
import type { SpendingTrend, CategoryBreakdown, DayOfWeekSpending, TimeOfDaySpending, ImpulseAnalysis, TopMerchant } from '../../types/finance';
import Header from '../../components/layout/Header';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function FinanceAnalyticsView() {
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekSpending[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDaySpending[]>([]);
  const [impulseAnalysis, setImpulseAnalysis] = useState<ImpulseAnalysis | null>(null);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [
        trendsData,
        categoriesData,
        dayOfWeekData,
        timeOfDayData,
        impulseData,
        merchantsData
      ] = await Promise.all([
        financeService.analytics.getTrends(6),
        financeService.analytics.getCategoryBreakdown(),
        financeService.analytics.getDayOfWeekSpending(),
        financeService.analytics.getTimeOfDaySpending(),
        financeService.analytics.getImpulseAnalysis(),
        financeService.analytics.getTopMerchants()
      ]);

      setTrends(trendsData);
      setCategories(categoriesData);
      setDayOfWeek(dayOfWeekData);
      setTimeOfDay(timeOfDayData);
      setImpulseAnalysis(impulseData);
      setTopMerchants(merchantsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
        <h1 className="text-3xl font-bold">Financial Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your spending patterns</p>
      </div>

      {/* Spending Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Spending Trends (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="totalIncome" stroke="#10b981" name="Income" strokeWidth={2} />
            <Line type="monotone" dataKey="totalExpenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
            <Line type="monotone" dataKey="netSavings" stroke="#3b82f6" name="Net Savings" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories.slice(0, 8)}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category.replace('_', ' ')} (${formatCurrency(entry.amount)})`}
              >
                {categories.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 5).map((cat, index) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm capitalize">{cat.category.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(cat.amount / categories[0].amount) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{cat.count} transactions</span>
                  <span>Avg: {formatCurrency(cat.amount / cat.count)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Day of Week Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Spending by Day of Week
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayOfWeek}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Bar dataKey="total" fill="#3b82f6" name="Total Spending" />
            <Bar dataKey="average" fill="#10b981" name="Avg per Transaction" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {dayOfWeek.map((day) => (
            <div key={day.day} className="text-center p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">{day.day}</p>
              <p className="text-lg font-bold">{formatCurrency(day.total)}</p>
              <p className="text-xs text-muted-foreground">{day.count} transactions</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Time of Day Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Spending by Time of Day
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timeOfDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeRange" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Bar dataKey="total" fill="#8b5cf6" name="Total Spending" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            <strong>Insight:</strong> Late night and weekend spending often indicates impulsive purchases
          </p>
        </div>
      </Card>

      {/* Impulse Spending Analysis */}
      {impulseAnalysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Impulse Spending Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Impulse</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(impulseAnalysis.totalImpulse)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {impulseAnalysis.impulsePercentage.toFixed(1)}% of total spending
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Impulse Transactions</p>
              <p className="text-3xl font-bold text-orange-600">{impulseAnalysis.impulseCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {impulseAnalysis.totalCount} total transactions
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Impulse Amount</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(impulseAnalysis.avgImpulseAmount)}</p>
              <p className="text-sm text-muted-foreground mt-1">per transaction</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Top Impulse Categories</h4>
            <div className="space-y-2">
              {impulseAnalysis.topCategories.map((cat) => (
                <div key={cat.category} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{cat.category.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{cat.count} impulse purchases</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(cat.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Top Merchants */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Where Your Money Goes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topMerchants.map((merchant, index) => (
            <div key={merchant.merchant} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <span className="font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium">{merchant.merchant}</p>
                  <p className="text-sm text-muted-foreground">
                    {merchant.count} visits • Avg: {formatCurrency(merchant.avgAmount)}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold">{formatCurrency(merchant.total)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights Panel */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="space-y-3">
          {impulseAnalysis && impulseAnalysis.impulsePercentage > 20 && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium">High Impulse Spending</p>
                <p className="text-sm text-muted-foreground">
                  {impulseAnalysis.impulsePercentage.toFixed(1)}% of your spending is impulsive. Consider implementing a 24-hour rule for non-essential purchases.
                </p>
              </div>
            </div>
          )}

          {dayOfWeek.length > 0 && (
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Peak Spending Day</p>
                <p className="text-sm text-muted-foreground">
                  You spend most on {dayOfWeek.reduce((max, day) => day.total > max.total ? day : max).day}. Plan accordingly for better budgeting.
                </p>
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex items-start gap-3">
              <ShoppingBag className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Top Spending Category</p>
                <p className="text-sm text-muted-foreground">
                  {categories[0].category.replace('_', ' ')} accounts for {formatCurrency(categories[0].amount)} this month. Track it with a budget for better control.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}