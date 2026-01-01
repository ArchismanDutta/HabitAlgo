import { useEffect, useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import financeService from '../../services/financeService';
import type { Budget, BudgetFormData, BudgetType, BudgetPeriod } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../types/finance';
import { toast } from 'sonner';
import Header from '../../components/layout/Header';

const BUDGET_PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const BUDGET_TYPES: { value: BudgetType; label: string }[] = [
  { value: 'category', label: 'Category Budget' },
  { value: 'subcategory', label: 'Subcategory Budget' },
  { value: 'merchant', label: 'Merchant Budget' },
  { value: 'total', label: 'Total Spending Budget' }
];

export default function BudgetsView() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<BudgetPeriod | 'all'>('all');

  const [formData, setFormData] = useState<BudgetFormData>({
    type: 'category',
    amount: 0,
    period: 'monthly',
    isActive: true,
    allowRollover: false
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const budgetsData = await financeService.budgets.getAll(false);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await financeService.budgets.update(editingBudget._id, formData);
        toast.success('Budget updated successfully');
      } else {
        await financeService.budgets.create(formData);
        toast.success('Budget created successfully');
      }

      setShowAddDialog(false);
      setEditingBudget(null);
      resetForm();
      await loadBudgets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      type: budget.type,
      category: budget.category,
      subcategory: budget.subcategory,
      merchant: budget.merchant,
      amount: budget.amount,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      isActive: budget.isActive,
      allowRollover: budget.allowRollover
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await financeService.budgets.delete(budgetId);
      toast.success('Budget deleted');
      await loadBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleToggleActive = async (budgetId: string, currentStatus: boolean) => {
    try {
      await financeService.budgets.update(budgetId, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Budget deactivated' : 'Budget activated');
      await loadBudgets();
    } catch (error) {
      toast.error('Failed to update budget status');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'category',
      amount: 0,
      period: 'monthly',
      isActive: true,
      allowRollover: false
    });
  };

  const openAddDialog = () => {
    resetForm();
    setEditingBudget(null);
    setShowAddDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetStatus = (budget: Budget): 'good' | 'warning' | 'exceeded' => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'exceeded': return 'text-red-600';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'exceeded': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getProgressBarColor = (status: 'good' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'good': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'exceeded': return 'bg-red-600';
    }
  };

  const getBudgetLabel = (budget: Budget) => {
    if (budget.type === 'category' && budget.category) {
      return budget.category.replace('_', ' ');
    }
    if (budget.type === 'subcategory' && budget.subcategory) {
      return `${budget.category?.replace('_', ' ')} - ${budget.subcategory}`;
    }
    if (budget.type === 'merchant' && budget.merchant) {
      return budget.merchant;
    }
    return 'Total Spending';
  };

  const filteredBudgets = filterPeriod === 'all'
    ? budgets
    : budgets.filter(b => b.period === filterPeriod);

  const activeBudgets = filteredBudgets.filter(b => b.isActive);
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetsExceeded = activeBudgets.filter(b => getBudgetStatus(b) === 'exceeded').length;
  const budgetsWarning = activeBudgets.filter(b => getBudgetStatus(b) === 'warning').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading budgets...</p>
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
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Track and manage your spending limits</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budgeted</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalBudgeted)}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : 0}% of budget
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Exceeded</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{budgetsExceeded}</p>
              <p className="text-xs text-muted-foreground mt-1">budgets over limit</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Warning</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{budgetsWarning}</p>
              <p className="text-xs text-muted-foreground mt-1">budgets at 80%+</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as BudgetPeriod | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budgets List */}
      {filteredBudgets.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-6">Create your first budget to start tracking spending</p>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBudgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const percentage = Math.min(100, (budget.spent / budget.amount) * 100);
            const remaining = budget.amount - budget.spent;

            return (
              <Card key={budget._id} className={`p-6 ${!budget.isActive ? 'opacity-50' : ''}`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <h3 className="font-semibold capitalize">
                          {getBudgetLabel(budget)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {budget.period}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {budget.type}
                        </span>
                        {!budget.isActive && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(budget._id, budget.isActive)}
                      >
                        {budget.isActive ? 'Pause' : 'Resume'}
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Spent</span>
                      <span className={`font-medium ${getStatusColor(status)}`}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressBarColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {remaining >= 0 ? formatCurrency(remaining) : `Over by ${formatCurrency(Math.abs(remaining))}`}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {budget.startDate ? new Date(budget.startDate).toLocaleDateString() : 'No start date'}
                      </span>
                    </div>
                    {budget.allowRollover && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        Rollover enabled
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(budget._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Budget Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: BudgetType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'category' && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'merchant' && (
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={formData.merchant || ''}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  placeholder="e.g., Swiggy, Amazon"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="amount">Budget Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="period">Budget Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: BudgetPeriod) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowRollover"
                checked={formData.allowRollover}
                onChange={(e) => setFormData({ ...formData, allowRollover: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="allowRollover" className="cursor-pointer">
                Allow rollover of unused budget to next period
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingBudget(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
