import { api } from './client';

export interface Musician {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  voiceType: string;
  instruments: string[];
  availability: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export const musiciansApi = {
  getAll: () => api.get<Musician[]>('/musicians'),
  getById: (id: number) => api.get<Musician>(`/musicians/${id}`),
  create: (data: Omit<Musician, 'id' | 'created_at' | 'updated_at'>) => api.post<Musician>('/musicians', data),
  update: (id: number, data: Partial<Musician>) => api.put<Musician>(`/musicians/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/musicians/${id}`),
};
