import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebtStore } from '@/store/useDebtStore';
import Header from '@/components/layout/Header';
import {
  Plus,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  CreditCard
} from 'lucide-react';
import AddDebtDialog from '@/components/finance/debt/AddDebtDialog';
import DebtPaymentDialog from '@/components/finance/debt/DebtPaymentDialog';
import DebtCard from '@/components/finance/debt/DebtCard';
import DebtPieChart from '@/components/finance/debt/DebtPieChart';
import PayoffProgressChart from '@/components/finance/debt/PayoffProgressChart';

export default function DebtDashboardView() {
  const {
    debts,
    debtSummary,
    debtBreakdown,
    payoffProgress,
    refreshAll
  } = useDebtStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /**
   * 🔒 HARD DATA SANITIZATION
   * If your backend or store sends junk,
   * your UI will NOT crash.
   */
  const safeDebts = useMemo(() => {
    if (!Array.isArray(debts)) return [];
    return debts.filter(
      (d): d is { _id: string } =>
        Boolean(d && typeof d === 'object' && '_id' in d)
    );
  }, [debts]);

  const handleAddPayment = (debtId: string) => {
    setSelectedDebtId(debtId);
    setShowPaymentDialog(true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Debt Payoff Dashboard" />

      <div className="container mx-auto px-3 py-4 space-y-6 pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <SummaryCard
            label="Total Debts"
            value={debtSummary?.totalDebts ?? 0}
            icon={<CreditCard className="h-7 w-7 text-blue-500" />}
          />

          <SummaryCard
            label="Active Debts"
            value={debtSummary?.runningDebts ?? 0}
            valueClass="text-orange-500"
            icon={<TrendingDown className="h-7 w-7 text-orange-500" />}
          />

          <SummaryCard
            label="Balance Remaining"
            value={formatCurrency(debtSummary?.currentBalance ?? 0)}
            valueClass="text-red-500"
            icon={<BarChart3 className="h-7 w-7 text-red-500" />}
          />

          <SummaryCard
            label="Total Paid"
            value={formatCurrency(debtSummary?.totalPaid ?? 0)}
            valueClass="text-green-500"
            icon={<DollarSign className="h-7 w-7 text-green-500" />}
          />

          <SummaryCard
            label="Payment Progress"
            value={`${(debtSummary?.paymentProgress ?? 0).toFixed(2)}%`}
            valueClass="text-primary"
            icon={<PieChartIcon className="h-7 w-7 text-primary" />}
          />
        </div>

        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Debts</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="list">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="list">All Debts</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* List */}
          <TabsContent value="list" className="mt-6">
            {safeDebts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No debts tracked yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {safeDebts.map(debt => (
                  <DebtCard
                    key={debt._id}
                    debt={debt}
                    onAddPayment={() => handleAddPayment(debt._id)}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Breakdown */}
          <TabsContent value="breakdown" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Debt Breakdown by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {!debtBreakdown?.length ? (
                  <EmptyState text="Add debts to see breakdown" />
                ) : (
                  <DebtPieChart
                    data={debtBreakdown}
                    formatCurrency={formatCurrency}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Debt Payoff Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {!payoffProgress?.length ? (
                  <EmptyState text="Add debts to see progress" />
                ) : (
                  <PayoffProgressChart data={payoffProgress} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddDebtDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={() => {
            setShowAddDialog(false);
            refreshAll();
          }}
        />

        {selectedDebtId && (
          <DebtPaymentDialog
            open={showPaymentDialog}
            debtId={selectedDebtId}
            onOpenChange={setShowPaymentDialog}
            onSuccess={() => {
              setShowPaymentDialog(false);
              setSelectedDebtId(null);
              refreshAll();
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function SummaryCard({
  label,
  value,
  icon,
  valueClass = ''
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
