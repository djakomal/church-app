import { api } from './client';

export interface Message {
  id: number;
  discussionId: string;
  message: string;
  senderName: string;
  userId: string;
  isOwnMessage: boolean;
  created_at: string;
}

export const messagesApi = {
  getAll: (discussionId?: string) => {
    const query = discussionId ? `?discussionId=${discussionId}` : '';
    return api.get<Message[]>(`/messages${query}`);
  },
  getById: (id: number) => api.get<Message>(`/messages/${id}`),
  create: (data: Omit<Message, 'id' | 'isOwnMessage' | 'created_at'>) => api.post<Message>('/messages', data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/messages/${id}`),
};
