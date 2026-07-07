import { api, setToken, getToken } from './client';
export { setToken, getToken };

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  status: string;
  phone: string;
  department: string;
  position: string;
  lastLogin: string;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  sendOTP: async (email: string) => {
    return api.post<{ ok: boolean; devCode?: string }>('/auth/send-otp', { email });
  },
  sendResetOTP: async (email: string) => {
    return api.post<{ ok: boolean; devCode?: string }>('/auth/send-reset-otp', { email });
  },
  verifyOTP: async (email: string, otp: string) => {
    return api.post<{ ok: boolean }>('/auth/verify-otp', { email, otp });
  },
  login: async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setToken(res.token);
    return res;
  },
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    setToken(res.token);
    return res;
  },
  me: async () => {
    const user = await api.get<User>('/auth/me');
    return user;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.put<{ ok: boolean }>('/auth/password', { currentPassword, newPassword });
  },
  resetPassword: async (email: string, newPassword: string) => {
    return api.post<{ ok: boolean }>('/auth/reset-password', { email, newPassword });
  },
  updateProfile: async (name: string, email: string) => {
    return api.put<User>('/auth/profile', { name, email });
  },
  logout: () => {
    setToken(null);
  },
};
