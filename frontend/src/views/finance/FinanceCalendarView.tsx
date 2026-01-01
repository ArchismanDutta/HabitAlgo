import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import financeService from '../../services/financeService';
import type { RecurringTransaction, FinancialTransaction } from '../../types/finance';
import { toast } from 'sonner';
import Header from '../../components/layout/Header';

interface DayData {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dueBills: RecurringTransaction[];
  dueIncome: RecurringTransaction[];
  transactions: FinancialTransaction[];
  totalIncome: number;
  totalExpense: number;
}

export default function FinanceCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [dueRecurring, setDueRecurring] = useState<RecurringTransaction[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      // Get start and end of month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const [recurringData, transactionsData] = await Promise.all([
        financeService.recurring.getDue(),
        financeService.transactions.getAll({
          startDate,
          endDate,
          limit: 1000
        })
      ]);

      setDueRecurring(recurringData);
      setTransactions(transactionsData.transactions);
      buildCalendar(recurringData, transactionsData.transactions);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const buildCalendar = (recurring: RecurringTransaction[], trans: FinancialTransaction[]) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days to show from previous month
    const prevMonthDays = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Build calendar days array
    const days: DayData[] = [];

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push(createDayData(date, false, recurring, trans));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(createDayData(date, true, recurring, trans));
    }

    // Next month days to fill the grid (ensure 6 rows)
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createDayData(date, false, recurring, trans));
    }

    setCalendarDays(days);
  };

  const createDayData = (
    date: Date,
    isCurrentMonth: boolean,
    recurring: RecurringTransaction[],
    trans: FinancialTransaction[]
  ): DayData => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Find recurring transactions due on this day
    const dueBills = recurring.filter(r => {
      if (!r.nextScheduledDate || r.type === 'income' || r.type === 'salary') return false;
      const dueDate = new Date(r.nextScheduledDate).toISOString().split('T')[0];
      return dueDate === dateStr;
    });

    const dueIncome = recurring.filter(r => {
      if (!r.nextScheduledDate || (r.type !== 'income' && r.type !== 'salary')) return false;
      const dueDate = new Date(r.nextScheduledDate).toISOString().split('T')[0];
      return dueDate === dateStr;
    });

    // Find transactions on this day
    const dayTransactions = trans.filter(t => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      return tDate === dateStr;
    });

    const totalIncome = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      dueBills,
      dueIncome,
      transactions: dayTransactions,
      totalIncome,
      totalExpense
    };
  };

  const handleDayClick = (dayData: DayData) => {
    setSelectedDay(dayData);
    setShowDayDialog(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayClassName = (dayData: DayData) => {
    const classes = ['p-2 border rounded-lg cursor-pointer transition-all min-h-[100px]'];

    if (!dayData.isCurrentMonth) {
      classes.push('opacity-40');
    }

    if (dayData.isToday) {
      classes.push('ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950');
    } else {
      classes.push('hover:bg-gray-50 dark:hover:bg-gray-800');
    }

    if (dayData.dueBills.length > 0) {
      classes.push('border-red-300 dark:border-red-700');
    } else if (dayData.dueIncome.length > 0) {
      classes.push('border-green-300 dark:border-green-700');
    }

    return classes.join(' ');
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading calendar...</p>
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
          <h1 className="text-3xl font-bold">Financial Calendar</h1>
          <p className="text-muted-foreground">Track bills, income, and transactions</p>
        </div>
        <Button onClick={goToToday}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Today
        </Button>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-red-300 dark:border-red-700" />
            <span>Bills Due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-300 dark:border-green-700" />
            <span>Income Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Expense</span>
          </div>
        </div>
      </Card>

      {/* Calendar Navigation */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={getDayClassName(dayData)}
              onClick={() => handleDayClick(dayData)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold ${dayData.isToday ? 'text-blue-600' : ''}`}>
                  {dayData.day}
                </span>
                {(dayData.dueBills.length > 0 || dayData.dueIncome.length > 0) && (
                  <Clock className="w-3 h-3 text-orange-600" />
                )}
              </div>

              {/* Due recurring transactions */}
              {dayData.dueBills.length > 0 && (
                <div className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1 py-0.5 rounded mb-1 truncate">
                  {dayData.dueBills.length} bill{dayData.dueBills.length > 1 ? 's' : ''}
                </div>
              )}
              {dayData.dueIncome.length > 0 && (
                <div className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 py-0.5 rounded mb-1 truncate">
                  {dayData.dueIncome.length} income
                </div>
              )}

              {/* Transaction summary */}
              {dayData.totalIncome > 0 && (
                <div className="text-xs flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatCurrency(dayData.totalIncome)}</span>
                </div>
              )}
              {dayData.totalExpense > 0 && (
                <div className="text-xs flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>{formatCurrency(dayData.totalExpense)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Day Details Dialog */}
      {selectedDay && (
        <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-green-50 dark:bg-green-950">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedDay.totalIncome)}
                  </p>
                </Card>
                <Card className="p-4 bg-red-50 dark:bg-red-950">
                  <p className="text-sm text-red-700 dark:text-red-300 mb-1">Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedDay.totalExpense)}
                  </p>
                </Card>
              </div>

              {/* Due Bills */}
              {selectedDay.dueBills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Bills Due
                  </h3>
                  <div className="space-y-2">
                    {selectedDay.dueBills.map(bill => (
                      <div key={bill._id} className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{bill.description}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {bill.type} • {bill.frequency}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(bill.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Income */}
              {selectedDay.dueIncome.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Expected Income
                  </h3>
                  <div className="space-y-2">
                    {selectedDay.dueIncome.map(income => (
                      <div key={income._id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{income.description}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {income.type} • {income.frequency}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(income.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              {selectedDay.transactions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Transactions ({selectedDay.transactions.length})</h3>
                  <div className="space-y-2">
                    {selectedDay.transactions.map(transaction => (
                      <div key={transaction._id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{transaction.description || 'No description'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded capitalize">
                                {transaction.type}
                              </span>
                              {transaction.category && (
                                <span className="text-xs text-muted-foreground capitalize">
                                  {transaction.category.replace('_', ' ')}
                                </span>
                              )}
                              {transaction.merchant && (
                                <span className="text-xs text-muted-foreground">
                                  • {transaction.merchant}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.transactions.length === 0 &&
               selectedDay.dueBills.length === 0 &&
               selectedDay.dueIncome.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions or scheduled items for this day</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}
