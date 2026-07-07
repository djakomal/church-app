import { api } from './client';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

export const permissionsApi = {
  getAll: () => api.get<Permission[]>('/permissions'),
  getById: (id: string) => api.get<Permission>(`/permissions/${id}`),
  create: (data: Omit<Permission, 'id' | 'created_at'>) => api.post<Permission>('/permissions', data),
  update: (id: string, data: Partial<Permission>) => api.put<Permission>(`/permissions/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/permissions/${id}`),
};
