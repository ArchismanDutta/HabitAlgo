import { create } from 'zustand';
import { Exercise, WorkoutProgram, WorkoutSession } from '@/types/gym';
import { exerciseService } from '@/services/exerciseService';
import { gymProgramService } from '@/services/gymProgramService';
import { workoutSessionService } from '@/services/workoutSessionService';

interface GymStore {
  exercises: Exercise[];
  programs: WorkoutProgram[];
  todayProgram: WorkoutProgram | null;
  recentSessions: WorkoutSession[];
  loading: boolean;
  error: string | null;

  // Exercises
  fetchExercises: (category?: string) => Promise<void>;
  searchExercises: (query: string) => Promise<void>;

  // Programs
  fetchPrograms: () => Promise<void>;
  fetchTodayProgram: () => Promise<void>;

  // Recent sessions
  fetchRecentSessions: (limit?: number) => Promise<void>;
}

export const useGymStore = create<GymStore>((set) => ({
  exercises: [],
  programs: [],
  todayProgram: null,
  recentSessions: [],
  loading: false,
  error: null,

  fetchExercises: async (category?: string) => {
    set({ loading: true, error: null });
    try {
      const exercises = await exerciseService.getAll(category);
      set({ exercises, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  searchExercises: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const exercises = await exerciseService.getAll(undefined, query);
      set({ exercises, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPrograms: async () => {
    set({ loading: true, error: null });
    try {
      const programs = await gymProgramService.getAll();
      set({ programs, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTodayProgram: async () => {
    try {
      const todayProgram = await gymProgramService.getToday();
      set({ todayProgram });
    } catch (error: any) {
      set({ error: error.message, todayProgram: null });
    }
  },

  fetchRecentSessions: async (limit = 5) => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const sessions = await workoutSessionService.getByDateRange(startDate, endDate);
      const recentSessions = sessions.slice(0, limit);
      set({ recentSessions });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
