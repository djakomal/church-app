import AsyncStorage from '@react-native-async-storage/async-storage';

// User Types and Roles
export type UserRole = 'admin' | 'editor' | 'leader' | 'viewer' | 'musician' | 'singer';

export interface Permissions {
  // Admin permissions
  canManageUsers: boolean; // create, edit, delete users
  canAssignRoles: boolean; // assign/remove roles
  canValidateCults: boolean; // validate/reject cults
  canAssignMusicians: boolean; // assign musicians to cults
  canSendGlobalNotifications: boolean; // global notifications
  canSendTargetedNotifications: boolean; // targeted notifications
  canDeleteComments: boolean; // delete notification comments
  canManageAllCults: boolean; // manage all cults
  
  // Editor permissions
  canCreateCults: boolean; // create new cults
  canEditCults: boolean; // edit existing cults
  canSubmitCults: boolean; // submit cults for approval
  canManageSongs: boolean; // manage worship songs
  canViewCults: boolean; // view all cults
  
  // Leader permissions
  canCreateLeaderCults: boolean; // create cults when given editor role
  canEditLeaderCults: boolean; // edit cults when given editor role
  canSubmitLeaderCults: boolean; // submit cults when given editor role
  canSelectSongs: boolean; // select songs for cults
  canViewMusicians: boolean; // view musician assignments
  
  // View permissions
  canViewProfile: boolean; // view own profile
  canViewAssignedCults: boolean; // view cults assigned to them
  canViewNotifications: boolean; // view notifications
  canCommentOnNotifications: boolean; // comment on notifications
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
  assignedCults?: string[]; // cults they're assigned to
  musicianType?: 'musician' | 'singer' | 'instrumentalist'; // for musicians
}

// Cult/Worship Types
export interface Worship {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  theme?: string;
  preacher?: string;
  description?: string;
  selectedSongs: string[]; // song IDs
  assignedMusicians: string[]; // user IDs
  status: 'draft' | 'pending' | 'validated' | 'published' | 'rejected';
  rejectionReason?: string;
  createdBy: string; // user ID
  created_at: string;
  updated_at: string;
  scheduledPublishDate?: string;
}

// Musician types
export interface Musician {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'musician' | 'singer' | 'instrumentalist';
  voiceType?: string;
  instruments?: string[];
  availability?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  assignedCults?: string[]; // cults they're assigned to
}

// Song types
export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  category: string;
  notes: string;
  lyrics: string;
  created_at?: string;
  updated_at?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning';
  targetAudience: 'all' | 'musicians' | 'leaders' | 'active_members' | 'assigned';
  isScheduled: boolean;
  scheduledDate?: string;
  sent_at: string;
  read: boolean;
  created_at?: string;
  updated_at?: string;
  comments?: Comment[];
}

// Comment Types
export interface Comment {
  id: string;
  notificationId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  canDelete?: boolean; // determined by permissions
}

// User Management Database Class
class UserManagementDatabase {
  private readonly USERS_KEY = 'church_app_users';
  private readonly REGISTERED_USERS_KEY = 'church_app_registered_users';
  private readonly ADMIN_CREATED_KEY = 'church_app_admin_created';

  async init(): Promise<void> {
    try {
      await this.insertInitialData();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la gestion des utilisateurs:', error);
      throw error;
    }
  }

