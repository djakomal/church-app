import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi, setToken, getToken } from '@/api/auth';
import { usersApi } from '@/api/users';
import { simpleDatabase } from '@/database/simpleDatabase';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Permissions {
  canManageWorship: boolean;
  canManageSongs: boolean;
  canManageTeam: boolean;
  canSendCommunications: boolean;
  canViewOnly: boolean;
  canValidateWorship: boolean;
  canAssignMusicians: boolean;
  canDeleteComments: boolean;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permissions;
  musicianType?: 'chantre' | 'instrumentiste';
  instruments?: string[];
  voiceType?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  requestOTP: (email: string) => Promise<{ ok: boolean; reason?: string; otp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ ok: boolean; reason?: string }>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof UserType['permissions']) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; reason?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ ok: boolean; reason?: string }>;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  updateUserPermissions: (userId: string, permissions: Partial<Permissions>) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  musicianType?: 'chantre' | 'instrumentiste';
  instruments?: string[];
  voiceType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapPermissions(apiPerms: Record<string, boolean>): Permissions {
  return {
    canManageWorship: apiPerms.canCreateCults || apiPerms.canManageAllCults || false,
    canManageSongs: apiPerms.canManageSongs || false,
    canManageTeam: apiPerms.canManageUsers || false,
    canSendCommunications: apiPerms.canSendGlobalNotifications || false,
    canViewOnly: !apiPerms.canCreateCults && !apiPerms.canManageSongs,
    canValidateWorship: apiPerms.canValidateCults || false,
    canAssignMusicians: apiPerms.canAssignMusicians || false,
    canDeleteComments: apiPerms.canDeleteComments || false,
  };
}

function toUserType(apiUser: any): UserType {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    permissions: mapPermissions(apiUser.permissions || {}),
    musicianType: apiUser.musicianType,
    instruments: apiUser.instruments,
    voiceType: apiUser.voiceType,
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      if (getToken()) {
        const apiUser = await authApi.me();
        setUser(toUserType(apiUser));
      }
    } catch (error) {
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: apiUser } = await authApi.login(email, password);
      setUser(toUserType(apiUser));
      return true;
    } catch (error: any) {
      console.warn('[Auth] Login failed for', email, error.message);
      return false;
    }
  };

  const requestOTP = async (email: string): Promise<{ ok: boolean; reason?: string; otp?: string }> => {
    return { ok: false, reason: 'otp_not_available' };
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ ok: boolean; reason?: string }> => {
    return { ok: false, reason: 'otp_not_available' };
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const { user: apiUser } = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      setUser(toUserType(apiUser));

      if (data.musicianType || data.role === 'viewer' || data.role === 'editor') {
        const type = data.musicianType || (data.role === 'viewer' ? 'instrumentiste' : 'chantre');
        await simpleDatabase.createMusician({
          name: data.name,
          email: data.email.toLowerCase(),
          phone: '',
          type: type as 'chantre' | 'instrumentiste',
          voiceType: data.voiceType,
          instruments: data.instruments,
        });
      }

      return true;
    } catch (error: any) {
      console.warn('[Auth] Register failed:', error.message);
      return false;
    }
  };

  const logout = async () => {
    authApi.logout();
    setUser(null);
  };

  const hasPermission = (permission: keyof UserType['permissions']): boolean => {
    return user?.permissions[permission] || false;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, reason: error.message || 'unknown' };
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    return { ok: false, reason: 'not_available' };
  };

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    try {
      const apiUser = await authApi.updateProfile(name, email);
      setUser(toUserType(apiUser));
      return true;
    } catch {
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      await usersApi.update(userId, { role: newRole } as any);
      return true;
    } catch {
      return false;
    }
  };

  const updateUserPermissions = async (userId: string, permissionUpdates: Partial<Permissions>): Promise<boolean> => {
    try {
      await usersApi.updatePermissions(userId, permissionUpdates as Record<string, boolean>);
      if (user?.id === userId) {
        const updatedUser = { ...user, permissions: { ...user.permissions, ...permissionUpdates } };
        setUser(updatedUser);
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      requestOTP,
      verifyOTP,
      register,
      logout,
      hasPermission,
      changePassword,
      resetPassword,
      updateProfile,
      updateUserRole,
      updateUserPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
