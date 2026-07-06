import { api } from './client';

export interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  category: string;
  notes: string;
  lyrics: string;
  created_at: string;
  updated_at: string;
}

export const songsApi = {
  getAll: () => api.get<Song[]>('/songs'),
  getById: (id: number) => api.get<Song>(`/songs/${id}`),
  create: (data: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => api.post<Song>('/songs', data),
  update: (id: number, data: Partial<Song>) => api.put<Song>(`/songs/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/songs/${id}`),
};
