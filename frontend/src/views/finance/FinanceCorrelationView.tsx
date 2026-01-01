import { useEffect, useState } from 'react';
import financeService from '../../services/financeService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Target, Heart, AlertCircle, Activity, ArrowDown, ArrowUp } from 'lucide-react';
import type { CorrelationData } from '../../types/finance';
import Header from '../../components/layout/Header';

export default function FinanceCorrelationView() {
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(90); // days

  useEffect(() => {
    loadCorrelations();
  }, [dateRange]);

  const loadCorrelations = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const data = await financeService.correlations.getHabitFinanceCorrelation(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setCorrelationData(data);
    } catch (error) {
      console.error('Failed to load correlations:', error);
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

  const getImpactColor = (impact: number) => {
    if (impact < -10) return '#10b981'; // Green - saves money
    if (impact > 10) return '#ef4444'; // Red - costs money
    return '#6b7280'; // Gray - neutral
  };

  const getImpactLabel = (impact: number) => {
    if (impact < -30) return 'Excellent';
    if (impact < -10) return 'Good';
    if (impact < -5) return 'Moderate';
    if (impact > 30) return 'Poor';
    if (impact > 10) return 'Concerning';
    return 'Neutral';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Analyzing habit-finance correlations...</p>
        </div>
      </div>
    );
  }

  if (!correlationData) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">No correlation data available. Add more transactions and track habits to see insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Habit-Finance Correlation</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover how your habits affect your spending
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={dateRange === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(30)}
            className="flex-1 sm:flex-none min-w-[80px]"
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(90)}
            className="flex-1 sm:flex-none min-w-[80px]"
          >
            90 Days
          </Button>
          <Button
            variant={dateRange === 180 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(180)}
            className="flex-1 sm:flex-none min-w-[80px]"
          >
            180 Days
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Analysis Period</p>
              <p className="text-xl sm:text-2xl font-bold">{correlationData.dateRange.days} Days</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(correlationData.dateRange.start).toLocaleDateString()} - {new Date(correlationData.dateRange.end).toLocaleDateString()}
              </p>
            </div>
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Habits Analyzed</p>
              <p className="text-xl sm:text-2xl font-bold">{correlationData.habitCorrelations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">With sufficient data</p>
            </div>
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Overall Impact</p>
              {correlationData.overallCorrelation ? (
                <>
                  <p className={`text-xl sm:text-2xl font-bold ${correlationData.overallCorrelation.impact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {correlationData.overallCorrelation.impact.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {correlationData.overallCorrelation.impact < 0 ? 'Saving money!' : 'Spending more'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough data</p>
              )}
            </div>
            {correlationData.overallCorrelation && (
              correlationData.overallCorrelation.impact < 0 ? (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              ) : (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
              )
            )}
          </div>
        </Card>
      </div>

      {/* Overall Habit Completion Impact */}
      {correlationData.overallCorrelation && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            Overall Habit Completion vs. Spending
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="text-center p-4 sm:p-6 border rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">High Completion Days (&gt;70%)</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
                {formatCurrency(correlationData.overallCorrelation.avgSpendingHighCompletion)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Average daily spending
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {correlationData.overallCorrelation.highCompletionDays} days
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 border rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Low Completion Days (&lt;30%)</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">
                {formatCurrency(correlationData.overallCorrelation.avgSpendingLowCompletion)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Average daily spending
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {correlationData.overallCorrelation.lowCompletionDays} days
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
            <div className="flex items-start gap-3">
              {correlationData.overallCorrelation.impact < 0 ? (
                <TrendingDown className="w-6 h-6 text-green-600 mt-0.5" />
              ) : (
                <TrendingUp className="w-6 h-6 text-red-600 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {correlationData.overallCorrelation.impact < 0 ? 'Excellent! ' : 'Attention! '}
                  {Math.abs(correlationData.overallCorrelation.impact).toFixed(1)}% Impact
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  On days when you complete more habits, you spend <strong>{Math.abs(correlationData.overallCorrelation.impact).toFixed(1)}%</strong> {correlationData.overallCorrelation.impact < 0 ? 'less' : 'more'} money.
                  This is a strong indicator that {correlationData.overallCorrelation.impact < 0 ? 'maintaining your habits saves you money!' : 'skipping habits leads to higher spending.'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Habit Correlations */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          Habit-Specific Spending Impact
        </h3>

        {correlationData.habitCorrelations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Not enough data for habit-specific analysis. Keep tracking!
          </p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[500px] px-4 sm:px-0">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={correlationData.habitCorrelations.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="habitName" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Impact']}
                      labelFormatter={(label) => `Habit: ${label}`}
                    />
                    <Bar dataKey="spendingImpact" name="Spending Impact (%)">
                      {correlationData.habitCorrelations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getImpactColor(entry.spendingImpact)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {correlationData.habitCorrelations.slice(0, 8).map((habit) => (
                <Card key={habit.habitId} className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <h4 className="font-semibold text-sm sm:text-base truncate">{habit.habitName}</h4>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 capitalize">
                          {habit.habitCategory}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">When Completed</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(habit.avgSpendingWhenCompleted)}
                          </p>
                          <p className="text-xs text-muted-foreground">{habit.completedDays} days</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">When Not Completed</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(habit.avgSpendingWhenNotCompleted)}
                          </p>
                          <p className="text-xs text-muted-foreground">{habit.notCompletedDays} days</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Impact</p>
                          <p className={`text-lg font-bold ${habit.spendingImpact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {habit.spendingImpact > 0 && '+'}{habit.spendingImpact.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getImpactLabel(habit.spendingImpact)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-start gap-2">
                          {habit.spendingImpact < -10 ? (
                            <ArrowDown className="w-4 h-4 text-green-600 mt-0.5" />
                          ) : habit.spendingImpact > 10 ? (
                            <ArrowUp className="w-4 h-4 text-red-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5" />
                          )}
                          <p className="text-sm">
                            {habit.spendingImpact < -10 && (
                              <span className="text-green-700 dark:text-green-400">
                                <strong>Great habit!</strong> Completing "{habit.habitName}" reduces your spending by {Math.abs(habit.spendingImpact).toFixed(1)}%.
                              </span>
                            )}
                            {habit.spendingImpact > 10 && (
                              <span className="text-red-700 dark:text-red-400">
                                <strong>Watch out!</strong> Not completing "{habit.habitName}" increases spending by {habit.spendingImpact.toFixed(1)}%.
                              </span>
                            )}
                            {habit.spendingImpact >= -10 && habit.spendingImpact <= 10 && (
                              <span className="text-gray-700 dark:text-gray-400">
                                "{habit.habitName}" has a neutral impact on spending ({habit.spendingImpact.toFixed(1)}%).
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {habit.impulseImpact !== 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Also affects impulse spending: {habit.impulseImpact > 0 ? '+' : ''}{habit.impulseImpact.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Mood Correlation */}
      {correlationData.moodCorrelation && correlationData.moodCorrelation.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Mood vs. Spending
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={correlationData.moodCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="moodRange" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="avgSpending" fill="#ec4899" name="Avg Spending" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {correlationData.moodCorrelation.map((mood) => (
              <div key={mood.moodRange} className="text-center p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">{mood.moodRange}</p>
                <p className="text-lg font-bold">{formatCurrency(mood.avgSpending)}</p>
                <p className="text-xs text-muted-foreground">{mood.days} days</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
            <p className="text-sm text-pink-700 dark:text-pink-400">
              <Heart className="w-4 h-4 inline mr-1" />
              <strong>Pattern Detected:</strong> Emotional state significantly affects spending. Track your mood to identify triggers.
            </p>
          </div>
        </Card>
      )}

      {/* Category Correlations */}
      {correlationData.categoryCorrelations && correlationData.categoryCorrelations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category-Specific Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {correlationData.categoryCorrelations.slice(0, 6).map((cat) => (
              <div key={cat.category} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium capitalize">{cat.category.replace('_', ' ')}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cat.impulsePercentage > 50 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                    cat.impulsePercentage > 25 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                    'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                  }`}>
                    {cat.impulsePercentage}% impulse
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">{formatCurrency(cat.totalSpending)}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{cat.transactionCount} transactions • {cat.daysWithSpending} days</p>
                  <p>Avg habit completion: {cat.avgDailyCompletionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Items */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <h3 className="text-lg font-semibold mb-4">Actionable Insights</h3>
        <div className="space-y-3">
          {correlationData.habitCorrelations.filter(h => h.spendingImpact < -15).length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Money-Saving Habits</p>
                <p className="text-sm text-muted-foreground">
                  Focus on: {correlationData.habitCorrelations
                    .filter(h => h.spendingImpact < -15)
                    .map(h => h.habitName)
                    .join(', ')}. These habits significantly reduce your spending!
                </p>
              </div>
            </div>
          )}

          {correlationData.habitCorrelations.filter(h => h.spendingImpact > 15).length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium">Attention Needed</p>
                <p className="text-sm text-muted-foreground">
                  Missing these habits leads to higher spending: {correlationData.habitCorrelations
                    .filter(h => h.spendingImpact > 15)
                    .map(h => h.habitName)
                    .join(', ')}. Prioritize them!
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Recommendation</p>
              <p className="text-sm text-muted-foreground">
                Track both habits and spending for at least 30 days to get the most accurate correlations. The more data, the better the insights!
              </p>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}