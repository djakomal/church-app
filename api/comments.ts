import { api } from './client';

export interface Comment {
  id: number;
  notificationId: number;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const commentsApi = {
  getAll: () => api.get<Comment[]>('/comments'),
  getByNotificationId: (notificationId: number) => api.get<Comment[]>(`/comments/by-notification/${notificationId}`),
  create: (data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => api.post<Comment>('/comments', data),
  update: (id: number, data: { content: string }) => api.put<Comment>(`/comments/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/comments/${id}`),
  deleteByNotificationId: (notificationId: number) => api.delete<{ ok: boolean }>(`/comments/by-notification/${notificationId}`),
};
