import { api } from './client';

export interface AttendanceRecord {
  id: number;
  worshipId: number;
  userId: string;
  userName: string;
  confirmed: boolean;
  created_at: string;
}

export interface AttendanceStats {
  total: number;
  confirmed: number;
}

export const attendanceApi = {
  getAll: (worshipId?: number, userId?: string) => {
    const params = new URLSearchParams();
    if (worshipId) params.set('worshipId', String(worshipId));
    if (userId) params.set('userId', userId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AttendanceRecord[]>(`/attendance${query}`);
  },
  upsert: (data: { worshipId: number; userId: string; userName: string; confirmed: boolean }) =>
    api.post<AttendanceRecord>('/attendance', data),
  getStats: () => api.get<AttendanceStats>('/attendance/stats'),
};
