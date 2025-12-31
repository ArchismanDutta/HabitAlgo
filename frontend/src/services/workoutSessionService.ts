import { api } from '@/lib/api';
import { WorkoutSession, GymApiResponse } from '@/types/gym';

export const workoutSessionService = {
  // Start new workout session
  async start(sessionData: { programId: string; date: string }): Promise<WorkoutSession> {
    try {
      const response = await api.post<GymApiResponse<WorkoutSession>>('/gym/sessions', sessionData);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to start session');
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  // Update session (log sets, exercises)
  async update(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    try {
      const response = await api.put<GymApiResponse<WorkoutSession>>(`/gym/sessions/${id}`, updates);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to update session');
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  // Complete session
  async complete(id: string): Promise<WorkoutSession> {
    try {
      const response = await api.post<GymApiResponse<WorkoutSession>>(`/gym/sessions/${id}/complete`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to complete session');
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  },

  // Get sessions by date range
  async getByDateRange(startDate?: string, endDate?: string): Promise<WorkoutSession[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get<GymApiResponse<WorkoutSession[]>>('/gym/sessions', { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch sessions');
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  },

  // Get session by ID
  async getById(id: string): Promise<WorkoutSession> {
    try {
      const response = await api.get<GymApiResponse<WorkoutSession>>(`/gym/sessions/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch session');
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw error;
    }
  },

  // Delete session
  async delete(id: string): Promise<void> {
    try {
      const response = await api.delete<GymApiResponse<void>>(`/gym/sessions/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }
};
