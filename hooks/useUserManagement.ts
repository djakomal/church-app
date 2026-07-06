import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';
import { simpleUserManagement } from '@/database/userManagement';


// Types
export interface Role {
  id: string;
  name: string;
  level: number;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: string[];
  permissions: Permission[];
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  department?: string;
  position?: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer' | 'leader' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'communications' | 'team' | 'worship' | 'system';
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'assign' | 'configure';
}

export interface UserManagementState {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  isUserModalOpen: boolean;
  isRoleModalOpen: boolean;
  isPermissionModalOpen: boolean;
  filterRole: UserRole | 'all';
  filterStatus: User['status'] | 'all';
  searchQuery: string;
}

export interface UserManagementActions {
  // User actions
  loadUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  openUserModal: () => void;
  closeUserModal: () => void;

  // Role actions
  loadRoles: () => Promise<void>;
  createRole: (roleData: Omit<Role, 'id'>) => Promise<void>;
  updateRole: (id: string, roleData: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignRoleToUser: (userId: string, roleId: string) => Promise<void>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>;
  openRoleModal: () => void;
  closeRoleModal: () => void;

  // Permission actions
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
  openPermissionModal: () => void;
  closePermissionModal: () => void;

  // Filters and search
  setFilterRole: (role: UserRole | 'all') => void;
  setFilterStatus: (status: User['status'] | 'all') => void;
  setSearchQuery: (query: string) => void;
  refreshData: () => Promise<void>;

  // Utilities
  getUserById: (id: string) => User | null;
  getRoleById: (id: string) => Role | null;
  canUserPerformAction: (userId: string, permissionId: string) => boolean;
  filteredUsers: User[];
}

// Default Roles
const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-admin-001',
    name: 'Administrateur',
    level: 5,
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: [
      'user:create', 'user:read', 'user:update', 'user:delete', 'user:manage',
      'role:create', 'role:read', 'role:update', 'role:delete', 'role:manage',
      'permission:read',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:manage',
      'communication:create', 'communication:read', 'communication:update', 'communication:delete',
      'team:create', 'team:read', 'team:update', 'team:delete', 'team:manage',
      'worship:create', 'worship:read', 'worship:update', 'worship:delete', 'worship:manage',
      'system:configure'
    ]
  },
  {
    id: 'role-editor-002',
    name: 'Éditeur de contenu',
    level: 4,
    description: 'Gère le contenu et peut modifier les publications',
    permissions: [
      'content:create', 'content:read', 'content:update', 'content:delete',
      'communication:create', 'communication:read', 'communication:update',
      'team:read',
      'worship:create', 'worship:read', 'worship:update',
      'user:read'
    ]
  },
  {
    id: 'role-leader-003',
    name: 'Responsable d\'équipe',
    level: 3,
    description: 'Gère les membres d\'équipe et supervise les activités',
    permissions: [
      'team:create', 'team:read', 'team:update',
      'worship:read',
      'communication:create', 'communication:read', 'communication:update',
      'user:read'
    ]
  },
  {
    id: 'role-viewer-004',
    name: 'Visualiseur',
    level: 2,
    description: 'Peut uniquement consulter les contenus disponibles',
    permissions: [
      'content:read',
      'communication:read',
      'worship:read',
      'user:read'
    ]
  },
  {
    id: 'role-guest-005',
    name: 'Invité',
    level: 1,
    description: 'Accès limité aux fonctionnalités de base',
    permissions: [
      'content:read',
      'worship:read',
      'user:read'
    ]
  }
];

