import { api } from './client';

export interface Discussion {
  id: string;
  title: string;
  category: string;
  icon: string;
  hasNewMessages: boolean;
  hasUrgentAlert: boolean;
  created_at: string;
}

export const discussionsApi = {
  getAll: () => api.get<Discussion[]>('/discussions'),
  getById: (id: string) => api.get<Discussion>(`/discussions/${id}`),
  create: (data: Omit<Discussion, 'hasNewMessages' | 'hasUrgentAlert' | 'created_at'>) => api.post<Discussion>('/discussions', data),
  update: (id: string, data: Partial<Discussion>) => api.put<Discussion>(`/discussions/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/discussions/${id}`),
};
