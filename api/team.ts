import { api } from './client';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export const teamApi = {
  getAll: () => api.get<TeamMember[]>('/team'),
  getById: (id: number) => api.get<TeamMember>(`/team/${id}`),
  create: (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => api.post<TeamMember>('/team', data),
  update: (id: number, data: Partial<TeamMember>) => api.put<TeamMember>(`/team/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/team/${id}`),
};
