import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: {
    canManageWorship: boolean;
    canManageSongs: boolean;
    canManageTeam: boolean;
    canSendCommunications: boolean;
    canViewOnly: boolean;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof User['permissions']) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; reason?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ ok: boolean; reason?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'church_app_user';
const REGISTERED_USERS_KEY = 'church_app_registered_users';
const ADMIN_CREATED_KEY = 'church_app_admin_created';

// Compte administrateur par défaut
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  name: 'Administrateur',
  email: 'admin@church.com',
  role: 'admin',
  permissions: {
    canManageWorship: true,
    canManageSongs: true,
    canManageTeam: true,
    canSendCommunications: true,
    canViewOnly: false,
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Créer le compte administrateur s'il n'existe pas
      await createDefaultAdmin();
      
      // Charger l'utilisateur connecté
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultAdmin = async () => {
    try {
      // Vérifier si l'admin a déjà été créé
      const adminCreated = await AsyncStorage.getItem(ADMIN_CREATED_KEY);
      if (adminCreated) {
        return; // Admin déjà créé
      }

      // Récupérer les utilisateurs existants
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: Record<string, { user: User; password: string }> = registeredUsersData 
        ? JSON.parse(registeredUsersData) 
        : {};

      // Créer le compte administrateur par défaut
      registeredUsers[DEFAULT_ADMIN.email] = {
        user: DEFAULT_ADMIN,
        password: 'admin123' // Mot de passe par défaut pour l'admin
      };

      // Sauvegarder
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      await AsyncStorage.setItem(ADMIN_CREATED_KEY, 'true');
      
      console.log('Compte administrateur créé automatiquement');
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
    }
  };

  const getPermissionsForRole = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          canManageWorship: true,
          canManageSongs: true,
          canManageTeam: true,
          canSendCommunications: true,
          canViewOnly: false,
        };
      case 'editor':
        return {
          canManageWorship: true,
          canManageSongs: true,
          canManageTeam: false,
          canSendCommunications: true,
          canViewOnly: false,
        };
      case 'viewer':
        return {
          canManageWorship: false,
          canManageSongs: false,
          canManageTeam: false,
          canSendCommunications: false,
          canViewOnly: true,
        };
      default:
        return {
          canManageWorship: false,
          canManageSongs: false,
          canManageTeam: false,
          canSendCommunications: false,
          canViewOnly: true,
        };
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth] Login attempt for', email);
      // Vérifier les utilisateurs enregistrés (incluant l'admin créé automatiquement)
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredUsersData) {
        const registeredUsers: Record<string, { user: User; password: string }> = JSON.parse(registeredUsersData);
        const userRecord = registeredUsers[email.toLowerCase()];
        
        if (userRecord && userRecord.password === password) {
          console.log('[Auth] Login success for', email);
          setUser(userRecord.user);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userRecord.user));
          return true;
        }
      }

      console.warn('[Auth] Login failed for', email);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('[Auth] Register attempt for', data.email);
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: Record<string, { user: User; password: string }> = registeredUsersData 
        ? JSON.parse(registeredUsersData) 
        : {};

      // Vérifier si l'email existe déjà
      if (registeredUsers[data.email.toLowerCase()]) {
        console.warn('[Auth] Register duplicate email', data.email);
        return false; // Email déjà utilisé
      }

      // Créer le nouvel utilisateur
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        permissions: getPermissionsForRole(data.role)
      };

      // Sauvegarder l'utilisateur
      registeredUsers[data.email.toLowerCase()] = {
        user: newUser,
        password: data.password
      };

      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      // Vérification lecture immédiate
      const verify = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const parsed = verify ? JSON.parse(verify) : {};
      const exists = !!parsed[data.email.toLowerCase()];
      console.log('[Auth] Register write verification for', data.email, '=>', exists ? 'OK' : 'FAILED');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Supprimer l'utilisateur du state immédiatement
      setUser(null);
      
      // Supprimer les données de stockage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, s'assurer que l'utilisateur est déconnecté
      setUser(null);
    }
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] || false;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      if (!user) return { ok: false, reason: 'not_authenticated' };
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: Record<string, { user: User; password: string }> = registeredUsersData
        ? JSON.parse(registeredUsersData)
        : {};
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
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: Record<string, { user: User; password: string }> = registeredUsersData
        ? JSON.parse(registeredUsersData)
        : {};
      const record = registeredUsers[normalized];
      if (!record) return { ok: false, reason: 'user_not_found' };
      if (newPassword.length < 6) return { ok: false, reason: 'weak_password' };
      registeredUsers[normalized].password = newPassword;
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      return { ok: true };
    } catch (e) {
      console.error('Erreur réinitialisation de mot de passe:', e);
      return { ok: false, reason: 'unknown' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      hasPermission,
      changePassword,
      resetPassword
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