import { api } from './client';
import type { User } from './auth';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: { name: string; email: string; password?: string; role?: string; status?: string }) =>
    api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/users/${id}`),
  updatePermissions: (id: string, permissions: Record<string, boolean>) =>
    api.put<{ ok: boolean }>(`/users/${id}/permissions`, permissions),
};
