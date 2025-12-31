import { api } from '@/lib/api';
import { DailyLog, ApiResponse } from '@/types';
import { db, addToSyncQueue } from '@/lib/db';
import { formatDate } from '@/utils/dateUtils';

export const logService = {
  // Get logs for a specific date
  async getByDate(date: Date | string): Promise<DailyLog[]> {
    const dateStr = typeof date === 'string' ? date : formatDate(date);

    try {
      const response = await api.get<ApiResponse<DailyLog[]>>('/logs', {
        params: { date: dateStr }
      });

      if (response.data.success && response.data.data) {
        await db.dailyLogs.bulkPut(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch logs');
    } catch (error) {
      return await db.dailyLogs.where('date').equals(dateStr).toArray();
    }
  },

  // Get logs for a date range
  async getByDateRange(startDate: string, endDate: string): Promise<DailyLog[]> {
    try {
      const response = await api.get<ApiResponse<DailyLog[]>>('/logs', {
        params: { startDate, endDate }
      });

      if (response.data.success && response.data.data) {
        await db.dailyLogs.bulkPut(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch logs');
    } catch (error) {
      return await db.dailyLogs
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray();
    }
  },

  // Create or update daily log
  async upsert(logData: Partial<DailyLog>): Promise<DailyLog> {
    try {
      const response = await api.post<ApiResponse<DailyLog>>('/logs', logData);

      if (response.data.success && response.data.data) {
        await db.dailyLogs.put(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to save log');
    } catch (error) {
      // Save offline - check for existing log first
      const dateStr = typeof logData.date === 'string' ? logData.date : formatDate(logData.date!);

      // Find existing log for this date and habit
      const existingLogs = await db.dailyLogs.where('date').equals(dateStr).toArray();
      const existingLog = existingLogs.find(l => l.habitId === logData.habitId);

      if (existingLog) {
        // Update existing log
        const updatedLog = {
          ...existingLog,
          ...logData,
          updatedAt: new Date().toISOString()
        } as DailyLog;

        await db.dailyLogs.put(updatedLog);
        await addToSyncQueue('UPDATE', 'log', existingLog._id, updatedLog);

        return updatedLog;
      } else {
        // Create new log
        const tempId = `temp_${Date.now()}`;
        const newLog = {
          ...logData,
          _id: tempId,
          date: dateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as DailyLog;

        await db.dailyLogs.put(newLog);
        await addToSyncQueue('CREATE', 'log', tempId, newLog);

        return newLog;
      }
    }
  },

  // Bulk upsert logs
  async bulkUpsert(logs: Partial<DailyLog>[]): Promise<void> {
    try {
      await api.post('/logs/bulk', { logs });
      // Logs will be synced on next pull
    } catch (error) {
      // Save offline
      for (const log of logs) {
        await this.upsert(log);
      }
    }
  },

  // Save reflection
  async saveReflection(date: string, reflection: {
    text: string;
    achievements: string[];
    energy: number;
  }): Promise<void> {
    try {
      await api.post('/logs/reflection', { date, ...reflection });
    } catch (error) {
      await addToSyncQueue('CREATE', 'reflection', date, { date, ...reflection });
    }
  },

  // Get reflection for date
  async getReflection(date: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(`/logs/reflection/${date}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  // Save screen time
  async saveScreenTime(date: string, screenTime: {
    morning: number;
    day: number;
    evening: number;
    night: number;
  }): Promise<void> {
    try {
      await api.post('/logs/screentime', { date, ...screenTime });
    } catch (error) {
      console.error('Failed to save screen time:', error);
    }
  },

  // Get screen time for month
  async getScreenTimeByMonth(year: number, month: number): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/logs/screentime/month', {
        params: { year, month }
      });
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }
};
