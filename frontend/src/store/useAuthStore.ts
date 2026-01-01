import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, User, RegisterData, LoginData, UpdateProfileData, ChangePasswordData } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  setToken: (token: string) => void;
}

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'archieadmin19102001'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      register: async (data: RegisterData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.data,
            token: response.token,
            isAuthenticated: true,
            loading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            loading: false
          });
          throw error;
        }
      },

      login: async (data: LoginData) => {
        set({ loading: true, error: null });
        try {
          // Check if admin credentials
          if (data.email === ADMIN_CREDENTIALS.email && data.password === ADMIN_CREDENTIALS.password) {
            const adminUser: User = {
              id: 'admin-user-id',
              name: 'Admin',
              email: ADMIN_CREDENTIALS.email,
              createdAt: new Date().toISOString(),
              isAdmin: true
            };
            // Create a special admin token
            const adminToken = 'admin-token-' + btoa(ADMIN_CREDENTIALS.email);
            set({
              user: adminUser,
              token: adminToken,
              isAuthenticated: true,
              loading: false
            });
            return;
          }

          // Regular user login
          const response = await authService.login(data);
          set({
            user: { ...response.data, isAdmin: false },
            token: response.token,
            isAuthenticated: true,
            loading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            loading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      getCurrentUser: async () => {
        set({ loading: true, error: null });
        try {
          const response = await authService.getCurrentUser();
          set({
            user: { ...response.data, isAdmin: response.data.email === ADMIN_CREDENTIALS.email },
            isAuthenticated: true,
            loading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to get user',
            loading: false,
            user: null,
            token: null,
            isAuthenticated: false
          });
          throw error;
        }
      },

      updateProfile: async (data: UpdateProfileData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.updateProfile(data);
          set({
            user: response.data,
            loading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update profile',
            loading: false
          });
          throw error;
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.changePassword(data);
          set({
            user: response.data,
            token: response.token,
            loading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to change password',
            loading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setToken: (token: string) => set({ token })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
