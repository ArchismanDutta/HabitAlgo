import { create } from 'zustand';
import { Habit } from '@/types';
import { habitService } from '@/services/habitService';

interface HabitStore {
  habits: Habit[];
  loading: boolean;
  error: string | null;

  fetchHabits: () => Promise<void>;
  createHabit: (habit: Partial<Habit>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const habits = await habitService.getAll(true);
      set({ habits, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createHabit: async (habitData) => {
    try {
      const newHabit = await habitService.create(habitData);
      set((state) => ({ habits: [...state.habits, newHabit] }));
      return newHabit;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const updatedHabit = await habitService.update(id, updates);
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? updatedHabit : h))
      }));
      return updatedHabit;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      await habitService.delete(id);
      set((state) => ({
        habits: state.habits.filter((h) => h._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleHabit: async (id) => {
    try {
      const updatedHabit = await habitService.toggle(id);
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? updatedHabit : h))
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
