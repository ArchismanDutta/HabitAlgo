import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, DollarSign, TrendingDown, Calendar, Percent } from 'lucide-react';
import { useState } from 'react';
import { Debt } from '@/types/finance';
import { useDebtStore } from '@/store/useDebtStore';
import { toast } from 'sonner';

interface Props {
  debt: Debt;
  onAddPayment: () => void;
  formatCurrency: (amount: number) => string;
}

export default function DebtCard({ debt, onAddPayment, formatCurrency }: Props) {
  const { deleteDebt } = useDebtStore();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${debt.debtName}"?`)) return;

    setDeleting(true);
    try {
      await deleteDebt(debt._id);
      toast.success('Debt deleted');
    } catch (error) {
      toast.error('Failed to delete debt');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'paid_off': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      case 'defaulted': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mortgage: 'Mortgage',
      personal_loan: 'Personal Loan',
      student_loan: 'Student Loan',
      business_loan: 'Business Loan',
      credit_card: 'Credit Card',
      car_loan: 'Car Loan',
      other: 'Other'
    };
    return labels[type] || type;
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="px-3 xxs:px-4 sm:px-6 py-3 xxs:py-4 sm:py-5">
        <CardTitle className="flex items-center justify-between gap-2 xxs:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm xxs:text-base sm:text-lg font-bold truncate">
                {debt.debtName}
              </span>
              <Badge className={`text-xs ${getStatusColor(debt.status)}`}>
                {debt.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs xxs:text-sm text-muted-foreground mt-0.5">
              {getTypeLabel(debt.debtType)}
              {debt.lenderName && ` • ${debt.lenderName}`}
            </p>
          </div>
          <div className="flex gap-1 xxs:gap-2 flex-shrink-0">
            {debt.status === 'active' && (
              <Button
                variant="default"
                size="sm"
                onClick={onAddPayment}
                className="h-8 xxs:h-9 text-xs xxs:text-sm"
              >
                <DollarSign className="h-3 w-3 xxs:h-4 xxs:w-4 mr-1" />
                <span className="hidden sm:inline">Pay</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 w-8 xxs:h-9 xxs:w-9"
            >
              <Trash2 className="h-3 w-3 xxs:h-4 xxs:w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 xxs:px-4 sm:px-6 pb-3 xxs:pb-4 sm:pb-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs xxs:text-sm font-medium">Payoff Progress</span>
            <span className="text-xs xxs:text-sm font-bold text-primary">
              {(debt.payoffPercentage && !isNaN(debt.payoffPercentage) ? debt.payoffPercentage.toFixed(1) : '0.0')}%
            </span>
          </div>
          <Progress value={debt.payoffPercentage && !isNaN(debt.payoffPercentage) ? debt.payoffPercentage : 0} className="h-2 xxs:h-3" />
        </div>

        {/* Financial Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xxs:gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Original Amount</p>
            <p className="text-xs xxs:text-sm font-semibold">
              {formatCurrency(debt.originalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-xs xxs:text-sm font-semibold text-red-500">
              {formatCurrency(debt.currentBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-xs xxs:text-sm font-semibold text-green-500">
              {formatCurrency(debt.totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Paid</p>
            <p className="text-xs xxs:text-sm font-semibold text-orange-500">
              {formatCurrency(debt.totalInterestPaid)}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3 p-2 xxs:p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="text-xs xxs:text-sm font-semibold">{debt.interestRate}% APR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Monthly Payment</p>
              <p className="text-xs xxs:text-sm font-semibold">
                {formatCurrency(debt.monthlyPayment)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-xs xxs:text-sm font-semibold">
                {debt.dueDate}{debt.dueDate === 1 ? 'st' : debt.dueDate === 2 ? 'nd' : debt.dueDate === 3 ? 'rd' : 'th'} of month
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Payoff */}
        {debt.estimatedPayoffMonths && !isNaN(debt.estimatedPayoffMonths) && debt.estimatedPayoffMonths > 0 && (
          <div className="mt-3 xxs:mt-4 p-2 xxs:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Payoff</p>
                <p className="text-xs xxs:text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {debt.estimatedPayoffMonths} months ({Math.floor(debt.estimatedPayoffMonths / 12)} years, {debt.estimatedPayoffMonths % 12} months)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {debt.notes && (
          <div className="mt-3 xxs:mt-4 p-2 xxs:p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-1">Notes:</p>
            <p className="text-xs text-muted-foreground">{debt.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
