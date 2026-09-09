import { create } from 'zustand';
import type { User } from '../types';
import {
  loginApi,
  registerApi,
  googleLoginApi,
  instagramLoginApi,
  fetchCurrentProfile,
  type LoginPayload,
  type RegisterPayload,
} from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  instagramLogin: (codeOrUsername: { code?: string; username?: string }) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('nature-mades-token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    const token = localStorage.getItem('nature-mades-token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const { user } = await fetchCurrentProfile();
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      localStorage.removeItem('nature-mades-token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
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
      const res = await registerApi(payload);
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
        error: err.message || 'Registration failed',
      });
      return false;
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const res = await googleLoginApi({ credential });
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

  instagramLogin: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await instagramLoginApi(payload);
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
        error: err.message || 'Instagram sign-in failed',
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('nature-mades-token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
