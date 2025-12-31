import { create } from 'zustand';
import { DailyLog } from '@/types';
import { logService } from '@/services/logService';
import { formatDate } from '@/utils/dateUtils';

interface LogStore {
  logs: Record<string, DailyLog[]>;
  loading: boolean;
  error: string | null;

  fetchLogsForDate: (date: Date | string) => Promise<void>;
  fetchLogsForRange: (startDate: string, endDate: string) => Promise<void>;
  upsertLog: (log: Partial<DailyLog>) => Promise<void>;
  getLogsForHabit: (habitId: string, date: string) => DailyLog | undefined;
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: {},
  loading: false,
  error: null,

  fetchLogsForDate: async (date) => {
    const dateKey = typeof date === 'string' ? date : formatDate(date);
    set({ loading: true, error: null });

    try {
      const logs = await logService.getByDate(dateKey);

      // Normalize habitId to string (handle populated objects from backend)
      const normalizedLogs = logs.map(log => ({
        ...log,
        habitId: typeof log.habitId === 'string' ? log.habitId : log.habitId?._id || log.habitId
      }));

      set((state) => ({
        logs: { ...state.logs, [dateKey]: normalizedLogs },
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLogsForRange: async (startDate, endDate) => {
    set({ loading: true, error: null });

    try {
      const logs = await logService.getByDateRange(startDate, endDate);

      // Normalize habitId and group by date
      const groupedLogs: Record<string, DailyLog[]> = {};
      logs.forEach((log) => {
        const dateKey = formatDate(log.date);
        if (!groupedLogs[dateKey]) {
          groupedLogs[dateKey] = [];
        }

        // Normalize habitId to string (handle populated objects from backend)
        const normalizedLog = {
          ...log,
          habitId: typeof log.habitId === 'string' ? log.habitId : log.habitId?._id || log.habitId
        };

        groupedLogs[dateKey].push(normalizedLog);
      });

      set((state) => ({
        logs: { ...state.logs, ...groupedLogs },
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  upsertLog: async (logData) => {
    try {
      console.log('[LogStore] Upserting log:', logData);
      const log = await logService.upsert(logData);
      console.log('[LogStore] Log upserted successfully:', log);
      const dateKey = formatDate(log.date);

      set((state) => {
        const dateLogs = state.logs[dateKey] || [];

        // Handle both string IDs and populated habit objects from backend
        const getHabitId = (habitId: any) => {
          return typeof habitId === 'string' ? habitId : habitId?._id || habitId;
        };

        const logHabitId = getHabitId(log.habitId);
        const existingIndex = dateLogs.findIndex(
          (l) => getHabitId(l.habitId) === logHabitId
        );

        console.log('[LogStore] Existing logs for', dateKey, ':', dateLogs);
        console.log('[LogStore] Log habitId:', logHabitId);
        console.log('[LogStore] Existing index:', existingIndex);

        // Normalize the log to store only habitId as string
        const normalizedLog = {
          ...log,
          habitId: logHabitId
        };

        const updatedLogs =
          existingIndex >= 0
            ? dateLogs.map((l, i) => (i === existingIndex ? normalizedLog : l))
            : [...dateLogs, normalizedLog];

        console.log('[LogStore] Updated logs:', updatedLogs);

        const newState = {
          logs: { ...state.logs, [dateKey]: updatedLogs }
        };

        console.log('[LogStore] New state logs for', dateKey, ':', newState.logs[dateKey]);
        return newState;
      });
    } catch (error: any) {
      console.error('[LogStore] Failed to upsert log:', error);
      set({ error: error.message });
      throw error;
    }
  },

  getLogsForHabit: (habitId, date) => {
    const dateLogs = get().logs[date] || [];
    return dateLogs.find((log) => log.habitId === habitId);
  }
}));
