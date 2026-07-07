import { api } from './client';

export interface Feature {
  id: string;
  name: string;
  description: string;
  requiredRole: string;
  isEnabled: boolean;
  created_at: string;
}

export const featuresApi = {
  getAll: () => api.get<Feature[]>('/features'),
  update: (id: string, data: Partial<Feature>) => api.put<Feature>(`/features/${id}`, data),
};
