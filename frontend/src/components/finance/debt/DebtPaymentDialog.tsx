import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDebtStore } from '@/store/useDebtStore';
import { toast } from 'sonner';
import { DollarSign, TrendingDown, Percent } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtId: string;
  onSuccess: () => void;
}

export default function DebtPaymentDialog({ open, onOpenChange, debtId, onSuccess }: Props) {
  const { debts, recordPayment } = useDebtStore();
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Get the debt details
  const debt = debts.find(d => d._id === debtId);

  // Calculate estimated breakdown
  const calculateBreakdown = (paymentAmount: number) => {
    if (!debt) return { principal: 0, interest: 0 };

    const monthlyRate = debt.interestRate / 12 / 100;
    const interest = debt.currentBalance * monthlyRate;
    const principal = Math.max(0, paymentAmount - interest);

    return {
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principal * 100) / 100
    };
  };

  const breakdown = amount ? calculateBreakdown(parseFloat(amount)) : null;

  useEffect(() => {
    if (debt && open) {
      // Pre-fill with monthly payment amount
      setAmount(debt.monthlyPayment.toString());
    }
  }, [debt, open]);

  const handleSubmit = async () => {
    if (!amount || !paymentDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);

    if (amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!debt) {
      toast.error('Debt not found');
      return;
    }

    if (amountNum > debt.currentBalance + (debt.currentBalance * debt.interestRate / 12 / 100)) {
      const confirm = window.confirm(
        'Payment amount exceeds current balance + interest. This will pay off the debt. Continue?'
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      await recordPayment(debtId, {
        amount: amountNum,
        paymentDate,
        notes: notes || undefined
      });

      toast.success('Payment recorded successfully!');

      // Reset form
      setAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      onSuccess();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!debt) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-md px-3 xxs:px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-base xxs:text-lg sm:text-xl">Record Payment</DialogTitle>
          <p className="text-xs xxs:text-sm text-muted-foreground mt-1">
            {debt.debtName}
          </p>
        </DialogHeader>

        <div className="space-y-4 xxs:space-y-5">
          {/* Debt Info */}
          <div className="p-3 xxs:p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs xxs:text-sm text-muted-foreground">Current Balance</span>
              <span className="text-sm xxs:text-base font-bold text-red-500">
                {formatCurrency(debt.currentBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs xxs:text-sm text-muted-foreground">Interest Rate</span>
              <span className="text-sm xxs:text-base font-semibold">
                {debt.interestRate}% APR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs xxs:text-sm text-muted-foreground">Monthly Payment</span>
              <span className="text-sm xxs:text-base font-semibold">
                {formatCurrency(debt.monthlyPayment)}
              </span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="amount" className="text-xs xxs:text-sm">
              Payment Amount (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={debt.monthlyPayment.toString()}
              className="h-9 xxs:h-10 text-sm xxs:text-base"
              autoFocus
            />
          </div>

          {/* Payment Breakdown */}
          {breakdown && (
            <div className="p-3 xxs:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
              <p className="text-xs xxs:text-sm font-semibold text-blue-700 dark:text-blue-400">
                Estimated Payment Breakdown
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 xxs:h-4 xxs:w-4 text-green-500" />
                    <span className="text-xs xxs:text-sm text-muted-foreground">Principal</span>
                  </div>
                  <span className="text-xs xxs:text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(breakdown.principal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-3 w-3 xxs:h-4 xxs:w-4 text-orange-500" />
                    <span className="text-xs xxs:text-sm text-muted-foreground">Interest</span>
                  </div>
                  <span className="text-xs xxs:text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(breakdown.interest)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-3 w-3 xxs:h-4 xxs:w-4 text-primary" />
                    <span className="text-xs xxs:text-sm font-semibold">New Balance</span>
                  </div>
                  <span className="text-xs xxs:text-sm font-bold text-primary">
                    {formatCurrency(Math.max(0, debt.currentBalance - breakdown.principal))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate" className="text-xs xxs:text-sm">
              Payment Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="h-9 xxs:h-10 text-sm xxs:text-base"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs xxs:text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="text-xs xxs:text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 xxs:gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 xxs:h-10 text-xs xxs:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-9 xxs:h-10 text-xs xxs:text-sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
