import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebtStore } from '@/store/useDebtStore';
import { toast } from 'sonner';
import { DEBT_TYPES, DebtType } from '@/types/finance';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddDebtDialog({ open, onOpenChange, onSuccess }: Props) {
  const { createDebt } = useDebtStore();
  const [submitting, setSubmitting] = useState(false);

  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<DebtType>('personal_loan');
  const [originalAmount, setOriginalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('1');
  const [term, setTerm] = useState('');
  const [lenderName, setLenderName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!debtName || !originalAmount || !interestRate || !monthlyPayment) {
      toast.error('Please fill in all required fields');
      return;
    }

    const originalAmountNum = parseFloat(originalAmount);
    const interestRateNum = parseFloat(interestRate);
    const monthlyPaymentNum = parseFloat(monthlyPayment);

    if (originalAmountNum <= 0 || interestRateNum < 0 || monthlyPaymentNum <= 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    setSubmitting(true);
    try {
      await createDebt({
        debtName,
        debtType,
        originalAmount: originalAmountNum,
        interestRate: interestRateNum,
        monthlyPayment: monthlyPaymentNum,
        minimumPayment: minimumPayment ? parseFloat(minimumPayment) : undefined,
        startDate,
        dueDate: parseInt(dueDate),
        term: term ? parseInt(term) : null,
        lenderName: lenderName || undefined,
        notes: notes || undefined,
        color: DEBT_TYPES.find(t => t.value === debtType)?.color
      });

      toast.success('Debt added successfully!');

      // Reset form
      setDebtName('');
      setDebtType('personal_loan');
      setOriginalAmount('');
      setInterestRate('');
      setMonthlyPayment('');
      setMinimumPayment('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('1');
      setTerm('');
      setLenderName('');
      setNotes('');

      onSuccess();
    } catch (error) {
      toast.error('Failed to add debt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto px-3 xxs:px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-base xxs:text-lg sm:text-xl">Add New Debt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 xxs:space-y-5">
          {/* Debt Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xxs:gap-4">
            <div>
              <Label htmlFor="debtName" className="text-xs xxs:text-sm">
                Debt Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="debtName"
                value={debtName}
                onChange={(e) => setDebtName(e.target.value)}
                placeholder="e.g., Student Loan"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
            <div>
              <Label htmlFor="debtType" className="text-xs xxs:text-sm">
                Debt Type <span className="text-red-500">*</span>
              </Label>
              <Select value={debtType} onValueChange={(value) => setDebtType(value as DebtType)}>
                <SelectTrigger className="h-9 xxs:h-10 text-sm xxs:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs xxs:text-sm">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xxs:gap-4">
            <div>
              <Label htmlFor="originalAmount" className="text-xs xxs:text-sm">
                Original Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="originalAmount"
                type="number"
                step="0.01"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="50000"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
            <div>
              <Label htmlFor="interestRate" className="text-xs xxs:text-sm">
                Interest Rate (% APR) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="12.5"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3">
            <div>
              <Label htmlFor="monthlyPayment" className="text-xs xxs:text-sm">
                Monthly Payment (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="monthlyPayment"
                type="number"
                step="0.01"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="2000"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
            <div>
              <Label htmlFor="minimumPayment" className="text-xs xxs:text-sm">
                Minimum Payment (₹)
              </Label>
              <Input
                id="minimumPayment"
                type="number"
                step="0.01"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                placeholder="1000"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
            <div>
              <Label htmlFor="term" className="text-xs xxs:text-sm">
                Term (months)
              </Label>
              <Input
                id="term"
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="36"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xxs:gap-4">
            <div>
              <Label htmlFor="startDate" className="text-xs xxs:text-sm">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-xs xxs:text-sm">
                Due Date (Day of Month) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="15"
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
            </div>
          </div>

          {/* Lender Name */}
          <div>
            <Label htmlFor="lenderName" className="text-xs xxs:text-sm">
              Lender/Bank Name
            </Label>
            <Input
              id="lenderName"
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              placeholder="e.g., HDFC Bank"
              className="h-9 xxs:h-10 text-sm xxs:text-base"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs xxs:text-sm">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="text-xs xxs:text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 xxs:gap-3 sm:gap-4">
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
              {submitting ? 'Adding...' : 'Add Debt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
