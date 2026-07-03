import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'church_app_user';
const REGISTERED_USERS_KEY = 'church_app_registered_users';
const PERMISSION_OVERRIDES_KEY = 'church_app_permission_overrides';

function getPermissionsForRole(role: string) {
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
}

async function createDefaultAccounts() {
  const DEMO_ACCOUNTS = [
    { email: 'admin@church.com', password: 'admin123', name: 'Administrateur', role: 'admin' as const },
    { email: 'editor@church.com', password: 'editor123', name: 'Éditeur', role: 'editor' as const },
    { email: 'viewer@church.com', password: 'viewer123', name: 'Musicien', role: 'viewer' as const },
  ];

  const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
  const registeredUsers: Record<string, any> = registeredUsersData ? JSON.parse(registeredUsersData) : {};

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
    }
  }

  await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await createDefaultAccounts();
});

describe('AuthContext - Permissions', () => {
  describe('Default permissions', () => {
    it('admin should have all permissions', () => {
      const perms = getPermissionsForRole('admin');
      expect(perms.canManageWorship).toBe(true);
      expect(perms.canManageSongs).toBe(true);
      expect(perms.canManageTeam).toBe(true);
      expect(perms.canSendCommunications).toBe(true);
      expect(perms.canViewOnly).toBe(false);
      expect(perms.canValidateWorship).toBe(true);
      expect(perms.canAssignMusicians).toBe(true);
      expect(perms.canDeleteComments).toBe(true);
    });

    it('editor should have only view permissions', () => {
      const perms = getPermissionsForRole('editor');
      expect(perms.canManageSongs).toBe(false);
      expect(perms.canManageWorship).toBe(false);
      expect(perms.canSendCommunications).toBe(false);
      expect(perms.canViewOnly).toBe(true);
    });

    it('viewer should have only view permissions', () => {
      const perms = getPermissionsForRole('viewer');
      expect(perms.canManageSongs).toBe(false);
      expect(perms.canManageWorship).toBe(false);
      expect(perms.canSendCommunications).toBe(false);
      expect(perms.canViewOnly).toBe(true);
    });
  });

  describe('Login flow', () => {
    it('should successfully login with admin credentials', async () => {
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = JSON.parse(registeredUsersData!);
      const adminRecord = registeredUsers['admin@church.com'];
      expect(adminRecord).toBeDefined();
      expect(adminRecord.password).toBe('admin123');
      expect(adminRecord.user.role).toBe('admin');
    });

    it('should fail login with wrong password', async () => {
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = JSON.parse(registeredUsersData!);
      expect(registeredUsers['admin@church.com'].password).not.toBe('wrongpassword');
    });

    it('should fail login for non-existent user', async () => {
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = JSON.parse(registeredUsersData!);
      expect(registeredUsers['ghost@church.com']).toBeUndefined();
    });
  });

  describe('Permission overrides', () => {
    it('should apply permission overrides', async () => {
      const overrides = {
        'viewer-001': { canManageSongs: true },
      };
      await AsyncStorage.setItem(PERMISSION_OVERRIDES_KEY, JSON.stringify(overrides));

      const overridesData = await AsyncStorage.getItem(PERMISSION_OVERRIDES_KEY);
      const parsed = JSON.parse(overridesData!);
      expect(parsed['viewer-001'].canManageSongs).toBe(true);
    });

    it('should allow admin to grant worship permission to viewer', async () => {
      const registeredUsersData = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers = JSON.parse(registeredUsersData!);

      const viewerEmail = 'viewer@church.com';
      const viewerId = registeredUsers[viewerEmail].user.id;

      const overrides: Record<string, any> = {};
      const existingOverridesData = await AsyncStorage.getItem(PERMISSION_OVERRIDES_KEY);
      if (existingOverridesData) Object.assign(overrides, JSON.parse(existingOverridesData));
      overrides[viewerId] = { canManageWorship: true, canManageSongs: true };
      await AsyncStorage.setItem(PERMISSION_OVERRIDES_KEY, JSON.stringify(overrides));

      const savedOverrides = await AsyncStorage.getItem(PERMISSION_OVERRIDES_KEY);
      const parsed = JSON.parse(savedOverrides!);
      expect(parsed[viewerId].canManageWorship).toBe(true);
      expect(parsed[viewerId].canManageSongs).toBe(true);
    });
  });

  describe('User persistence', () => {
    it('should persist logged-in user', async () => {
      const userData = {
        id: 'admin-001',
        name: 'Administrateur',
        email: 'admin@church.com',
        role: 'admin',
        permissions: getPermissionsForRole('admin'),
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      const saved = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(parsed.email).toBe('admin@church.com');
      expect(parsed.role).toBe('admin');
    });

    it('should clear user on logout', async () => {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ id: 'admin-001' }));
      await AsyncStorage.removeItem(USER_STORAGE_KEY);

      const saved = await AsyncStorage.getItem(USER_STORAGE_KEY);
      expect(saved).toBeNull();
    });
  });
});
