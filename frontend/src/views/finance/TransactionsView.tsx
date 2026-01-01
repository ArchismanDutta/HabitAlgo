import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import financeService from '../../services/financeService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_COLORS } from '../../types/finance';
import type { FinancialTransaction, TransactionType } from '../../types/finance';
import Header from '../../components/layout/Header';

export default function TransactionsView() {
  const { transactions, accounts, setTransactions, setLoading, setError } = useFinanceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Quick add form state
  const [quickAddData, setQuickAddData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: '',
    merchant: '',
    description: '',
    accountId: ''
  });

  useEffect(() => {
    loadTransactions();
    loadAccounts();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { transactions: data } = await financeService.transactions.getAll({ limit: 100 });
      setTransactions(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const accounts = await financeService.accounts.getAll(true);
      useFinanceStore.getState().setAccounts(accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddData.amount || !quickAddData.accountId) {
      alert('Please fill in amount and account');
      return;
    }

    try {
      const transaction = await financeService.transactions.create({
        type: quickAddData.type,
        amount: parseFloat(quickAddData.amount),
        date: new Date().toISOString(),
        accountId: quickAddData.accountId,
        category: quickAddData.category || undefined,
        merchant: quickAddData.merchant || undefined,
        description: quickAddData.description || undefined,
        paymentMethod: 'cash'
      });

      useFinanceStore.getState().addTransaction(transaction);
      setShowQuickAdd(false);
      setQuickAddData({
        type: 'expense',
        amount: '',
        category: '',
        merchant: '',
        description: '',
        accountId: ''
      });
    } catch (error: any) {
      alert('Failed to add transaction: ' + error.message);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      !searchQuery ||
      (transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.merchant?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.category?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || transaction.type === filterType;

    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

    const matchesAccount = filterAccount === 'all' ||
      (typeof transaction.accountId === 'string' ? transaction.accountId === filterAccount : transaction.accountId._id === filterAccount);

    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, FinancialTransaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {filteredTransactions.length} transactions
            </p>
          </div>
          <Button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="gap-2 w-full sm:w-auto"
          >
            {showQuickAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showQuickAdd ? 'Cancel' : 'Quick Add'}
          </Button>
        </div>

      {/* Quick Add Panel */}
      {showQuickAdd && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Add Transaction</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quick-type">Type</Label>
              <Select
                value={quickAddData.type}
                onValueChange={(value: TransactionType) => setQuickAddData({ ...quickAddData, type: value })}
              >
                <SelectTrigger id="quick-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-amount">Amount *</Label>
              <Input
                id="quick-amount"
                type="number"
                step="0.01"
                value={quickAddData.amount}
                onChange={(e) => setQuickAddData({ ...quickAddData, amount: e.target.value })}
                placeholder="₹0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-account">Account *</Label>
              <Select
                value={quickAddData.accountId}
                onValueChange={(value) => setQuickAddData({ ...quickAddData, accountId: value })}
              >
                <SelectTrigger id="quick-account">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-category">Category</Label>
              <Select
                value={quickAddData.category}
                onValueChange={(value) => setQuickAddData({ ...quickAddData, category: value })}
              >
                <SelectTrigger id="quick-category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {(quickAddData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-merchant">Merchant</Label>
              <Input
                id="quick-merchant"
                type="text"
                value={quickAddData.merchant}
                onChange={(e) => setQuickAddData({ ...quickAddData, merchant: e.target.value })}
                placeholder="e.g., Starbucks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-description">Description</Label>
              <Input
                id="quick-description"
                type="text"
                value={quickAddData.description}
                onChange={(e) => setQuickAddData({ ...quickAddData, description: e.target.value })}
                placeholder="Notes"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={handleQuickAdd} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>

            {/* Micro-spend quick buttons */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickAddData({ ...quickAddData, amount: '5' })}
                className="flex-1 sm:flex-initial"
              >
                ₹5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickAddData({ ...quickAddData, amount: '10' })}
                className="flex-1 sm:flex-initial"
              >
                ₹10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickAddData({ ...quickAddData, amount: '20' })}
                className="flex-1 sm:flex-initial"
              >
                ₹20
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickAddData({ ...quickAddData, amount: '50' })}
                className="flex-1 sm:flex-initial"
              >
                ₹50
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Net</p>
              <p className={`text-xl sm:text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Type</Label>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as any)}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select
                value={filterCategory}
                onValueChange={(value) => setFilterCategory(value)}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-account">Account</Label>
              <Select
                value={filterAccount}
                onValueChange={(value) => setFilterAccount(value)}
              >
                <SelectTrigger id="filter-account">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Transactions List */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">Add your first transaction to get started</p>
          </Card>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">{formatDate(date)}</h3>
                <span className="text-sm text-muted-foreground">
                  ({groupedTransactions[date].length} transactions)
                </span>
              </div>

              <div className="space-y-2">
                {groupedTransactions[date].map(transaction => {
                  const account = typeof transaction.accountId === 'object' ? transaction.accountId : null;
                  const color = TRANSACTION_COLORS[transaction.type];

                  return (
                    <Card
                      key={transaction._id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="p-3 rounded-full"
                            style={{ backgroundColor: color + '20' }}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-5 h-5" style={{ color }} />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5" style={{ color }} />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {transaction.description || transaction.merchant || transaction.category || 'Transaction'}
                              </p>
                              {transaction.isImpulsive && (
                                <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 rounded-full flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Impulse ({transaction.impulseScore})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              {account && (
                                <span className="flex items-center gap-1">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: account.color }}
                                  />
                                  {account.name}
                                </span>
                              )}

                              {transaction.category && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {transaction.category.replace('_', ' ')}
                                </span>
                              )}

                              {transaction.merchant && (
                                <span>{transaction.merchant}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className="text-xl font-bold"
                            style={{ color }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          {transaction.time && (
                            <p className="text-xs text-muted-foreground">{transaction.time}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
