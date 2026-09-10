import { api, request } from './apiClient';
import type { Product, AdminStats, AdminOrder, AdminUser } from '../types';

// --- Stats ---
export async function fetchAdminStats(): Promise<AdminStats> {
  return api.get<AdminStats>('/admin/stats');
}

// --- Products ---
export async function fetchAdminProducts(params: { search?: string; category?: string; page?: number; limit?: number } = {}): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  const qs = query.toString();
  return api.get(`/admin/products${qs ? `?${qs}` : ''}`);
}

export async function createProduct(data: Partial<Product>): Promise<{ message: string; product: Product }> {
  return api.post('/admin/products', data);
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<{ message: string; product: Product }> {
  return api.put(`/admin/products/${id}`, data);
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return api.delete(`/admin/products/${id}`);
}

// --- Orders ---
export async function fetchAdminOrders(params: { page?: number; limit?: number } = {}): Promise<{ orders: AdminOrder[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  const qs = query.toString();
  return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(id: string, orderStatus: string): Promise<{ message: string; order: { id: string; orderNumber: string; orderStatus: string } }> {
  return request(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ orderStatus }),
  });
}

// --- Users ---
export async function fetchAdminUsers(params: { search?: string; page?: number; limit?: number } = {}): Promise<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  const qs = query.toString();
  return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
}

export async function updateUserRole(id: string, role: 'customer' | 'admin'): Promise<{ message: string; user: AdminUser }> {
  return request(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}
