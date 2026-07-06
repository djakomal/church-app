import { usersApi } from '@/api/users';

export type UserRole = 'admin' | 'editor' | 'leader' | 'viewer' | 'musician' | 'singer';

export interface Permissions {
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canValidateCults: boolean;
  canAssignMusicians: boolean;
  canSendGlobalNotifications: boolean;
  canSendTargetedNotifications: boolean;
  canDeleteComments: boolean;
  canManageAllCults: boolean;
  canCreateCults: boolean;
  canEditCults: boolean;
  canSubmitCults: boolean;
  canManageSongs: boolean;
  canViewCults: boolean;
  canCreateLeaderCults: boolean;
  canEditLeaderCults: boolean;
  canSubmitLeaderCults: boolean;
  canSelectSongs: boolean;
  canViewMusicians: boolean;
  canViewProfile: boolean;
  canViewAssignedCults: boolean;
  canViewNotifications: boolean;
  canCommentOnNotifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permissions;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  department?: string;
  position?: string;
  assignedCults?: string[];
  musicianType?: 'musician' | 'singer' | 'instrumentalist';
}

class UserManagementDatabase {
  async init(): Promise<void> {
    return;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await usersApi.getAll() as any;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await usersApi.getById(id) as any;
    } catch (error) {
      return null;
    }
  }

  async createUser(
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<string> {
    try {
      const created = await usersApi.create(userData as any);
      return created.id;
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    try {
      await usersApi.update(id, userData as any);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await usersApi.delete(id);
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    }
  }

  async updatePermissions(id: string, permissions: Partial<Permissions>): Promise<void> {
    try {
      await usersApi.updatePermissions(id, permissions as Record<string, boolean>);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      throw error;
    }
  }

  async getRegisteredUsers(): Promise<Record<string, { user: User; password: string }>> {
    try {
      const users = await usersApi.getAll();
      const result: Record<string, { user: User; password: string }> = {};
      for (const u of users as any) {
        result[u.email] = { user: u, password: '' };
      }
      return result;
    } catch {
      return {};
    }
  }

  async updateRegisteredUsers(
    _users: Record<string, { user: User; password: string }>
  ): Promise<void> {
    return;
  }
}

export const simpleUserManagement = new UserManagementDatabase();

export function getUserManagementActions() {
  return {
    getAllUsers: () => simpleUserManagement.getAllUsers(),
    getUserById: (id: string) => simpleUserManagement.getUserById(id),
    createUser: (data: any) => simpleUserManagement.createUser(data),
    updateUser: (id: string, data: any) => simpleUserManagement.updateUser(id, data),
    deleteUser: (id: string) => simpleUserManagement.deleteUser(id),
    updatePermissions: (id: string, perms: any) => simpleUserManagement.updatePermissions(id, perms),
  };
}
