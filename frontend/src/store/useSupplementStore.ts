import { create } from 'zustand';
import { Supplement, SupplementLog, SupplementFormData, SupplementTiming, SupplementAdherence } from '@/types/gym';
import { supplementService } from '@/services/supplementService';

interface SupplementStore {
  supplements: Supplement[];
  todayLogs: SupplementLog[];
  adherenceStats: SupplementAdherence[];
  loading: boolean;
  error: string | null;

  // Supplements
  fetchSupplements: () => Promise<void>;
  createSupplement: (data: SupplementFormData) => Promise<void>;
  updateSupplement: (id: string, data: Partial<SupplementFormData>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;

  // Logs
  fetchTodayLogs: () => Promise<void>;
  logSupplement: (supplementId: string, date: string, timing: SupplementTiming, taken: boolean, amount?: string, notes?: string) => Promise<void>;
  updateLog: (id: string, data: { taken: boolean; amount?: string; notes?: string }) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;

  // Stats
  fetchAdherenceStats: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
}

export const useSupplementStore = create<SupplementStore>((set, get) => ({
  supplements: [],
  todayLogs: [],
  adherenceStats: [],
  loading: false,
  error: null,

  fetchSupplements: async () => {
    set({ loading: true, error: null });
    try {
      const supplements = await supplementService.getSupplements();
      set({ supplements, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createSupplement: async (data: SupplementFormData) => {
    set({ loading: true, error: null });
    try {
      const supplement = await supplementService.createSupplement(data);
      set((state) => ({
        supplements: [...state.supplements, supplement],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSupplement: async (id: string, data: Partial<SupplementFormData>) => {
    try {
      const updatedSupplement = await supplementService.updateSupplement(id, data);
      set((state) => ({
        supplements: state.supplements.map((s) => s._id === id ? updatedSupplement : s)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSupplement: async (id: string) => {
    try {
      await supplementService.deleteSupplement(id);
      set((state) => ({
        supplements: state.supplements.filter((s) => s._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchTodayLogs: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = await supplementService.getSupplementLogs({ date: today });
      set({ todayLogs: logs });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  logSupplement: async (supplementId: string, date: string, timing: SupplementTiming, taken: boolean, amount?: string, notes?: string) => {
    try {
      const log = await supplementService.logSupplement(supplementId, date, timing, taken, amount, notes);

      // Update today's logs if it's for today
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        const existingIndex = get().todayLogs.findIndex(
          l => (typeof l.supplementId === 'string' ? l.supplementId : l.supplementId._id) === supplementId && l.timing === timing
        );

        if (existingIndex >= 0) {
          set((state) => ({
            todayLogs: state.todayLogs.map((l, i) => i === existingIndex ? log : l)
          }));
        } else {
          set((state) => ({
            todayLogs: [...state.todayLogs, log]
          }));
        }
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateLog: async (id: string, data: { taken: boolean; amount?: string; notes?: string }) => {
    try {
      const updatedLog = await supplementService.updateSupplementLog(id, data);
      set((state) => ({
        todayLogs: state.todayLogs.map((l) => l._id === id ? updatedLog : l)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteLog: async (id: string) => {
    try {
      await supplementService.deleteSupplementLog(id);
      set((state) => ({
        todayLogs: state.todayLogs.filter((l) => l._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAdherenceStats: async (params?: { startDate?: string; endDate?: string }) => {
    set({ loading: true, error: null });
    try {
      const stats = await supplementService.getAdherenceStats(params);
      set({ adherenceStats: stats, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
