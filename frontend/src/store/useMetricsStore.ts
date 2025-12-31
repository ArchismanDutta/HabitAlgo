import { create } from 'zustand';
import { BodyMetrics, BodyGoal, BodyMetricsFormData, BodyGoalFormData } from '@/types/gym';
import { bodyMetricsService } from '@/services/bodyMetricsService';

interface MetricsStore {
  metrics: BodyMetrics[];
  latestMetrics: BodyMetrics | null;
  goals: BodyGoal[];
  activeGoal: BodyGoal | null;
  loading: boolean;
  error: string | null;

  // Metrics
  fetchMetrics: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  fetchLatestMetrics: () => Promise<void>;
  upsertMetrics: (data: BodyMetricsFormData) => Promise<void>;
  deleteMetrics: (id: string) => Promise<void>;

  // Goals
  fetchGoals: () => Promise<void>;
  fetchActiveGoal: () => Promise<void>;
  createGoal: (data: BodyGoalFormData) => Promise<void>;
  updateGoal: (id: string, data: Partial<BodyGoalFormData> & { isActive?: boolean }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  metrics: [],
  latestMetrics: null,
  goals: [],
  activeGoal: null,
  loading: false,
  error: null,

  fetchMetrics: async (params?: { startDate?: string; endDate?: string }) => {
    set({ loading: true, error: null });
    try {
      const metrics = await bodyMetricsService.getMetrics(params);
      set({ metrics, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLatestMetrics: async () => {
    try {
      const latestMetrics = await bodyMetricsService.getLatestMetrics();
      set({ latestMetrics });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  upsertMetrics: async (data: BodyMetricsFormData) => {
    set({ loading: true, error: null });
    try {
      const metrics = await bodyMetricsService.upsertMetrics(data);

      // Update metrics list
      const existingIndex = get().metrics.findIndex(m => m.date === metrics.date);
      if (existingIndex >= 0) {
        set((state) => ({
          metrics: state.metrics.map((m, i) => i === existingIndex ? metrics : m),
          latestMetrics: metrics,
          loading: false
        }));
      } else {
        set((state) => ({
          metrics: [metrics, ...state.metrics],
          latestMetrics: metrics,
          loading: false
        }));
      }

      // Update active goal's current weight if metrics include weight
      if (data.weight && get().activeGoal) {
        const activeGoal = get().activeGoal!;
        await bodyMetricsService.updateGoal(activeGoal._id, {
          currentWeight: data.weight
        } as any);
        set((state) => ({
          activeGoal: state.activeGoal ? { ...state.activeGoal, currentWeight: data.weight! } : null
        }));
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteMetrics: async (id: string) => {
    try {
      await bodyMetricsService.deleteMetrics(id);
      set((state) => ({
        metrics: state.metrics.filter((m) => m._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await bodyMetricsService.getGoals();
      set({ goals, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchActiveGoal: async () => {
    try {
      const activeGoal = await bodyMetricsService.getActiveGoal();
      set({ activeGoal });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createGoal: async (data: BodyGoalFormData) => {
    set({ loading: true, error: null });
    try {
      const goal = await bodyMetricsService.createGoal(data);
      set((state) => ({
        goals: [goal, ...state.goals],
        activeGoal: goal,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateGoal: async (id: string, data: Partial<BodyGoalFormData> & { isActive?: boolean }) => {
    try {
      const updatedGoal = await bodyMetricsService.updateGoal(id, data);
      set((state) => ({
        goals: state.goals.map((g) => g._id === id ? updatedGoal : g),
        activeGoal: state.activeGoal?._id === id ? updatedGoal : state.activeGoal
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      await bodyMetricsService.deleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((g) => g._id !== id),
        activeGoal: state.activeGoal?._id === id ? null : state.activeGoal
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
