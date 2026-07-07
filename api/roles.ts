import { api } from './client';

export interface Role {
  id: string;
  name: string;
  level: number;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export const rolesApi = {
  getAll: () => api.get<Role[]>('/roles'),
  getById: (id: string) => api.get<Role>(`/roles/${id}`),
  create: (data: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => api.post<Role>('/roles', data),
  update: (id: string, data: Partial<Role>) => api.put<Role>(`/roles/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/roles/${id}`),
};
