import { useEffect, useState } from 'react';
import financeService from '../../services/financeService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { FinancialGoal, GoalFormData, GoalType } from '../../types/finance';
import { toast } from 'sonner';
import Header from '../../components/layout/Header';

const GOAL_TYPES: { value: GoalType; label: string; icon: any }[] = [
  { value: 'savings', label: 'Savings', icon: DollarSign },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: TrendingUp },
  { value: 'investment', label: 'Investment', icon: TrendingUp },
  { value: 'purchase', label: 'Purchase', icon: Target },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: AlertCircle },
  { value: 'other', label: 'Other', icon: Target }
];

export default function FinancialGoalsView() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'achieved'>('all');

  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    type: 'savings',
    targetAmount: 0,
    targetDate: '',
    monthlyContribution: 0,
    priority: 1,
    description: '',
    color: '#10b981',
    icon: 'target'
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, statsData] = await Promise.all([
        filter === 'all'
          ? financeService.goals.getAll()
          : filter === 'achieved'
          ? financeService.goals.getAll(true, true)
          : financeService.goals.getAll(true, false),
        financeService.goals.getStats()
      ]);

      setGoals(goalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGoal) {
        await financeService.goals.update(editingGoal._id, formData);
        toast.success('Goal updated successfully');
      } else {
        await financeService.goals.create(formData);
        toast.success('Goal created successfully');
      }

      setShowAddDialog(false);
      setEditingGoal(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
      monthlyContribution: goal.monthlyContribution || 0,
      priority: goal.priority,
      description: goal.description || '',
      category: goal.category || undefined,
      color: goal.color,
      icon: goal.icon
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await financeService.goals.delete(goalId);
      toast.success('Goal deleted');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleContribute = async () => {
    if (!selectedGoal || !contributionAmount) return;

    try {
      await financeService.goals.addContribution(selectedGoal._id, parseFloat(contributionAmount));
      toast.success('Contribution added!');
      setShowContributeDialog(false);
      setSelectedGoal(null);
      setContributionAmount('');
      await loadData();
    } catch (error) {
      toast.error('Failed to add contribution');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'savings',
      targetAmount: 0,
      targetDate: '',
      monthlyContribution: 0,
      priority: 1,
      description: '',
      color: '#10b981',
      icon: 'target'
    });
  };

  const openAddDialog = () => {
    resetForm();
    setEditingGoal(null);
    setShowAddDialog(true);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount ?? 0;
    if (isNaN(safeAmount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  const getGoalIcon = (type: GoalType) => {
    const goalType = GOAL_TYPES.find(t => t.value === type);
    return goalType ? goalType.icon : Target;
  };

  const filteredGoals = goals;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track and achieve your financial targets</p>
          </div>
          <Button onClick={openAddDialog} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-1">Total Goals</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalGoals}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mb-1">Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{stats.activeGoals}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mb-1">Achieved</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.achievedGoals}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mb-1">Avg Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.avgProgress}%</p>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'achieved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('achieved')}
          >
            Achieved
          </Button>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6">Create your first financial goal to get started</p>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => {
              const Icon = getGoalIcon(goal.type);
              const progress = goal.progressPercentage || 0;
              const isOnTrack = goal.onTrack;
              const isAchieved = goal.isAchieved;

              return (
                <Card key={goal._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: goal.color + '20' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{goal.type.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {isAchieved && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isAchieved
                            ? 'bg-green-600'
                            : isOnTrack
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="font-semibold">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-semibold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="font-medium">{formatCurrency(goal.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Days Left</p>
                        <p className="font-medium">{goal.daysRemaining} days</p>
                      </div>
                    </div>

                    {!isAchieved && (
                      <Button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowContributeDialog(true);
                        }}
                        className="w-full mt-2"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contribution
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: GoalType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount || ''}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="100000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date *</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution (Optional)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  step="0.01"
                  value={formData.monthlyContribution || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
                  placeholder="5000"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this goal for?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingGoal ? 'Update' : 'Create'} Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedGoal && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedGoal.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current: {formatCurrency(selectedGoal.currentAmount)} / {formatCurrency(selectedGoal.targetAmount)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contribution">Contribution Amount *</Label>
              <Input
                id="contribution"
                type="number"
                step="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="1000"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowContributeDialog(false);
                setSelectedGoal(null);
                setContributionAmount('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleContribute} disabled={!contributionAmount}>
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
