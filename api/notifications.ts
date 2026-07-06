import { api } from './client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  isScheduled: boolean;
  scheduledDate: string;
  sent_at: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  getById: (id: number) => api.get<Notification>(`/notifications/${id}`),
  create: (data: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => api.post<Notification>('/notifications', data),
  update: (id: number, data: Partial<Notification>) => api.put<Notification>(`/notifications/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/notifications/${id}`),
  markAsRead: (id: number) => api.post<{ ok: boolean }>(`/notifications/${id}/read`),
  markAllAsRead: () => api.post<{ ok: boolean }>('/notifications/read-all'),
};
