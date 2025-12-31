import { api } from '@/lib/api';
import type { BodyMetrics, BodyMetricsFormData, BodyGoal, BodyGoalFormData, GymApiResponse } from '@/types/gym';

const BASE_URL = '/gym';

export const bodyMetricsService = {
  // ===== BODY METRICS =====
  async upsertMetrics(data: BodyMetricsFormData): Promise<BodyMetrics> {
    const response = await api.post<GymApiResponse<BodyMetrics>>(`${BASE_URL}/metrics`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to save metrics');
    }
    return response.data.data;
  },

  async getMetrics(params?: { startDate?: string; endDate?: string }): Promise<BodyMetrics[]> {
    const response = await api.get<GymApiResponse<BodyMetrics[]>>(`${BASE_URL}/metrics`, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch metrics');
    }
    return response.data.data;
  },

  async getLatestMetrics(): Promise<BodyMetrics | null> {
    const response = await api.get<GymApiResponse<BodyMetrics>>(`${BASE_URL}/metrics/latest`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch latest metrics');
    }
    return response.data.data || null;
  },

  async deleteMetrics(id: string): Promise<void> {
    const response = await api.delete<GymApiResponse<void>>(`${BASE_URL}/metrics/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete metrics');
    }
  },

  // ===== BODY GOALS =====
  async createGoal(data: BodyGoalFormData): Promise<BodyGoal> {
    const response = await api.post<GymApiResponse<BodyGoal>>(`${BASE_URL}/goals`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create goal');
    }
    return response.data.data;
  },

  async getGoals(): Promise<BodyGoal[]> {
    const response = await api.get<GymApiResponse<BodyGoal[]>>(`${BASE_URL}/goals`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch goals');
    }
    return response.data.data;
  },

  async getActiveGoal(): Promise<BodyGoal | null> {
    const response = await api.get<GymApiResponse<BodyGoal>>(`${BASE_URL}/goals/active`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch active goal');
    }
    return response.data.data || null;
  },

  async updateGoal(id: string, data: Partial<BodyGoalFormData> & { isActive?: boolean }): Promise<BodyGoal> {
    const response = await api.put<GymApiResponse<BodyGoal>>(`${BASE_URL}/goals/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update goal');
    }
    return response.data.data;
  },

  async deleteGoal(id: string): Promise<void> {
    const response = await api.delete<GymApiResponse<void>>(`${BASE_URL}/goals/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete goal');
    }
  },
};
