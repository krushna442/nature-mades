import { create } from 'zustand';
import type { User } from '../types';
import {
  loginApi,
  registerApi,
  logoutApi,
  googleLoginApi,
  fetchCurrentProfile,
  type LoginPayload,
  type RegisterPayload,
} from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  googleLogin: (credentialOrPayload: string | { credential?: string; email?: string; name?: string }) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('nature-mades-token') : null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { user } = await fetchCurrentProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch {
      localStorage.removeItem('nature-mades-token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(payload);
      localStorage.setItem('nature-mades-token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed',
      });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await registerApi(payload);
      set({
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed',
      });
      return false;
    }
  },

  googleLogin: async (credentialOrPayload) => {
    set({ isLoading: true, error: null });
    try {
      const payload = typeof credentialOrPayload === 'string'
        ? { credential: credentialOrPayload }
        : credentialOrPayload;

      const res = await googleLoginApi(payload);
      localStorage.setItem('nature-mades-token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Google sign-in failed',
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('nature-mades-token');
    logoutApi().catch(() => {});
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
