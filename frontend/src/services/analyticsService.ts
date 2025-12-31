import { api } from '@/lib/api';
import { ChartData, StreakData, ApiResponse } from '@/types';

export const analyticsService = {
  // Get chart data for dashboard
  async getChartData(year: number, month: number): Promise<ChartData> {
    try {
      const response = await api.get<ApiResponse<ChartData>>('/analytics/charts', {
        params: { year, month }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch chart data');
    } catch (error) {
      // Return empty data if offline
      return {
        dailyData: [],
        overallCompletion: { completed: 0, total: 0, rate: 0 },
        habitStats: []
      };
    }
  },

  // Get all habit streaks
  async getStreaks(): Promise<StreakData[]> {
    try {
      const response = await api.get<ApiResponse<StreakData[]>>('/analytics/streaks');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch streaks');
    } catch (error) {
      return [];
    }
  },

  // Get trends
  async getTrends(habitId?: string, period: 'week' | 'month' = 'month'): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/analytics/trends', {
        params: { habitId, period }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch trends');
    } catch (error) {
      return [];
    }
  },

  // Get monthly summary for all habits
  async getMonthlySummary(year: number, month: number): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/analytics/month', {
        params: { year, month }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch summary');
    } catch (error) {
      return [];
    }
  },

  // Get monthly summary for a specific habit from the monthly data
  async getHabitMonthlySummary(habitId: string, year: number, month: number): Promise<any | null> {
    try {
      const summaries = await this.getMonthlySummary(year, month);
      return summaries.find((s: any) => s.habitId === habitId || s.habitId?._id === habitId) || null;
    } catch (error) {
      return null;
    }
  }
};
