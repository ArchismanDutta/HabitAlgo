import { useEffect, useState } from 'react';
import { Plus, Wallet, CreditCard, Landmark, TrendingUp, Target, DollarSign, Edit, Archive, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import financeService from '../../services/financeService';
import type { FinancialAccount, AccountType, NetWorthData, AccountFormData } from '../../types/finance';
import { toast } from 'sonner';
import Header from '../../components/layout/Header';

const ACCOUNT_TYPE_ICONS: Record<AccountType, any> = {
  bank_checking: Landmark,
  bank_savings: Landmark,
  credit_card: CreditCard,
  wallet: Wallet,
  cash: DollarSign,
  investment: TrendingUp,
  loan: CreditCard,
  goal: Target
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank_checking: 'Checking Account',
  bank_savings: 'Savings Account',
  credit_card: 'Credit Card',
  wallet: 'Digital Wallet',
  cash: 'Cash',
  investment: 'Investment',
  loan: 'Loan',
  goal: 'Goal-based Account'
};

export default function AccountsView() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [hideBalances, setHideBalances] = useState(false);

  const [formData, setFormData] = useState<any>({
    type: 'bank_checking',
    name: '',
    bankName: '',
    currency: 'INR',
    openingBalance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, netWorthData] = await Promise.all([
        financeService.accounts.getAll(), // Get all accounts (active and inactive)
        financeService.accounts.getNetWorth()
      ]);
      setAccounts(accountsData);
      setNetWorth(netWorthData);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        await financeService.accounts.update(editingAccount._id, formData);
        toast.success('Account updated successfully');
      } else {
        await financeService.accounts.create(formData);
        toast.success('Account created successfully');
      }

      setShowAddDialog(false);
      setEditingAccount(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleEdit = (account: FinancialAccount) => {
    setEditingAccount(account);
    setFormData({
      type: account.type,
      name: account.name,
      bankName: account.bankName || '',
      currency: account.currency,
      creditLimit: account.creditLimit,
      originalAmount: account.originalAmount,
      targetAmount: account.targetAmount,
      targetDate: account.targetDate || '',
      openingBalance: account.currentBalance
    });
    setShowAddDialog(true);
  };

  const handleArchive = async (accountId: string, currentStatus: boolean) => {
    try {
      await financeService.accounts.update(accountId, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Account archived' : 'Account activated');
      await loadData();
    } catch (error) {
      toast.error('Failed to update account status');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'bank_checking',
      name: '',
      bankName: '',
      currency: 'INR',
      openingBalance: 0
    });
  };

  const openAddDialog = () => {
    resetForm();
    setEditingAccount(null);
    setShowAddDialog(true);
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

  const getAccountIcon = (type: AccountType) => {
    const Icon = ACCOUNT_TYPE_ICONS[type];
    return <Icon className="w-5 h-5" />;
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<AccountType, FinancialAccount[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage all your financial accounts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideBalances(!hideBalances)}
          >
            {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Net Worth Summary */}
      {netWorth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Net Worth</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {hideBalances ? '••••••' : formatCurrency(netWorth.netWorth)}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <p className="text-sm text-green-700 dark:text-green-300 mb-1">Assets</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
              {hideBalances ? '••••••' : formatCurrency(netWorth.assets)}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <p className="text-sm text-red-700 dark:text-red-300 mb-1">Liabilities</p>
            <p className="text-3xl font-bold text-red-900 dark:text-red-100">
              {hideBalances ? '••••••' : formatCurrency(netWorth.liabilities)}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Total Accounts</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {accounts.filter(a => a.isActive).length}
            </p>
          </Card>
        </div>
      )}

      {/* Accounts by Type */}
      {Object.keys(groupedAccounts).length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
          <p className="text-muted-foreground mb-6">Add your first account to start tracking your finances</p>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </Card>
      ) : (
        Object.entries(groupedAccounts).map(([type, accountsList]) => (
          <div key={type}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {getAccountIcon(type as AccountType)}
              {ACCOUNT_TYPE_LABELS[type as AccountType]}s
              <span className="text-sm font-normal text-muted-foreground">
                ({accountsList.filter(a => a.isActive).length})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountsList.map((account) => (
                <Card
                  key={account._id}
                  className={`p-6 ${!account.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAccountIcon(account.type)}
                        <h3 className="font-semibold">{account.name}</h3>
                      </div>
                      {account.bankName && (
                        <p className="text-sm text-muted-foreground">{account.bankName}</p>
                      )}
                      {!account.isActive && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(account._id, account.isActive)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {account.type === 'credit_card' ? 'Available Credit' : 'Balance'}
                      </p>
                      <p className="text-2xl font-bold">
                        {hideBalances ? '••••••' : formatCurrency(account.currentBalance)}
                      </p>
                    </div>

                    {account.type === 'credit_card' && account.creditLimit && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Credit Limit</span>
                          <span className="font-medium">
                            {hideBalances ? '••••••' : formatCurrency(account.creditLimit)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, ((account.creditLimit - Math.abs(account.currentBalance)) / account.creditLimit) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {account.type === 'goal' && account.targetAmount && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Goal</span>
                          <span className="font-medium">
                            {hideBalances ? '••••••' : formatCurrency(account.targetAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (account.currentBalance / account.targetAmount) * 100)}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {((account.currentBalance / account.targetAmount) * 100).toFixed(1)}% complete
                        </p>
                      </div>
                    )}

                    {account.type === 'loan' && account.originalAmount && (
                      <div className="pt-2 border-t text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Amount</span>
                          <span className="font-medium">{formatCurrency(account.originalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}
                disabled={!!editingAccount}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_checking">Checking Account</SelectItem>
                  <SelectItem value="bank_savings">Savings Account</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="goal">Goal-based Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HDFC Savings, Paytm Wallet"
                required
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank/Institution (Optional)</Label>
              <Input
                id="bankName"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., HDFC Bank, Paytm"
              />
            </div>

            {!editingAccount && (
              <div>
                <Label htmlFor="openingBalance">
                  {formData.type === 'credit_card' || formData.type === 'loan'
                    ? 'Current Outstanding Amount'
                    : 'Opening Balance'}
                  <span className="text-muted-foreground text-xs ml-2">
                    ({formData.type === 'credit_card' || formData.type === 'loan'
                      ? 'How much you currently owe'
                      : 'Current amount in this account'})
                  </span>
                </Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  value={Math.abs(formData.openingBalance || 0)}
                  onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            )}

            {formData.type === 'credit_card' && (
              <div>
                <Label htmlFor="creditLimit">Credit Limit (Optional)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit || ''}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || undefined })}
                  placeholder="50000"
                />
              </div>
            )}

            {formData.type === 'loan' && (
              <div>
                <Label htmlFor="originalAmount">Original Loan Amount (Optional)</Label>
                <Input
                  id="originalAmount"
                  type="number"
                  step="0.01"
                  value={formData.originalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) || null })}
                  placeholder="100000"
                />
              </div>
            )}

            {formData.type === 'goal' && (
              <>
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || null })}
                    placeholder="100000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate || ''}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingAccount(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAccount ? 'Update Account' : 'Add Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
