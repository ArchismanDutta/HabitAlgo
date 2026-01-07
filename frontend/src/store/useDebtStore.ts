import { create } from 'zustand';
import {
  Debt,
  DebtFormData,
  DebtPaymentFormData,
  DebtSummary,
  DebtBreakdown,
  DebtPayoffProgress
} from '@/types/finance';
import { debtService } from '@/services/debtService';

interface DebtStore {
  debts: Debt[];
  debtSummary: DebtSummary | null;
  debtBreakdown: DebtBreakdown[];
  payoffProgress: DebtPayoffProgress[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchDebts: (params?: { status?: string; debtType?: string; active?: boolean }) => Promise<void>;
  createDebt: (data: DebtFormData) => Promise<void>;
  updateDebt: (id: string, data: Partial<DebtFormData>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  // Payment operations
  recordPayment: (debtId: string, data: DebtPaymentFormData) => Promise<void>;
  deletePayment: (debtId: string, paymentId: string) => Promise<void>;

  // Analytics
  fetchDebtSummary: () => Promise<void>;
  fetchDebtBreakdown: () => Promise<void>;
  fetchPayoffProgress: () => Promise<void>;

  // Utility
  refreshAll: () => Promise<void>;
}

export const useDebtStore = create<DebtStore>((set, get) => ({
  debts: [],
  debtSummary: null,
  debtBreakdown: [],
  payoffProgress: [],
  loading: false,
  error: null,

  fetchDebts: async (params?: { status?: string; debtType?: string; active?: boolean }) => {
    set({ loading: true, error: null });
    try {
      const debts = await debtService.getDebts(params);
      set({ debts, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createDebt: async (data: DebtFormData) => {
    set({ loading: true, error: null });
    try {
      const debt = await debtService.createDebt(data);

      // Add new debt to the list
      set((state) => ({
        debts: [debt, ...state.debts],
        loading: false
      }));

      // Refresh analytics
      get().fetchDebtSummary();
      get().fetchDebtBreakdown();
      get().fetchPayoffProgress();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateDebt: async (id: string, data: Partial<DebtFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedDebt = await debtService.updateDebt(id, data);

      // Update the debt in the list
      set((state) => ({
        debts: state.debts.map((d) => (d._id === id ? updatedDebt : d)),
        loading: false
      }));

      // Refresh analytics
      get().fetchDebtSummary();
      get().fetchDebtBreakdown();
      get().fetchPayoffProgress();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteDebt: async (id: string) => {
    try {
      await debtService.deleteDebt(id);

      // Remove from list
      set((state) => ({
        debts: state.debts.filter((d) => d._id !== id)
      }));

      // Refresh analytics
      get().fetchDebtSummary();
      get().fetchDebtBreakdown();
      get().fetchPayoffProgress();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  recordPayment: async (debtId: string, data: DebtPaymentFormData) => {
    set({ loading: true, error: null });
    try {
      const { debt } = await debtService.recordPayment(debtId, data);

      // Update the debt in the list
      set((state) => ({
        debts: state.debts.map((d) => (d._id === debtId ? debt : d)),
        loading: false
      }));

      // Refresh analytics
      get().fetchDebtSummary();
      get().fetchPayoffProgress();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePayment: async (debtId: string, paymentId: string) => {
    try {
      const debt = await debtService.deletePayment(debtId, paymentId);

      // Update the debt in the list
      set((state) => ({
        debts: state.debts.map((d) => (d._id === debtId ? debt : d))
      }));

      // Refresh analytics
      get().fetchDebtSummary();
      get().fetchPayoffProgress();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchDebtSummary: async () => {
    try {
      const debtSummary = await debtService.getDebtSummary();
      set({ debtSummary });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchDebtBreakdown: async () => {
    try {
      const debtBreakdown = await debtService.getDebtBreakdown();
      set({ debtBreakdown });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchPayoffProgress: async () => {
    try {
      const payoffProgress = await debtService.getPayoffProgress();
      set({ payoffProgress });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchDebts({ active: true }),
      get().fetchDebtSummary(),
      get().fetchDebtBreakdown(),
      get().fetchPayoffProgress()
    ]);
  },
}));
