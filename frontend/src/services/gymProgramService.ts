import { api } from '@/lib/api';
import { WorkoutProgram, WorkoutProgramFormData, GymApiResponse } from '@/types/gym';

export const gymProgramService = {
  // Get all programs
  async getAll(activeOnly = true): Promise<WorkoutProgram[]> {
    try {
      const response = await api.get<GymApiResponse<WorkoutProgram[]>>('/gym/programs', {
        params: { active: activeOnly }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch programs');
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      throw error;
    }
  },

  // Get single program
  async getById(id: string): Promise<WorkoutProgram> {
    try {
      const response = await api.get<GymApiResponse<WorkoutProgram>>(`/gym/programs/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch program');
    } catch (error) {
      console.error('Failed to fetch program:', error);
      throw error;
    }
  },

  // Get today's program
  async getToday(): Promise<WorkoutProgram | null> {
    try {
      const response = await api.get<GymApiResponse<WorkoutProgram>>('/gym/programs/today');

      if (response.data.success) {
        return response.data.data || null;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch today's program:", error);
      return null;
    }
  },

  // Create program
  async create(programData: WorkoutProgramFormData): Promise<WorkoutProgram> {
    try {
      const response = await api.post<GymApiResponse<WorkoutProgram>>('/gym/programs', programData);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to create program');
    } catch (error) {
      console.error('Failed to create program:', error);
      throw error;
    }
  },

  // Update program
  async update(id: string, updates: Partial<WorkoutProgramFormData>): Promise<WorkoutProgram> {
    try {
      const response = await api.put<GymApiResponse<WorkoutProgram>>(`/gym/programs/${id}`, updates);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to update program');
    } catch (error) {
      console.error('Failed to update program:', error);
      throw error;
    }
  },

  // Delete program (soft delete)
  async delete(id: string): Promise<void> {
    try {
      const response = await api.delete<GymApiResponse<void>>(`/gym/programs/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete program');
      }
    } catch (error) {
      console.error('Failed to delete program:', error);
      throw error;
    }
  }
};
