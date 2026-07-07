import { api } from './client';

export interface UserSettings {
  userId: string;
  journeyStep: number;
  progress: number;
  visitedScreens: string[];
  featureAccess: Record<string, boolean>;
  accessibilityEnabled: boolean;
  fontSize: number;
  theme: string;
}

export const userSettingsApi = {
  get: (userId: string) => api.get<UserSettings>(`/user-settings/${userId}`),
  update: (userId: string, data: Partial<UserSettings>) => api.put<UserSettings>(`/user-settings/${userId}`, data),
};
