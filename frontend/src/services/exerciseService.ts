import { api } from '@/lib/api';
import { Exercise, ExerciseFormData, GymApiResponse } from '@/types/gym';

export const exerciseService = {
  // Get all exercises (system + user custom)
  async getAll(category?: string, search?: string): Promise<Exercise[]> {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await api.get<GymApiResponse<Exercise[]>>('/gym/exercises', { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch exercises');
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      throw error;
    }
  },

  // Get single exercise
  async getById(id: string): Promise<Exercise> {
    try {
      const response = await api.get<GymApiResponse<Exercise>>(`/gym/exercises/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch exercise');
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
      throw error;
    }
  },

  // Create custom exercise
  async create(exerciseData: ExerciseFormData): Promise<Exercise> {
    try {
      const response = await api.post<GymApiResponse<Exercise>>('/gym/exercises', exerciseData);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to create exercise');
    } catch (error) {
      console.error('Failed to create exercise:', error);
      throw error;
    }
  },

  // Update custom exercise
  async update(id: string, updates: Partial<ExerciseFormData>): Promise<Exercise> {
    try {
      const response = await api.put<GymApiResponse<Exercise>>(`/gym/exercises/${id}`, updates);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to update exercise');
    } catch (error) {
      console.error('Failed to update exercise:', error);
      throw error;
    }
  },

  // Delete custom exercise
  async delete(id: string): Promise<void> {
    try {
      const response = await api.delete<GymApiResponse<void>>(`/gym/exercises/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete exercise');
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      throw error;
    }
  }
};
