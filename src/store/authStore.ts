import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          const { user, accessToken } = response.data.data;

          // Check if user is admin
          if (user.role !== 'admin' && user.role !== 'super_admin') {
            throw new Error('Access denied. Admin privileges required.');
          }

          localStorage.setItem('adminToken', accessToken);
          set({ user, token: accessToken, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || error.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          // Ignore logout errors
        } finally {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, token: null });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          set({ user: null, token: null });
          return;
        }

        try {
          const response = await authAPI.me();
          const user = response.data.data;

          if (user.role !== 'admin' && user.role !== 'super_admin') {
            throw new Error('Access denied');
          }

          set({ user, token });
        } catch (error) {
          localStorage.removeItem('adminToken');
          set({ user: null, token: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
