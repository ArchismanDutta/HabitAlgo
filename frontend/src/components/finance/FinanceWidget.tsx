import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowRight, AlertTriangle, Target } from 'lucide-react';
import financeService from '../../services/financeService';
import type { FinancialSummary, Budget, NetWorthData } from '../../types/finance';

export default function FinanceWidget() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, budgetsData, netWorthData] = await Promise.all([
        financeService.analytics.getSummary(),
        financeService.budgets.getAll(true),
        financeService.accounts.getNetWorth()
      ]);

      setSummary(summaryData);
      setBudgets(budgetsData);
      setNetWorth(netWorthData);
    } catch (error) {
      console.error('Failed to load finance data:', error);
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const budgetsExceeded = budgets.filter(b => (b.spent / b.amount) >= 1).length;
  const budgetsWarning = budgets.filter(b => {
    const percentage = (b.spent / b.amount);
    return percentage >= 0.8 && percentage < 1;
  }).length;

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading finance data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Finance Overview
        </h2>
        <div className="flex gap-2">
          <Link to="/finance/transactions">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </Link>
          <Link to="/finance">
            <Button size="sm" variant="ghost">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Net Worth</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {netWorth ? formatCurrency(netWorth.netWorth) : '₹0'}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">This Month</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary ? formatCurrency(summary.totalIncome) : '₹0'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Income</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-1">This Month</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {summary ? formatCurrency(summary.totalExpenses) : '₹0'}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Expenses</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Financial Health & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Health Score */}
        {summary && (
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Financial Health</p>
                <p className={`text-3xl font-bold ${getHealthScoreColor(summary.healthScore)}`}>
                  {summary.healthScore}/100
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Savings Rate: {summary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-1">Monthly Savings</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(summary.netSavings)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Budget Alerts */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Budget Status</p>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{budgets.length} Active</span>
              </div>
            </div>
            <Link to="/finance/budgets" className="text-xs text-primary hover:underline">
              Manage →
            </Link>
          </div>

          <div className="space-y-2 mt-3">
            {budgetsExceeded > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {budgetsExceeded} budget{budgetsExceeded > 1 ? 's' : ''} exceeded
                </span>
              </div>
            )}
            {budgetsWarning > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {budgetsWarning} budget{budgetsWarning > 1 ? 's' : ''} at 80%+
                </span>
              </div>
            )}
            {budgetsExceeded === 0 && budgetsWarning === 0 && budgets.length > 0 && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                All budgets on track
              </div>
            )}
            {budgets.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No active budgets
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Impulse Spending Alert */}
      {summary && summary.impulsePercentage > 20 && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                High Impulse Spending Detected
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {summary.impulsePercentage.toFixed(1)}% of your spending this month was impulsive
                ({formatCurrency(summary.impulseSpending)})
              </p>
              <Link
                to="/finance/analytics"
                className="text-sm text-orange-600 hover:underline mt-2 inline-block"
              >
                View detailed analysis →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Top Spending Categories */}
      {summary && summary.expensesByCategory && summary.expensesByCategory.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Top Spending This Month</h3>
          <div className="space-y-2">
            {summary.expensesByCategory.slice(0, 3).map((cat, index) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{cat.category.replace('_', ' ')}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${(cat.amount / summary.expensesByCategory[0].amount) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm font-bold">{formatCurrency(cat.amount)}</p>
              </div>
            ))}
          </div>
          <Link
            to="/finance/analytics"
            className="text-sm text-primary hover:underline mt-3 inline-block"
          >
            View all categories →
          </Link>
        </Card>
      )}
    </div>
  );
}
