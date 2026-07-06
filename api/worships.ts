import { api } from './client';

export interface Worship {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme: string;
  preacher: string;
  description: string;
  songs: string[];
  musicians: string[];
  status: string;
  createdBy: string;
  assignedMusicians: number[];
  created_at: string;
  updated_at: string;
}

export const worshipsApi = {
  getAll: () => api.get<Worship[]>('/worships'),
  getById: (id: number) => api.get<Worship>(`/worships/${id}`),
  create: (data: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => api.post<Worship>('/worships', data),
  update: (id: number, data: Partial<Worship>) => api.put<Worship>(`/worships/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/worships/${id}`),
};
