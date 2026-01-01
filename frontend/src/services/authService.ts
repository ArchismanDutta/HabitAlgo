import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: User }> {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; data: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(resetToken: string, password: string): Promise<AuthResponse> {
    const response = await api.put(`/auth/reset-password/${resetToken}`, { password });
    return response.data;
  }
};