// Default Permissions
const DEFAULT_PERMISSIONS: Permission[] = [
  // User Management Permissions
  { id: 'permission-user-create', name: 'Créer un utilisateur', description: 'Peut créer de nouveaux comptes utilisateur', category: 'users', resource: 'user', action: 'create' },
  { id: 'permission-user-read', name: 'Lire les utilisateurs', description: 'Peut consulter les informations des utilisateurs', category: 'users', resource: 'user', action: 'read' },
  { id: 'permission-user-update', name: 'Mettre à jour un utilisateur', description: 'Peut modifier les informations des utilisateurs', category: 'users', resource: 'user', action: 'update' },
  { id: 'permission-user-delete', name: 'Supprimer un utilisateur', description: 'Peut supprimer des comptes utilisateur', category: 'users', resource: 'user', action: 'delete' },
  { id: 'permission-user-manage', name: 'Gérer les utilisateurs', description: 'Accès complet à la gestion des utilisateurs', category: 'users', resource: 'user', action: 'manage' },

  // Role Management Permissions
  { id: 'permission-role-create', name: 'Créer un rôle', description: 'Peut créer de nouveaux rôles', category: 'system', resource: 'role', action: 'create' },
  { id: 'permission-role-read', name: 'Lire les rôles', description: 'Peut consulter les informations des rôles', category: 'system', resource: 'role', action: 'read' },
  { id: 'permission-role-update', name: 'Mettre à jour un rôle', description: 'Peut modifier les informations des rôles', category: 'system', resource: 'role', action: 'update' },
  { id: 'permission-role-delete', name: 'Supprimer un rôle', description: 'Peut supprimer des rôles', category: 'system', resource: 'role', action: 'delete' },
  { id: 'permission-role-manage', name: 'Gérer les rôles', description: 'Accès complet à la gestion des rôles', category: 'system', resource: 'role', action: 'manage' },

  // Content Management Permissions
  { id: 'permission-content-create', name: 'Créer du contenu', description: 'Peut ajouter du nouveau contenu', category: 'content', resource: 'content', action: 'create' },
  { id: 'permission-content-read', name: 'Lire le contenu', description: 'Peut consulter le contenu existant', category: 'content', resource: 'content', action: 'read' },
  { id: 'permission-content-update', name: 'Mettre à jour le contenu', description: 'Peut modifier le contenu existant', category: 'content', resource: 'content', action: 'update' },
  { id: 'permission-content-delete', name: 'Supprimer le contenu', description: 'Peut supprimer du contenu', category: 'content', resource: 'content', action: 'delete' },
  { id: 'permission-content-manage', name: 'Gérer le contenu', description: 'Accès complet à la gestion du contenu', category: 'content', resource: 'content', action: 'manage' },

  // Communication Management Permissions
  { id: 'permission-communication-create', name: 'Créer des communications', description: 'Peut ajouter des notifications et communications', category: 'communications', resource: 'communication', action: 'create' },
  { id: 'permission-communication-read', name: 'Lire les communications', description: 'Peut consulter les communications', category: 'communications', resource: 'communication', action: 'read' },
  { id: 'permission-communication-update', name: 'Mettre à jour les communications', description: 'Peut modifier les communications existantes', category: 'communications', resource: 'communication', action: 'update' },
  { id: 'permission-communication-delete', name: 'Supprimer les communications', description: 'Peut supprimer des communications', category: 'communications', resource: 'communication', action: 'delete' },

  // Team Management Permissions
  { id: 'permission-team-create', name: 'Créer une équipe', description: 'Peut ajouter de nouveaux membres d\'équipe', category: 'team', resource: 'team', action: 'create' },
  { id: 'permission-team-read', name: 'Lire l\'équipe', description: 'Peut consulter les informations de l\'équipe', category: 'team', resource: 'team', action: 'read' },
  { id: 'permission-team-update', name: 'Mettre à jour l\'équipe', description: 'Peut modifier les informations de l\'équipe', category: 'team', resource: 'team', action: 'update' },
  { id: 'permission-team-delete', name: 'Supprimer un membre', description: 'Peut supprimer des membres d\'équipe', category: 'team', resource: 'team', action: 'delete' },
  { id: 'permission-team-manage', name: 'Gérer l\'équipe', description: 'Accès complet à la gestion de l\'équipe', category: 'team', resource: 'team', action: 'manage' },

  // Worship Management Permissions
  { id: 'permission-worship-create', name: 'Créer un culte', description: 'Peut planifier de nouveaux cultes', category: 'worship', resource: 'worship', action: 'create' },
  { id: 'permission-worship-read', name: 'Lire le culte', description: 'Peut consulter les programmes de culte', category: 'worship', resource: 'worship', action: 'read' },
  { id: 'permission-worship-update', name: 'Mettre à jour le culte', description: 'Peut modifier les programmes de culte', category: 'worship', resource: 'worship', action: 'update' },
  { id: 'permission-worship-delete', name: 'Supprimer un culte', description: 'Peut annuler des programmes de culte', category: 'worship', resource: 'worship', action: 'delete' },
  { id: 'permission-worship-manage', name: 'Gérer le culte', description: 'Accès complet à la gestion des cultes', category: 'worship', resource: 'worship', action: 'manage' },

  // System Configuration Permissions
  { id: 'permission-system-configure', name: 'Configurer le système', description: 'Peut modifier les paramètres du système', category: 'system', resource: 'system', action: 'configure' }
];

