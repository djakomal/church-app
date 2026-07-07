import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';
import { simpleUserManagement } from '@/database/userManagement';
import { rolesApi, Role as ApiRole } from '@/api/roles';
import { permissionsApi, Permission as ApiPermission } from '@/api/permissions';
import { usersApi } from '@/api/users';

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
  loadUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  openUserModal: () => void;
  closeUserModal: () => void;
  loadRoles: () => Promise<void>;
  createRole: (roleData: Omit<Role, 'id'>) => Promise<void>;
  updateRole: (id: string, roleData: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignRoleToUser: (userId: string, roleId: string) => Promise<void>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>;
  openRoleModal: () => void;
  closeRoleModal: () => void;
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
  openPermissionModal: () => void;
  closePermissionModal: () => void;
  setFilterRole: (role: UserRole | 'all') => void;
  setFilterStatus: (status: User['status'] | 'all') => void;
  setSearchQuery: (query: string) => void;
  refreshData: () => Promise<void>;
  getUserById: (id: string) => User | null;
  getRoleById: (id: string) => Role | null;
  canUserPerformAction: (userId: string, permissionId: string) => boolean;
  filteredUsers: User[];
}

export function useUserManagement(): UserManagementState & UserManagementActions {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    roles: [],
    permissions: [],
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

  const loadRoles = useCallback(async () => {
    try {
      const apiRoles = await rolesApi.getAll();
      const roles: Role[] = apiRoles.map(r => ({
        id: r.id,
        name: r.name,
        level: r.level,
        description: r.description,
        permissions: r.permissions,
      }));
      setState(prev => ({ ...prev, roles }));
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const apiPerms = await permissionsApi.getAll();
      const permissions: Permission[] = apiPerms.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category as Permission['category'],
        resource: p.id.split('-')[1] || 'general',
        action: p.id.split('-')[2] as Permission['action'] || 'read',
      }));
      setState(prev => ({ ...prev, permissions }));
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await Promise.all([loadUsers(), loadRoles(), loadPermissions()]);
      setState(prev => ({ ...prev, isUserModalOpen: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des données'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadUsers, loadRoles, loadPermissions]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (state.isLoading) throw new Error('Une operation est déjà en cours');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const normalizedEmail = userData.email.toLowerCase();
      await simpleUserManagement.createUser({
        ...userData,
        email: normalizedEmail,
      } as any);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, loadUsers]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await simpleUserManagement.updateUser(id, userData as any);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const userToDelete = state.users.find(u => u.id === id);
      if (!userToDelete) throw new Error('Utilisateur non trouvé');
      if (userToDelete.email === 'admin@church.com') throw new Error('Impossible de supprimer l\'administrateur principal');
      await simpleUserManagement.deleteUser(id);
      await loadUsers();
      if (state.selectedUser?.id === id) setState(prev => ({ ...prev, selectedUser: null }));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer l\'utilisateur');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, loadUsers, state.selectedUser]);

  const createRole = useCallback(async (roleData: Omit<Role, 'id'>) => {
    try {
      if (state.isLoading) throw new Error('Une operation est déjà en cours');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await rolesApi.create(roleData);
      await loadRoles();
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, loadRoles]);

  const updateRole = useCallback(async (id: string, roleData: Partial<Role>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await rolesApi.update(id, roleData);
      await loadRoles();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadRoles]);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await rolesApi.delete(id);
      await loadRoles();
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadRoles]);

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const role = state.roles.find(r => r.id === roleId);
      if (!role) throw new Error('Rôle non trouvé');
      const currentUser = state.users.find(u => u.id === userId);
      if (!currentUser) throw new Error('Utilisateur non trouvé');
      const mergedPerms = { ...currentUser.permissions.reduce((acc, p) => ({ ...acc, [p.id]: true }), {}) };
      role.permissions.forEach(pid => { mergedPerms[pid] = true; });
      const allPerms = Object.keys(mergedPerms).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>);
      await usersApi.updatePermissions(userId, allPerms);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'affectation du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d\'attribuer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, state.roles, loadUsers]);

  const removeRoleFromUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const role = state.roles.find(r => r.id === roleId);
      if (!role) throw new Error('Rôle non trouvé');
      const currentUser = state.users.find(u => u.id === userId);
      if (!currentUser) throw new Error('Utilisateur non trouvé');
      const permSet = new Set(role.permissions);
      const remainingPerms = currentUser.permissions.filter(p => !permSet.has(p.id));
      const allPerms = remainingPerms.reduce((acc, p) => ({ ...acc, [p.id]: true }), {} as Record<string, boolean>);
      await usersApi.updatePermissions(userId, allPerms);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de retirer le rôle');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.users, state.roles, loadUsers]);

  const assignPermissionToRole = useCallback(async (roleId: string, permissionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const role = state.roles.find(r => r.id === roleId);
      if (!role) throw new Error('Rôle non trouvé');
      const newPerms = [...new Set([...role.permissions, permissionId])];
      await rolesApi.update(roleId, { permissions: newPerms });
      await loadRoles();
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la permission:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d\'attribuer la permission');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.roles, loadRoles]);

  const removePermissionFromRole = useCallback(async (roleId: string, permissionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const role = state.roles.find(r => r.id === roleId);
      if (!role) throw new Error('Rôle non trouvé');
      const newPerms = role.permissions.filter(id => id !== permissionId);
      await rolesApi.update(roleId, { permissions: newPerms });
      await loadRoles();
    } catch (error) {
      console.error('Erreur lors de la suppression de la permission:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de supprimer la permission');
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.roles, loadRoles]);

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
