import { api } from './apiClient';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User & { addresses?: any[] };
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

export async function registerApi(payload: RegisterPayload): Promise<{ message: string; email: string }> {
  return await api.post<{ message: string; email: string }>('/auth/register', payload);
}

export async function sendOtpApi(email: string): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/auth/send-otp', { email });
}

export async function resetPasswordApi(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/auth/reset-password', payload);
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/login', payload);
}

export async function googleLoginApi(credentialOrPayload: { credential?: string; email?: string; name?: string }): Promise<AuthResponse> {
  return await api.post<AuthResponse>('/auth/google', credentialOrPayload);
}

export async function fetchCurrentProfile(): Promise<{ user: User }> {
  return await api.get<{ user: User }>('/auth/me');
}

export async function updateProfileApi(payload: { name?: string; addresses?: any[] }): Promise<{ user: User }> {
  return await api.put<{ user: User }>('/auth/profile', payload);
}

export async function logoutApi(): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/auth/logout');
}
