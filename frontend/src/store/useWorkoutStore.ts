import { create } from 'zustand';
import { WorkoutSession, SetPerformance } from '@/types/gym';
import { workoutSessionService } from '@/services/workoutSessionService';

interface WorkoutStore {
  activeSession: WorkoutSession | null;
  sessionHistory: WorkoutSession[];
  loading: boolean;
  error: string | null;

  // Active workout
  startWorkout: (programId: string, date: string) => Promise<void>;
  updateSession: (sessionId: string, data: Partial<WorkoutSession>) => Promise<void>;
  logSet: (sessionId: string, exerciseId: string, setData: SetPerformance) => Promise<void>;
  completeWorkout: (sessionId: string) => Promise<void>;
  cancelWorkout: () => void;

  // History
  fetchSessionHistory: (params?: { startDate?: string; endDate?: string; programId?: string }) => Promise<void>;
  getSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeSession: null,
  sessionHistory: [],
  loading: false,
  error: null,

  startWorkout: async (programId: string, date: string) => {
    set({ loading: true, error: null });
    try {
      const session = await workoutSessionService.start({ programId, date });
      set({ activeSession: session, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSession: async (sessionId: string, data: Partial<WorkoutSession>) => {
    try {
      const updatedSession = await workoutSessionService.update(sessionId, data);
      set({ activeSession: updatedSession });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  logSet: async (sessionId: string, exerciseId: string, setData: SetPerformance) => {
    try {
      const { activeSession } = get();
      if (!activeSession) return;

      // Find the exercise in the session
      const exerciseIndex = activeSession.exercises.findIndex(
        (ex) => ex.exerciseId === exerciseId
      );

      if (exerciseIndex === -1) return;

      const updatedExercises = [...activeSession.exercises];
      const exercise = { ...updatedExercises[exerciseIndex] };

      // Add or update the set
      const setIndex = exercise.sets.findIndex(s => s.setNumber === setData.setNumber);
      if (setIndex === -1) {
        exercise.sets.push(setData);
      } else {
        exercise.sets[setIndex] = setData;
      }

      updatedExercises[exerciseIndex] = exercise;

      await workoutSessionService.update(sessionId, {
        exercises: updatedExercises
      });

      set({
        activeSession: {
          ...activeSession,
          exercises: updatedExercises
        }
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  completeWorkout: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const completedSession = await workoutSessionService.complete(sessionId);
      set({
        activeSession: null,
        sessionHistory: [completedSession, ...get().sessionHistory],
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cancelWorkout: () => {
    set({ activeSession: null });
  },

  fetchSessionHistory: async (params?: { startDate?: string; endDate?: string }) => {
    set({ loading: true, error: null });
    try {
      const sessions = await workoutSessionService.getByDateRange(params?.startDate, params?.endDate);
      set({ sessionHistory: sessions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getSession: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const session = await workoutSessionService.getById(id);
      set({ activeSession: session, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSession: async (id: string) => {
    try {
      await workoutSessionService.delete(id);
      set((state) => ({
        sessionHistory: state.sessionHistory.filter((s) => s._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
