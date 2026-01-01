import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FinancialAccount,
  FinancialTransaction,
  Budget,
  RecurringTransaction,
  FinancialGoal,
  FinancialSummary,
  NetWorthData
} from '../types/finance';

interface FinanceState {
  // Accounts
  accounts: FinancialAccount[];
  selectedAccount: FinancialAccount | null;
  netWorth: NetWorthData | null;

  // Transactions
  transactions: FinancialTransaction[];
  selectedTransaction: FinancialTransaction | null;

  // Budgets
  budgets: Budget[];
  selectedBudget: Budget | null;

  // Recurring Transactions
  recurringTransactions: RecurringTransaction[];
  dueRecurring: RecurringTransaction[];

  // Goals
  goals: FinancialGoal[];
  selectedGoal: FinancialGoal | null;

  // Summary
  currentSummary: FinancialSummary | null;

  // UI State
  loading: boolean;
  error: string | null;

  // Selected date range for filtering
  selectedMonth: number;
  selectedYear: number;

  // Actions
  setAccounts: (accounts: FinancialAccount[]) => void;
  setSelectedAccount: (account: FinancialAccount | null) => void;
  setNetWorth: (netWorth: NetWorthData) => void;

  setTransactions: (transactions: FinancialTransaction[]) => void;
  addTransaction: (transaction: FinancialTransaction) => void;
  updateTransaction: (id: string, transaction: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  setSelectedTransaction: (transaction: FinancialTransaction | null) => void;

  setBudgets: (budgets: Budget[]) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  setSelectedBudget: (budget: Budget | null) => void;

  setRecurringTransactions: (recurring: RecurringTransaction[]) => void;
  setDueRecurring: (due: RecurringTransaction[]) => void;

  setGoals: (goals: FinancialGoal[]) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  setSelectedGoal: (goal: FinancialGoal | null) => void;

  setCurrentSummary: (summary: FinancialSummary) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  navigateMonth: (direction: 'prev' | 'next') => void;

  // Reset
  reset: () => void;
}

const initialState = {
  accounts: [],
  selectedAccount: null,
  netWorth: null,
  transactions: [],
  selectedTransaction: null,
  budgets: [],
  selectedBudget: null,
  recurringTransactions: [],
  dueRecurring: [],
  goals: [],
  selectedGoal: null,
  currentSummary: null,
  loading: false,
  error: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear()
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Account actions
      setAccounts: (accounts) => set({ accounts }),

      setSelectedAccount: (account) => set({ selectedAccount: account }),

      setNetWorth: (netWorth) => set({ netWorth }),

      // Transaction actions
      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        })),

      updateTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t._id === id ? { ...t, ...updatedTransaction } : t
          )
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t._id !== id)
        })),

      setSelectedTransaction: (transaction) =>
        set({ selectedTransaction: transaction }),

      // Budget actions
      setBudgets: (budgets) => set({ budgets }),

      updateBudget: (id, updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b._id === id ? { ...b, ...updatedBudget } : b
          )
        })),

      setSelectedBudget: (budget) => set({ selectedBudget: budget }),

      // Recurring transaction actions
      setRecurringTransactions: (recurring) =>
        set({ recurringTransactions: recurring }),

      setDueRecurring: (due) => set({ dueRecurring: due }),

      // Goal actions
      setGoals: (goals) => set({ goals }),

      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g._id === id ? { ...g, ...updatedGoal } : g
          )
        })),

      setSelectedGoal: (goal) => set({ selectedGoal: goal }),

      // Summary actions
      setCurrentSummary: (summary) => set({ currentSummary: summary }),

      // UI actions
      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setSelectedMonth: (month) => set({ selectedMonth: month }),

      setSelectedYear: (year) => set({ selectedYear: year }),

      navigateMonth: (direction) => {
        const { selectedMonth, selectedYear } = get();
        if (direction === 'next') {
          if (selectedMonth === 12) {
            set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
          } else {
            set({ selectedMonth: selectedMonth + 1 });
          }
        } else {
          if (selectedMonth === 1) {
            set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
          } else {
            set({ selectedMonth: selectedMonth - 1 });
          }
        }
      },

      // Reset
      reset: () => set(initialState)
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear
      })
    }
  )
);
