import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Add JWT token to requests
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }

    // Prevent GET caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'An error occurred';

      if (status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error('The requested resource was not found.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(message);
      }

      console.error('API Error:', error.response.data);
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('Network error. Please check your internet connection.');
      }
      console.error('Network Error:', error.message);
    } else {
      toast.error('An unexpected error occurred.');
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ THIS LINE FIXES EVERYTHING
export default api;
