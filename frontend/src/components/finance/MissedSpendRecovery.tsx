import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Clock, Coffee, ShoppingBag, Bus, Utensils, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import financeService from '../../services/financeService';
import type { TransactionFormData, FinancialAccount } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../types/finance';
import { toast } from 'sonner';

const COMMON_MISSED_SPENDS = [
  { label: 'Coffee/Tea', category: 'dining_out', amount: 50, icon: Coffee },
  { label: 'Lunch', category: 'dining_out', amount: 150, icon: Utensils },
  { label: 'Auto/Bus', category: 'transportation', amount: 30, icon: Bus },
  { label: 'Snacks', category: 'groceries', amount: 40, icon: ShoppingBag },
  { label: 'Parking', category: 'transportation', amount: 20, icon: Bus }
];

const TRIGGER_HOUR = 21; // 9 PM
const STORAGE_KEY = 'last-missed-spend-check';

export default function MissedSpendRecovery() {
  const [showDialog, setShowDialog] = useState(false);
  const [todayTransactions, setTodayTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [quickAdds, setQuickAdds] = useState<number[]>([]);
  const [customTransaction, setCustomTransaction] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    category: 'other',
    description: ''
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    checkIfShouldShow();

    // Check every minute if we should show the dialog
    const interval = setInterval(checkIfShouldShow, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkIfShouldShow = async () => {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0];

    // Check if we've already shown today
    const lastCheck = localStorage.getItem(STORAGE_KEY);
    if (lastCheck === today) return;

    // Check if it's the trigger hour
    if (hour >= TRIGGER_HOUR) {
      await loadData();
      setShowDialog(true);
      localStorage.setItem(STORAGE_KEY, today);
    }
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [accountsData, transactionsData] = await Promise.all([
        financeService.accounts.getAll(true),
        financeService.transactions.getAll({
          startDate: today,
          endDate: today,
          limit: 100
        })
      ]);

      setAccounts(accountsData);
      setTodayTransactions(transactionsData.transactions);

      // Set default account
      if (accountsData.length > 0) {
        const defaultAccount = accountsData.find(a => a.type === 'bank_checking' || a.type === 'bank_savings' || a.type === 'wallet') || accountsData[0];
        setSelectedAccount(defaultAccount._id);
        setCustomTransaction(prev => ({ ...prev, accountId: defaultAccount._id }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleQuickAdd = (index: number) => {
    if (quickAdds.includes(index)) {
      setQuickAdds(quickAdds.filter(i => i !== index));
    } else {
      setQuickAdds([...quickAdds, index]);
    }
  };

  const handleSaveQuickAdds = async () => {
    if (quickAdds.length === 0) {
      toast.info('No items selected');
      return;
    }

    try {
      const promises = quickAdds.map(index => {
        const item = COMMON_MISSED_SPENDS[index];
        return financeService.transactions.create({
          type: 'expense',
          amount: item.amount,
          date: new Date().toISOString().split('T')[0],
          accountId: selectedAccount,
          category: item.category,
          description: item.label
        });
      });

      await Promise.all(promises);
      toast.success(`Added ${quickAdds.length} transaction${quickAdds.length > 1 ? 's' : ''}`);
      setQuickAdds([]);
      await loadData();
    } catch (error) {
      toast.error('Failed to add transactions');
    }
  };

  const handleAddCustom = async () => {
    if (!customTransaction.amount || customTransaction.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await financeService.transactions.create(customTransaction);
      toast.success('Transaction added');
      setShowCustomForm(false);
      setCustomTransaction({
        type: 'expense',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        accountId: selectedAccount,
        category: 'other',
        description: ''
      });
      await loadData();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDismiss = () => {
    setShowDialog(false);
    setQuickAdds([]);
    setShowCustomForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const todayTotal = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            End of Day - Did you miss any spends?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Today's Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
              Today's Expenses
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(todayTotal)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {todayTransactions.filter(t => t.type === 'expense').length} transactions logged
            </p>
          </div>

          {/* Account Selection */}
          <div>
            <Label htmlFor="account">Select Account</Label>
            <Select
              value={selectedAccount}
              onValueChange={setSelectedAccount}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account._id} value={account._id}>
                    {account.name} ({formatCurrency(account.currentBalance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Add Common Spends */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Common Missed Spends</h3>
              {quickAdds.length > 0 && (
                <Button size="sm" onClick={handleSaveQuickAdds}>
                  Add {quickAdds.length} item{quickAdds.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMMON_MISSED_SPENDS.map((item, index) => {
                const Icon = item.icon;
                const isSelected = quickAdds.includes(index);

                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAdd(index)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                    <p className="font-medium text-sm mb-1">{item.label}</p>
                    <p className="text-lg font-bold">{formatCurrency(item.amount)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Transaction Form */}
          {!showCustomForm ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCustomForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Transaction
            </Button>
          ) : (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Custom Transaction</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomForm(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={customTransaction.amount || ''}
                    onChange={(e) => setCustomTransaction({
                      ...customTransaction,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={customTransaction.category}
                    onValueChange={(value) => setCustomTransaction({
                      ...customTransaction,
                      category: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={customTransaction.description || ''}
                  onChange={(e) => setCustomTransaction({
                    ...customTransaction,
                    description: e.target.value
                  })}
                  placeholder="What did you buy?"
                />
              </div>

              <Button className="w-full" onClick={handleAddCustom}>
                Add Transaction
              </Button>
            </div>
          )}

          {/* Today's Transactions */}
          {todayTransactions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Today's Transactions</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {todayTransactions
                  .filter(t => t.type === 'expense')
                  .map(transaction => (
                    <div
                      key={transaction._id}
                      className="p-3 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.category?.replace('_', ' ')}
                          {transaction.merchant && ` • ${transaction.merchant}`}
                        </p>
                      </div>
                      <p className="font-bold text-red-600">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>This reminder appears once daily at 9 PM</span>
          </div>
          <Button variant="outline" onClick={handleDismiss}>
            All Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
