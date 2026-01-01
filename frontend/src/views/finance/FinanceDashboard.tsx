import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import financeService from '../../services/financeService';
import { Card } from '../../components/ui/card';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Target,
  CreditCard,
  PiggyBank,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';

export default function FinanceDashboard() {
  const {
    accounts,
    netWorth,
    currentSummary,
    dueRecurring,
    budgets,
    setAccounts,
    setNetWorth,
    setCurrentSummary,
    setDueRecurring,
    setBudgets,
    setLoading,
    setError
  } = useFinanceStore();

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        accountsData,
        netWorthData,
        summaryData,
        dueRecurringData,
        budgetsData,
        transactionsData
      ] = await Promise.all([
        financeService.accounts.getAll(true),
        financeService.accounts.getNetWorth(),
        financeService.analytics.getSummary(),
        financeService.recurring.getDue(),
        financeService.budgets.getAll(true),
        financeService.transactions.getAll({ limit: 5 })
      ]);

      setAccounts(accountsData);
      setNetWorth(netWorthData);
      setCurrentSummary(summaryData);
      setDueRecurring(dueRecurringData);
      setBudgets(budgetsData);
      setRecentTransactions(transactionsData.transactions);
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount ?? 0;
    if (isNaN(safeAmount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your complete financial overview
            </p>
          </div>
          <Link
            to="/finance/transactions"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Link>
        </div>

        {/* Net Worth & Health Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Net Worth</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 truncate">
                  {netWorth ? formatCurrency(netWorth.netWorth) : '₹0'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Assets: {netWorth ? formatCurrency(netWorth.assets) : '₹0'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Liabilities: {netWorth ? formatCurrency(netWorth.liabilities) : '₹0'}
                </p>
              </div>
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Monthly Savings</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-green-600 truncate">
                  {currentSummary ? formatCurrency(currentSummary.netSavings) : '₹0'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Savings Rate: {currentSummary ? currentSummary.savingsRate.toFixed(1) : '0'}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Income: {currentSummary ? formatCurrency(currentSummary.totalIncome) : '₹0'}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Financial Health</p>
                <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${getHealthScoreColor(currentSummary?.healthScore || 0)}`}>
                  {currentSummary?.healthScore || 0}/100
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {getHealthScoreLabel(currentSummary?.healthScore || 0)}
                </p>
                <Link to="/finance/analytics" className="text-xs sm:text-sm text-primary hover:underline">
                  View Details →
                </Link>
              </div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Monthly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Income This Month
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {currentSummary ? formatCurrency(currentSummary.totalIncome) : '₹0'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentSummary?.incomeTransactions || 0} transactions
                </p>
              </div>
              {currentSummary?.incomeByCategory && currentSummary.incomeByCategory.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">By Category:</p>
                  {currentSummary.incomeByCategory.slice(0, 3).map((cat) => (
                    <div key={cat.category} className="flex justify-between text-sm">
                      <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                      <span className="font-medium">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              Expenses This Month
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {currentSummary ? formatCurrency(currentSummary.totalExpenses) : '₹0'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentSummary?.expenseTransactions || 0} transactions
                </p>
              </div>
{/* Fixed Impulse Spending Block */}
{currentSummary?.impulseSpending != null && (
  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
    <p className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      Impulse: {typeof currentSummary.impulseSpending === 'number'
        ? formatCurrency(currentSummary.impulseSpending)
        : formatCurrency(currentSummary.impulseSpending.totalCount)}
      {' '}
      ({typeof currentSummary.impulseSpending === 'number'
        ? '0'
        : currentSummary.impulseSpending.impulsePercentage?.toFixed(1) ?? '0'}
      %)
    </p>
  </div>
)}


              {currentSummary?.expensesByCategory && currentSummary.expensesByCategory.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Top Categories:</p>
                  {currentSummary.expensesByCategory.slice(0, 3).map((cat) => (
                    <div key={cat.category} className="flex justify-between text-sm">
                      <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                      <span className="font-medium">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Accounts Overview */}
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              Accounts
            </h3>
            <Link to="/finance/accounts" className="text-xs sm:text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {accounts.slice(0, 6).map((account) => (
              <div
                key={account._id}
                className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/finance/accounts/${account._id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {account.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                    style={{ backgroundColor: account.color + '20' }}
                  >
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: account.color }} />
                  </div>
                </div>
                <p className={`text-lg sm:text-xl font-bold ${
                  account.currentBalance < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(account.currentBalance)}
                </p>
                {account.type === 'credit_card' && account.availableCredit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatCurrency(account.availableCredit)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Budgets & Recurring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Budget Status
              </h3>
              <Link to="/finance/budgets" className="text-xs sm:text-sm text-primary hover:underline">
                Manage →
              </Link>
            </div>
            <div className="space-y-4">
              {budgets.slice(0, 4).map((budget) => (
                <div key={budget._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{budget.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {budget.percentageUsed}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budget.status === 'exceeded'
                          ? 'bg-red-500'
                          : budget.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(budget.currentSpent)} spent</span>
                    <span>{formatCurrency(budget.remaining)} remaining</span>
                  </div>
                </div>
              ))}
              {budgets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No budgets set up yet
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Due Payments
              </h3>
              <Link to="/finance/recurring" className="text-xs sm:text-sm text-primary hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {dueRecurring.length > 0 ? (
                dueRecurring.slice(0, 5).map((recurring) => (
                  <div
                    key={recurring._id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-medium">{recurring.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {recurring.recurringType} • {recurring.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(recurring.amount)}</p>
                      <p className="text-xs text-orange-600">Due now</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No due payments
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              Recent Transactions
            </h3>
            <Link to="/finance/transactions" className="text-xs sm:text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((transaction) => {
              const account = typeof transaction.accountId === 'object'
                ? transaction.accountId
                : null;

              return (
                <div
                  key={transaction._id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/finance/transactions/${transaction._id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-green-100 dark:bg-green-950'
                        : 'bg-red-100 dark:bg-red-950'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.description || transaction.merchant || transaction.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account?.name || 'Unknown Account'} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.isImpulsive && (
                      <span className="text-xs text-orange-600">Impulse</span>
                    )}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent transactions
              </p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/finance/analytics"
            className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-600" />
            <p className="text-xs sm:text-sm font-medium">Analytics</p>
          </Link>
          <Link
            to="/finance/correlations"
            className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
            <p className="text-xs sm:text-sm font-medium">Habit Insights</p>
          </Link>
          <Link
            to="/finance/goals"
            className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
            <p className="text-xs sm:text-sm font-medium">Goals</p>
          </Link>
          <Link
            to="/finance/calendar"
            className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-orange-600" />
            <p className="text-xs sm:text-sm font-medium">Calendar</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
