import { api } from './apiClient';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User & { addresses?: any[]; role?: string };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/register', payload);
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/login', payload);
}

export async function googleLoginApi(credentialOrPayload: { credential?: string; email?: string; name?: string }): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/google', credentialOrPayload);
}

export async function instagramLoginApi(payload: { code?: string; username?: string }): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/instagram', payload);
}

export async function fetchCurrentProfile(): Promise<{ user: User }> {
  return await api.get<{ user: User }>('/auth/me');
}

export async function updateProfileApi(payload: { name?: string; addresses?: any[] }): Promise<{ user: User }> {
  return await api.put<{ user: User }>('/auth/profile', payload);
}
