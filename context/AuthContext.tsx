import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'church_app_user';
const REGISTERED_USERS_KEY = 'church_app_registered_users';
const PERMISSION_OVERRIDES_KEY = 'church_app_permission_overrides';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await createDefaultAccounts();
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        const savedUser = JSON.parse(userData);
        const overrides = await getPermissionOverrides();
        const userOverrides = overrides[savedUser.id];
        setUser(userOverrides
          ? { ...savedUser, permissions: { ...savedUser.permissions, ...userOverrides } }
          : savedUser);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionsForRole = (role: UserRole) => {
    const base = {
      canManageWorship: false,
      canManageSongs: false,
      canManageTeam: false,
      canSendCommunications: false,
      canViewOnly: true,
      canValidateWorship: false,
      canAssignMusicians: false,
      canDeleteComments: false,
    };
    switch (role) {
      case 'admin':
        return { ...base, canManageWorship: true, canManageSongs: true, canManageTeam: true, canSendCommunications: true, canViewOnly: false, canValidateWorship: true, canAssignMusicians: true, canDeleteComments: true };
      case 'editor':
      case 'viewer':
        return { ...base };
      default:
        return { ...base };
    }
  };

  const getRegisteredUsers = async () => {
    try {
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      return registeredUsersData
        ? JSON.parse(registeredUsersData)
        : {};
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return {};
    }
  };

  const getPendingRegistrations = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('church_app_pending_registrations');
      return pendingData
        ? JSON.parse(pendingData)
        : {};
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions en attente:', error);
      return {};
    }
  };

  const savePendingRegistration = async (registration: PendingRegistration) => {
    try {
      const pendingRegistrations = await getPendingRegistrations();
      pendingRegistrations[registration.email] = registration;
      await AsyncStorage.setItem('church_app_pending_registrations', JSON.stringify(pendingRegistrations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'inscription en attente:', error);
    }
  };

  const clearPendingRegistration = async (email: string) => {
    try {
      const pendingRegistrations = await getPendingRegistrations();
      delete pendingRegistrations[email];
      await AsyncStorage.setItem('church_app_pending_registrations', JSON.stringify(pendingRegistrations));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'inscription en attente:', error);
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const DEMO_ACCOUNTS: Array<{ email: string; password: string; name: string; role: UserRole }> = [
    { email: 'admin@church.com', password: 'admin123', name: 'Administrateur', role: 'admin' },
    { email: 'editor@church.com', password: 'editor123', name: 'Éditeur', role: 'editor' },
    { email: 'viewer@church.com', password: 'viewer123', name: 'Musicien', role: 'viewer' },
  ];

  const createDefaultAccounts = async () => {
    try {
      const registeredUsers = await getRegisteredUsers();
      let changed = false;

      for (const account of DEMO_ACCOUNTS) {
        const email = account.email.toLowerCase();
        if (!registeredUsers[email]) {
          registeredUsers[email] = {
            user: {
              id: `${account.role}-001`,
              name: account.name,
              email,
              role: account.role,
              permissions: getPermissionsForRole(account.role),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            password: account.password,
          };
          changed = true;
        } else {
          const freshPerms = getPermissionsForRole(account.role);
          const currentPerms = registeredUsers[email].user.permissions;
          if (JSON.stringify(currentPerms) !== JSON.stringify(freshPerms)) {
            registeredUsers[email].user.permissions = freshPerms;
            registeredUsers[email].user.updated_at = new Date().toISOString();
            changed = true;
          }
        }
      }

      if (changed) {
        await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      }
    } catch (error) {
      console.error('Erreur lors de la création des comptes par défaut:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth] Login attempt for', email);
      
      let registeredUsers: Record<string, { user: UserType; password: string }> = {};
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredUsersData) {
        registeredUsers = JSON.parse(registeredUsersData);
      }
      
      const normalizedEmail = email.toLowerCase();
      const userRecord = registeredUsers[normalizedEmail];
      
      if (userRecord && userRecord.password === password) {
        console.log('[Auth] Login success for', email);
        const overrides = await getPermissionOverrides();
        const userOverrides = overrides[userRecord.user.id];
        const finalUser = userOverrides
          ? { ...userRecord.user, permissions: { ...userRecord.user.permissions, ...userOverrides } }
          : userRecord.user;
        setUser(finalUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(finalUser));
        return true;
      }

      console.warn('[Auth] Login failed for', email);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const requestOTP = async (email: string): Promise<{ ok: boolean; reason?: string; otp?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const registeredUsers = await getRegisteredUsers();
      if (!registeredUsers[normalizedEmail]) {
        return { ok: false, reason: 'user_not_found' };
      }

      const otp = generateOTP();
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      const pendingRegistrations = await getPendingRegistrations();

      pendingRegistrations[normalizedEmail] = {
        email: normalizedEmail,
        password: registeredUsers[normalizedEmail].password,
        name: registeredUsers[normalizedEmail].user.name,
        role: registeredUsers[normalizedEmail].user.role,
        timestamp: Date.now(),
        otp,
        otpExpiry,
      };

      await AsyncStorage.setItem('church_app_pending_registrations', JSON.stringify(pendingRegistrations));
      console.log('[Auth] OTP sent to', normalizedEmail, 'OTP:', otp);

      return { ok: true, otp };
    } catch (error) {
      console.error('Erreur lors de l\'envoi OTP:', error);
      return { ok: false, reason: 'unknown' };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ ok: boolean; reason?: string }> => {
    try {
      console.log('[Auth] OTP verification attempt for', email);
      const pendingRegistrations = await getPendingRegistrations();
      const registration = pendingRegistrations[email.toLowerCase()];

      if (!registration) {
        console.warn('[Auth] No pending OTP found for', email);
        return { ok: false, reason: 'no_pending_otp' };
      }

      const now = Date.now();
      if (now > registration.otpExpiry) {
        console.warn('[Auth] OTP expired for', email);
        await clearPendingRegistration(email);
        return { ok: false, reason: 'otp_expired' };
      }

      if (registration.otp !== otp) {
        console.warn('[Auth] Invalid OTP for', email);
        return { ok: false, reason: 'invalid_otp' };
      }

      console.log('[Auth] OTP success for', email);
      await clearPendingRegistration(email);

      const registeredUsers = await getRegisteredUsers();
      const userRecord = registeredUsers[email.toLowerCase()];
      if (userRecord) {
        const overrides = await getPermissionOverrides();
        const userOverrides = overrides[userRecord.user.id];
        const finalUser = userOverrides
          ? { ...userRecord.user, permissions: { ...userRecord.user.permissions, ...userOverrides } }
          : userRecord.user;
        setUser(finalUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(finalUser));
      }

      return { ok: true };
    } catch (error) {
      console.error('Erreur lors de la vérification OTP:', error);
      return { ok: false, reason: 'unknown' };
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('[Auth] Register attempt for', data.email);
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: Record<string, { user: UserType; password: string }> = registeredUsersData 
        ? JSON.parse(registeredUsersData) 
        : {};

      if (registeredUsers[data.email.toLowerCase()]) {
        console.warn('[Auth] Register duplicate email', data.email);
        return false;
      }

      const newUser: UserType = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        permissions: getPermissionsForRole(data.role),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      registeredUsers[data.email.toLowerCase()] = {
        user: newUser,
        password: data.password
      };

      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setUser(null);
    }
  };

  const getPermissionOverrides = async (): Promise<Record<string, Partial<Permissions>>> => {
    try {
      const data = await AsyncStorage.getItem(PERMISSION_OVERRIDES_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const hasPermission = (permission: keyof UserType['permissions']): boolean => {
    return user?.permissions[permission] || false;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      if (!user) return { ok: false, reason: 'not_authenticated' };
      const registeredUsers = await getRegisteredUsers();
      const record = registeredUsers[user.email.toLowerCase()];
      if (!record) return { ok: false, reason: 'user_not_found' };
      if (record.password !== currentPassword) return { ok: false, reason: 'wrong_password' };
      if (newPassword.length < 6) return { ok: false, reason: 'weak_password' };
      registeredUsers[user.email.toLowerCase()].password = newPassword;
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      return { ok: true };
    } catch (e) {
      console.error('Erreur changement de mot de passe:', e);
      return { ok: false, reason: 'unknown' };
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      const normalized = email.toLowerCase().trim();
      const registeredUsers = await getRegisteredUsers();
      if (!registeredUsers[normalized]) return { ok: false, reason: 'user_not_found' };
      if (newPassword.length < 6) return { ok: false, reason: 'weak_password' };
      registeredUsers[normalized].password = newPassword;
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      return { ok: true };
    } catch (e) {
      console.error('Erreur réinitialisation de mot de passe:', e);
      return { ok: false, reason: 'unknown' };
    }
  };

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    try {
      if (!user) return false;
      const registeredUsers = await getRegisteredUsers();
      const record = registeredUsers[user.email.toLowerCase()];
      if (!record) return false;

      const updatedUser = { ...record.user, name, email: email.toLowerCase(), updated_at: new Date().toISOString() };
      record.user = updatedUser;

      if (email.toLowerCase() !== user.email.toLowerCase()) {
        delete registeredUsers[user.email.toLowerCase()];
        registeredUsers[email.toLowerCase()] = record;
      } else {
        registeredUsers[user.email.toLowerCase()] = record;
      }

      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (e) {
      console.error('Erreur mise à jour profil:', e);
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      if (!user || user.role !== 'admin') return false;
      const registeredUsers = await getRegisteredUsers();
      for (const email in registeredUsers) {
        if (registeredUsers[email].user.id === userId) {
          registeredUsers[email].user.role = newRole;
          registeredUsers[email].user.permissions = getPermissionsForRole(newRole);
          registeredUsers[email].user.updated_at = new Date().toISOString();
          await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
          const overrides = await getPermissionOverrides();
          delete overrides[userId];
          await AsyncStorage.setItem(PERMISSION_OVERRIDES_KEY, JSON.stringify(overrides));
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Erreur mise à jour rôle:', e);
      return false;
    }
  };

  const updateUserPermissions = async (userId: string, permissionUpdates: Partial<Permissions>): Promise<boolean> => {
    try {
      if (!user || user.role !== 'admin') return false;
      const overrides = await getPermissionOverrides();
      overrides[userId] = { ...(overrides[userId] || {}), ...permissionUpdates };
      await AsyncStorage.setItem(PERMISSION_OVERRIDES_KEY, JSON.stringify(overrides));
      if (user.id === userId) {
        const updatedUser = { ...user, permissions: { ...user.permissions, ...permissionUpdates } };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      return true;
    } catch (e) {
      console.error('Erreur mise à jour permissions:', e);
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

interface PendingRegistration {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  timestamp: number;
  otp: string;
  otpExpiry: number;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

