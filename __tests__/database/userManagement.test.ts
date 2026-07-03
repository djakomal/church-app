import AsyncStorage from '@react-native-async-storage/async-storage';
import { simpleUserManagement, UserRole, User } from '../../database/userManagement';

beforeEach(async () => {
  await AsyncStorage.clear();
  await simpleUserManagement.init();
});

describe('UserManagement', () => {
  describe('Initial data', () => {
    it('should create admin account on init', async () => {
      const users = await simpleUserManagement.getAllUsers();
      const admin = users.find(u => u.email === 'admin@church.com');
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('admin');
    });

    it('should not duplicate admin on second init', async () => {
      await simpleUserManagement.init();
      const users = await simpleUserManagement.getAllUsers();
      const admins = users.filter(u => u.email === 'admin@church.com');
      expect(admins.length).toBe(1);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new user', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Test User',
        email: 'test@church.com',
        role: 'viewer',
        status: 'active',
      });
      expect(id).toBeTruthy();
      const user = await simpleUserManagement.getUserById(id);
      expect(user?.name).toBe('Test User');
      expect(user?.role).toBe('viewer');
    });

    it('should not create a user with duplicate email', async () => {
      await simpleUserManagement.createUser({
        name: 'First', email: 'dup@church.com',
        role: 'viewer', status: 'active',
      });
      await expect(
        simpleUserManagement.createUser({
          name: 'Second', email: 'dup@church.com',
          role: 'viewer', status: 'active',
        })
      ).rejects.toThrow('Email déjà utilisé');
    });

    it('should update an existing user', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Original', email: 'update@church.com',
        role: 'viewer', status: 'active',
      });
      await simpleUserManagement.updateUser(id, { name: 'Updated', role: 'editor' });
      const user = await simpleUserManagement.getUserById(id);
      expect(user?.name).toBe('Updated');
      expect(user?.role).toBe('editor');
    });

    it('should delete a non-admin user', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Delete Me', email: 'delete@church.com',
        role: 'viewer', status: 'active',
      });
      await simpleUserManagement.deleteUser(id);
      const user = await simpleUserManagement.getUserById(id);
      expect(user).toBeNull();
    });

    it('should not delete the main admin', async () => {
      await expect(
        simpleUserManagement.deleteUser('admin-001')
      ).rejects.toThrow('Impossible de supprimer l\'administrateur principal');
    });
  });

  describe('Permissions', () => {
    it('should return full permissions for admin', async () => {
      const admin = await simpleUserManagement.getUserById('admin-001');
      expect(admin?.permissions.canManageUsers).toBe(true);
      expect(admin?.permissions.canManageAllCults).toBe(true);
      expect(admin?.permissions.canSendGlobalNotifications).toBe(true);
    });

    it('should return minimal permissions for viewer', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Viewer', email: 'viewer@church.com',
        role: 'viewer', status: 'active',
      });
      const user = await simpleUserManagement.getUserById(id);
      expect(user?.permissions.canManageUsers).toBe(false);
      expect(user?.permissions.canCreateCults).toBe(false);
      expect(user?.permissions.canManageSongs).toBe(false);
      expect(user?.permissions.canViewCults).toBe(true);
      expect(user?.permissions.canViewNotifications).toBe(true);
      expect(user?.permissions.canCommentOnNotifications).toBe(true);
    });

    it('should return minimal permissions for editor (same as viewer by default)', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Editor', email: 'editor@church.com',
        role: 'editor', status: 'active',
      });
      const user = await simpleUserManagement.getUserById(id);
      expect(user?.permissions.canManageSongs).toBe(false);
      expect(user?.permissions.canCreateCults).toBe(false);
      expect(user?.permissions.canSendGlobalNotifications).toBe(false);
      expect(user?.permissions.canViewCults).toBe(true);
      expect(user?.permissions.canCommentOnNotifications).toBe(true);
    });

    it('should update individual permissions', async () => {
      const id = await simpleUserManagement.createUser({
        name: 'Perm Test', email: 'perm@church.com',
        role: 'viewer', status: 'active',
      });
      await simpleUserManagement.updatePermissions(id, { canManageSongs: true, canCreateCults: true });
      const user = await simpleUserManagement.getUserById(id);
      expect(user?.permissions.canManageSongs).toBe(true);
      expect(user?.permissions.canCreateCults).toBe(true);
      expect(user?.permissions.canViewCults).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for non-existent user query', async () => {
      const user = await simpleUserManagement.getUserById('non-existent');
      expect(user).toBeNull();
    });

    it('should throw when deleting non-existent user', async () => {
      await expect(
        simpleUserManagement.deleteUser('non-existent')
      ).rejects.toThrow('Utilisateur non trouvé');
    });

    it('should persist data across init calls', async () => {
      await simpleUserManagement.createUser({
        name: 'Persist Test', email: 'persist@church.com',
        role: 'editor', status: 'active',
      });
      await simpleUserManagement.init();
      const users = await simpleUserManagement.getAllUsers();
      expect(users.find(u => u.email === 'persist@church.com')).toBeDefined();
    });
  });
});
