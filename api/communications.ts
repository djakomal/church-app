import { api } from './client';

export interface Communication {
  id: number;
  message: string;
  type: string;
  sent_at: string;
  created_at: string;
}

export const communicationsApi = {
  getAll: () => api.get<Communication[]>('/communications'),
  create: (data: Omit<Communication, 'id' | 'created_at'>) => api.post<Communication>('/communications', data),
};