  private async insertInitialData(): Promise<void> {
    const registeredUsers = await this.getRegisteredUsers();
    const adminEmail = 'admin@church.com';
    
    if (!registeredUsers[adminEmail]) {
      const adminUser: User = {
        id: 'admin-001',
        name: 'Administrateur',
        email: adminEmail,
        role: 'admin',
        permissions: this.getPermissionsForRole('admin'),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      registeredUsers[adminEmail] = {
        user: adminUser,
        password: 'admin123'
      };
      
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      await AsyncStorage.setItem('admin_exists', 'true');
      console.log('✅ Compte administrateur par défaut créé automatiquement');
    }
  }

  private getPermissionsForRole(role: UserRole): Permissions {
    switch (role) {
      case 'admin':
        return {
          canManageUsers: true,
          canAssignRoles: true,
          canValidateCults: true,
          canAssignMusicians: true,
          canSendGlobalNotifications: true,
          canSendTargetedNotifications: true,
          canDeleteComments: true,
          canManageAllCults: true,
          canCreateCults: true,
          canEditCults: true,
          canSubmitCults: true,
          canManageSongs: true,
          canViewCults: true,
          canCreateLeaderCults: true,
          canEditLeaderCults: true,
          canSubmitLeaderCults: true,
          canSelectSongs: true,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
      case 'editor':
        return {
          canManageUsers: false,
          canAssignRoles: false,
          canValidateCults: false,
          canAssignMusicians: false,
          canSendGlobalNotifications: false,
          canSendTargetedNotifications: false,
          canDeleteComments: false,
          canManageAllCults: false,
          canCreateCults: false,
          canEditCults: false,
          canSubmitCults: false,
          canManageSongs: false,
          canViewCults: true,
          canCreateLeaderCults: false,
          canEditLeaderCults: false,
          canSubmitLeaderCults: false,
          canSelectSongs: false,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
      case 'leader':
        return {
          canManageUsers: false,
          canAssignRoles: false,
          canValidateCults: false,
          canAssignMusicians: false,
          canSendGlobalNotifications: false,
          canSendTargetedNotifications: false,
          canDeleteComments: false,
          canManageAllCults: false,
          canCreateCults: false,
          canEditCults: false,
          canSubmitCults: true,
          canManageSongs: false,
          canViewCults: true,
          canCreateLeaderCults: false,
          canEditLeaderCults: false,
          canSubmitLeaderCults: true,
          canSelectSongs: true,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
      case 'viewer':
        return {
          canManageUsers: false,
          canAssignRoles: false,
          canValidateCults: false,
          canAssignMusicians: false,
          canSendGlobalNotifications: false,
          canSendTargetedNotifications: false,
          canDeleteComments: false,
          canManageAllCults: false,
          canCreateCults: false,
          canEditCults: false,
          canSubmitCults: false,
          canManageSongs: false,
          canViewCults: true,
          canCreateLeaderCults: false,
          canEditLeaderCults: false,
          canSubmitLeaderCults: false,
          canSelectSongs: false,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
      case 'musician':
      case 'singer':
        return {
          canManageUsers: false,
          canAssignRoles: false,
          canValidateCults: false,
          canAssignMusicians: false,
          canSendGlobalNotifications: false,
          canSendTargetedNotifications: false,
          canDeleteComments: false,
          canManageAllCults: false,
          canCreateCults: false,
          canEditCults: false,
          canSubmitCults: false,
          canManageSongs: false,
          canViewCults: true,
          canCreateLeaderCults: false,
          canEditLeaderCults: false,
          canSubmitLeaderCults: false,
          canSelectSongs: false,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
      default:
        return {
          canManageUsers: false,
          canAssignRoles: false,
          canValidateCults: false,
          canAssignMusicians: false,
          canSendGlobalNotifications: false,
          canSendTargetedNotifications: false,
          canDeleteComments: false,
          canManageAllCults: false,
          canCreateCults: false,
          canEditCults: false,
          canSubmitCults: false,
          canManageSongs: false,
          canViewCults: true,
          canCreateLeaderCults: false,
          canEditLeaderCults: false,
          canSubmitLeaderCults: false,
          canSelectSongs: false,
          canViewMusicians: true,
          canViewProfile: true,
          canViewAssignedCults: true,
          canViewNotifications: true,
          canCommentOnNotifications: true,
        };
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      return Object.values(registeredUsers).map(ru => ru.user);
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      const user = Object.values(registeredUsers).find(ru => ru.user.id === id)?.user;
      return user || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par ID:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }): Promise<string> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      const newId = `user-${Date.now()}`;
      const normalizedEmail = userData.email.toLowerCase();
      
      if (registeredUsers[normalizedEmail]) {
        throw new Error('Email déjà utilisé');
      }
      
      const newUser: User = {
        ...userData,
        id: newId,
        email: normalizedEmail,
        permissions: userData.permissions || this.getPermissionsForRole(userData.role || 'viewer'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      registeredUsers[normalizedEmail] = {
        user: newUser,
        password: userData.password || ''
      };
      
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      return newId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      const userEntry = Object.entries(registeredUsers).find(([_, entry]) => entry.user.id === id);
      
      if (!userEntry) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const email = userEntry[0];
      const updatedUser: User = {
        ...userEntry[1].user,
        ...userData,
        email: userData.email ? userData.email.toLowerCase() : userEntry[1].user.email,
        updated_at: new Date().toISOString(),
      };
      
      registeredUsers[email] = {
        user: updatedUser,
        password: userEntry[1].password
      };
      
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      const emailToDelete = Object.entries(registeredUsers).find(([_, entry]) => entry.user.id === id);
      
      if (!emailToDelete) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (emailToDelete[0] === 'admin@church.com') {
        throw new Error('Impossible de supprimer l\'administrateur principal');
      }
      
      delete registeredUsers[emailToDelete[0]];
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  async updatePermissions(id: string, permissions: Partial<Permissions>): Promise<void> {
    try {
      const registeredUsers = await this.getRegisteredUsers();
      const userEntry = Object.entries(registeredUsers).find(([_, entry]) => entry.user.id === id);
      
      if (!userEntry) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const email = userEntry[0];
      const updatedUser: User = {
        ...userEntry[1].user,
        permissions: {
          ...userEntry[1].user.permissions,
          ...permissions,
        },
        updated_at: new Date().toISOString(),
      };
      
      registeredUsers[email] = {
        user: updatedUser,
        password: userEntry[1].password
      };
      
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      throw error;
    }
  }

  async getRegisteredUsers(): Promise<Record<string, { user: User; password: string }>> {
    try {
      const registeredUsersData = await AsyncStorage.getItem(this.REGISTERED_USERS_KEY);
      return registeredUsersData ? JSON.parse(registeredUsersData) : {};
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs enregistrés:', error);
      return {};
    }
  }

  async updateRegisteredUsers(users: Record<string, { user: User; password: string }>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des utilisateurs enregistrés:', error);
      throw error;
    }
  }
}

const userManagementDatabase = new UserManagementDatabase();

export const simpleUserManagement = userManagementDatabase;

export const getUserManagementActions = (): {
  getAllUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | null>;
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updatePermissions: (id: string, permissions: Partial<Permissions>) => Promise<void>;
  getRegisteredUsers: () => Promise<Record<string, { user: User; password: string }>>;
  updateRegisteredUsers: (users: Record<string, { user: User; password: string }>) => Promise<void>;
} => ({
  getAllUsers: () => userManagementDatabase.getAllUsers(),
  getUserById: (id: string) => userManagementDatabase.getUserById(id),
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => userManagementDatabase.createUser(userData),
  updateUser: (id: string, userData: Partial<User>) => userManagementDatabase.updateUser(id, userData),
  deleteUser: (id: string) => userManagementDatabase.deleteUser(id),
  updatePermissions: (id: string, permissions: Partial<Permissions>) => userManagementDatabase.updatePermissions(id, permissions),
  getRegisteredUsers: () => userManagementDatabase.getRegisteredUsers(),
  updateRegisteredUsers: (users: Record<string, { user: User; password: string }>) => userManagementDatabase.updateRegisteredUsers(users),
});

