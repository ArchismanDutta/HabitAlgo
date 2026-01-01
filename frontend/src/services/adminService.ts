import { api } from '@/lib/api';
import { User } from './authService';

export interface UserStats {
  totalUsers: number;
  newUsersLast30Days: number;
  recentUsers: User[];
}

export const adminService = {
  // Get all users
  async getAllUsers(): Promise<{ success: boolean; count: number; data: User[] }> {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<{ success: boolean; data: User }> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<{ success: boolean; data: User }> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Reset user password
  async resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Get user statistics
  async getUserStats(): Promise<{ success: boolean; data: UserStats }> {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};