export function useUserManagement(): UserManagementState & UserManagementActions {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    roles: DEFAULT_ROLES,
    permissions: DEFAULT_PERMISSIONS,
    isLoading: false,
    error: null,
    selectedUser: null,
    isUserModalOpen: false,
    isRoleModalOpen: false,
    isPermissionModalOpen: false,
    filterRole: 'all',
    filterStatus: 'all',
    searchQuery: '',
  });

  const { user } = useAuth();

  const loadUsers = useCallback(async () => {
    try {
      const dbUsers = await simpleUserManagement.getAllUsers();
      const users: User[] = dbUsers.map((dbUser: any) => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as UserRole,
        roles: dbUser.roles || [dbUser.role],
        permissions: Object.entries(dbUser.permissions || {})
          .filter(([_, val]) => val)
          .map(([key]) => ({ id: key, name: key, description: '', category: 'system' as const, resource: key, action: 'manage' as const })),
        status: dbUser.status || 'active',
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        phone: dbUser.phone,
        department: dbUser.department,
        position: dbUser.position,
      }));
      setState(prev => ({ ...prev, users }));
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      throw error;
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await loadUsers();
      setState(prev => ({ ...prev, isUserModalOpen: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des données' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadUsers]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (state.isLoading) {
        throw new Error('Une operation est déjà en cours');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const normalizedEmail = userData.email.toLowerCase();
      const existingUser = state.users.find(u => u.email === normalizedEmail);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      const enrichedUserData = {
        ...userData,
        email: normalizedEmail,
        roles: [userData.role],
        permissions: state.permissions.filter(permission => {
          const role = state.roles.find(r => r.name.toLowerCase().includes(userData.role.toLowerCase()));
          return role?.permissions.includes(permission.id);
        })
      };
      
      await simpleUserManagement.createUser(enrichedUserData as any);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, state.permissions, state.roles, loadUsers]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userToUpdate = state.users.find(u => u.id === id);
      if (!userToUpdate) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedUserData: Partial<User> = {
        ...userData,
        updated_at: new Date().toISOString(),
        email: userData.email ? userData.email.toLowerCase() : userToUpdate.email,
        roles: userData.roles || userToUpdate.roles,
        permissions: userData.permissions || userToUpdate.permissions,
      };
      
      await simpleUserManagement.updateUser(id, updatedUserData as any);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, loadUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userToDelete = state.users.find(u => u.id === id);
      if (!userToDelete) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (userToDelete.email === 'admin@church.com') {
        throw new Error('Impossible de supprimer l\'administrateur principal');
      }
      
      await simpleUserManagement.deleteUser(id);
      await loadUsers();
      
      if (state.selectedUser?.id === id) {
        setState(prev => ({ ...prev, selectedUser: null }));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, loadUsers, state.selectedUser]);

  const loadRoles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const roles = DEFAULT_ROLES;
      setState(prev => ({ ...prev, roles }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const createRole = useCallback(async (roleData: Omit<Role, 'id'>) => {
    try {
      if (state.isLoading) {
        throw new Error('Une operation est déjà en cours');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const newRole: Role = {
        ...roleData,
        id: `role-${Date.now()}`,
      };
      
      setState(prev => ({
        ...prev,
        roles: [...prev.roles, newRole],
      }));
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading]);

  const updateRole = useCallback(async (id: string, roleData: Partial<Role>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(role =>
          role.id === id ? { ...role, ...roleData } : role
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (id === DEFAULT_ROLES[0].id) {
        throw new Error('Impossible de supprimer le rôle Administrateur par défaut');
      }
      
      const confirmDelete = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Confirmer la suppression',
          'Êtes-vous sûr de vouloir supprimer ce rôle ? Les utilisateurs ayant ce rôle perdront leurs permissions.',
          [
            { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
      
      if (!confirmDelete) {
        return;
      }
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.filter(role => role.id !== id),
        users: prev.users.map(user => ({
          ...user,
          roles: user.roles.filter(roleId => roleId !== id),
          permissions: user.permissions.filter(permission => !prev.roles.find(r => r.id === id)?.permissions.includes(permission.id)),
        }))
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = state.users.find(u => u.id === userId);
      const role = state.roles.find(r => r.id === roleId);
      
      if (!user || !role) {
        throw new Error('Utilisateur ou rôle non trouvé');
      }
      
      const permissionIdsToAdd = role.permissions.filter(
        permissionId => !user.permissions.some(p => p.id === permissionId)
      );
      const permissionObjectsToAdd = state.permissions.filter(p => permissionIdsToAdd.includes(p.id));
      
      const updatedUser: User = {
        ...user,
        roles: [...user.roles, roleId],
        permissions: [...user.permissions, ...permissionObjectsToAdd],
        updated_at: new Date().toISOString(),
      };
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? updatedUser : u),
        selectedUser: prev.selectedUser?.id === userId ? updatedUser : prev.selectedUser,
      }));
    } catch (error) {
      console.error('Erreur lors de l\'affectation du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d\'attribuer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, state.roles]);

  const removeRoleFromUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = state.users.find(u => u.id === userId);
      const role = state.roles.find(r => r.id === roleId);
      
      if (!user || !role) {
        throw new Error('Utilisateur ou rôle non trouvé');
      }
      
      const permissionsToRemove = role.permissions;
      
      const updatedUser: User = {
        ...user,
        roles: user.roles.filter(r => r !== roleId),
        permissions: user.permissions.filter(p => !permissionsToRemove.includes(p.id)),
        updated_at: new Date().toISOString(),
      };
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? updatedUser : u),
        selectedUser: prev.selectedUser?.id === userId ? updatedUser : prev.selectedUser,
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de retirer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const assignPermissionToRole = useCallback(async (roleId: string, permissionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(role =>
          role.id === roleId
            ? { ...role, permissions: [...role.permissions, permissionId] }
            : role
        ),
        users: prev.users.map(user => ({
          ...user,
          permissions: user.roles.some(r => r === roleId)
            ? [...user.permissions, ...state.permissions.filter(p => p.id === permissionId && !user.permissions.some(up => up.id === p.id))]
            : user.permissions,
        }))
      }));
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la permission:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d\'attribuer la permission');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, state.permissions]);

  const removePermissionFromRole = useCallback(async (roleId: string, permissionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(role =>
          role.id === roleId
            ? { ...role, permissions: role.permissions.filter(id => id !== permissionId) }
            : role
        ),
        users: prev.users.map(user => ({
          ...user,
          permissions: user.permissions.filter(p => p.id !== permissionId),
        }))
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de la permission:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer la permission');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const setFilterRole = useCallback((role: UserRole | 'all') => {
    setState(prev => ({ ...prev, filterRole: role }));
  }, []);

  const setFilterStatus = useCallback((status: User['status'] | 'all') => {
    setState(prev => ({ ...prev, filterStatus: status }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const getUserById = useCallback((id: string) => {
    return state.users.find(user => user.id === id) || null;
  }, [state.users]);

  const getRoleById = useCallback((id: string) => {
    return state.roles.find(role => role.id === id) || null;
  }, [state.roles]);

  const canUserPerformAction = useCallback((userId: string, permissionId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.permissions.some(p => p.id === permissionId) || false;
  }, [state.users]);

  const setSelectedUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, selectedUser: user }));
  }, []);

  const openUserModal = useCallback(() => {
    setState(prev => ({ ...prev, isUserModalOpen: true }));
  }, []);

  const closeUserModal = useCallback(() => {
    setState(prev => ({ ...prev, isUserModalOpen: false, selectedUser: null }));
  }, []);

  const openRoleModal = useCallback(() => {
    setState(prev => ({ ...prev, isRoleModalOpen: true }));
  }, []);

  const closeRoleModal = useCallback(() => {
    setState(prev => ({ ...prev, isRoleModalOpen: false }));
  }, []);

  const openPermissionModal = useCallback(() => {
    setState(prev => ({ ...prev, isPermissionModalOpen: true }));
  }, []);

  const closePermissionModal = useCallback(() => {
    setState(prev => ({ ...prev, isPermissionModalOpen: false }));
  }, []);

  const filteredUsers = useMemo(() => state.users.filter(user => {
    const roleMatch = state.filterRole === 'all' || user.roles.includes(state.filterRole);
    const statusMatch = state.filterStatus === 'all' || user.status === state.filterStatus;
    const searchMatch = state.searchQuery === '' || 
      user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(state.searchQuery.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  }), [state.users, state.filterRole, state.filterStatus, state.searchQuery]);

  return {
    ...state,
    filteredUsers,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    setSelectedUser,
    openUserModal,
    closeUserModal,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    openRoleModal,
    closeRoleModal,
    assignPermissionToRole,
    removePermissionFromRole,
    openPermissionModal,
    closePermissionModal,
    setFilterRole,
    setFilterStatus,
    setSearchQuery,
    refreshData,
    getUserById,
    getRoleById,
    canUserPerformAction,
  };
}