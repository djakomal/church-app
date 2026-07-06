const mockStore = {};

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => store[key] || null),
      setItem: jest.fn(async (key, value) => { store[key] = value; }),
      removeItem: jest.fn(async (key) => { delete store[key]; }),
      clear: jest.fn(async () => { Object.keys(store).forEach(k => delete store[k]); }),
    },
  };
});

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  StyleSheet: { create: (styles) => styles },
  useColorScheme: () => 'light',
}));

let mockNextId = 5;

const mockAllPermissionsFalse = {
  canManageUsers: false,
  canManageAllCults: false,
  canSendGlobalNotifications: false,
  canCreateCults: false,
  canManageSongs: false,
  canViewCults: false,
  canCommentOnNotifications: false,
  canManageWorship: false,
  canManageTeam: false,
  canSendCommunications: false,
  canViewOnly: false,
  canValidateWorship: false,
  canAssignMusicians: false,
  canDeleteComments: false,
};

jest.mock('@/api/songs', () => {
  const songs = [
    { id: 1, title: 'Combien de fois', artist: 'Exo', key: 'D', tempo: 'Medium', duration: '4:30', category: 'Louange', notes: '', lyrics: '', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, title: 'Je veux te louer', artist: 'David', key: 'G', tempo: 'Medium', duration: '3:45', category: 'Louange', notes: '', lyrics: '', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 3, title: 'Oh viens Esprit', artist: 'Adoration', key: 'A', tempo: 'Lent', duration: '5:00', category: 'Adoration', notes: '', lyrics: '', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 4, title: 'Grand est ton amour', artist: 'Équipe', key: 'C', tempo: 'Medium', duration: '4:00', category: 'Louange', notes: '', lyrics: '', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];
  return {
    songsApi: {
      getAll: jest.fn(async () => [...songs]),
      getById: jest.fn(async (id) => songs.find(s => s.id === id) || null),
      create: jest.fn(async (data) => { const id = ++mockNextId; const s = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; songs.push(s); return s; }),
      update: jest.fn(async (id, data) => { const idx = songs.findIndex(s => s.id === id); if (idx >= 0) Object.assign(songs[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = songs.findIndex(s => s.id === id); if (idx >= 0) songs.splice(idx, 1); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/team', () => {
  const members = [
    { id: 1, name: 'Jean Dupont', role: 'Pasteur', email: 'jean@church.com', phone: '0123456789', service: 'direction', status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, name: 'Marie Curie', role: 'Musicienne', email: 'marie@church.com', phone: '0123456790', service: 'musique', status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];
  return {
    teamApi: {
      getAll: jest.fn(async () => [...members]),
      getById: jest.fn(async (id) => members.find(m => m.id === id) || null),
      create: jest.fn(async (data) => { const id = ++mockNextId; const m = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; members.push(m); return m; }),
      update: jest.fn(async (id, data) => { const idx = members.findIndex(m => m.id === id); if (idx >= 0) Object.assign(members[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = members.findIndex(m => m.id === id); if (idx >= 0) members.splice(idx, 1); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/worships', () => {
  const worships = [];
  return {
    worshipsApi: {
      getAll: jest.fn(async () => [...worships]),
      create: jest.fn(async (data) => { const id = ++mockNextId; const w = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; worships.push(w); return w; }),
      update: jest.fn(async (id, data) => { const idx = worships.findIndex(w => w.id === id); if (idx >= 0) Object.assign(worships[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = worships.findIndex(w => w.id === id); if (idx >= 0) worships.splice(idx, 1); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/musicians', () => {
  const musicians = [];
  return {
    musiciansApi: {
      getAll: jest.fn(async () => [...musicians]),
      getById: jest.fn(async (id) => musicians.find(m => m.id === id) || null),
      create: jest.fn(async (data) => { const id = ++mockNextId; const m = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; musicians.push(m); return m; }),
      update: jest.fn(async (id, data) => { const idx = musicians.findIndex(m => m.id === id); if (idx >= 0) Object.assign(musicians[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = musicians.findIndex(m => m.id === id); if (idx >= 0) musicians.splice(idx, 1); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/notifications', () => {
  const notifs = [];
  return {
    notificationsApi: {
      getAll: jest.fn(async () => [...notifs]),
      getById: jest.fn(async (id) => notifs.find(n => n.id === id) || null),
      create: jest.fn(async (data) => { const id = ++mockNextId; const n = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; notifs.push(n); return n; }),
      update: jest.fn(async (id, data) => { const idx = notifs.findIndex(n => n.id === id); if (idx >= 0) Object.assign(notifs[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = notifs.findIndex(n => n.id === id); if (idx >= 0) notifs.splice(idx, 1); return { ok: true }; }),
      markAsRead: jest.fn(async (id) => { const n = notifs.find(n => n.id === id); if (n) n.read = true; return { ok: true }; }),
      markAllAsRead: jest.fn(async () => { notifs.forEach(n => n.read = true); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/comments', () => {
  const comments = [];
  return {
    commentsApi: {
      getAll: jest.fn(async () => [...comments]),
      getByNotificationId: jest.fn(async (nid) => comments.filter(c => c.notificationId === nid)),
      create: jest.fn(async (data) => { const id = ++mockNextId; const c = { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; comments.push(c); return c; }),
      update: jest.fn(async (id, data) => { const idx = comments.findIndex(c => c.id === id); if (idx >= 0) Object.assign(comments[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { const idx = comments.findIndex(c => c.id === id); if (idx >= 0) comments.splice(idx, 1); return { ok: true }; }),
      deleteByNotificationId: jest.fn(async (nid) => { const toRemove = comments.filter(c => c.notificationId === nid); toRemove.forEach(c => { const idx = comments.indexOf(c); if (idx >= 0) comments.splice(idx, 1); }); return { ok: true }; }),
    },
  };
});

jest.mock('@/api/communications', () => {
  const comms = [];
  return {
    communicationsApi: {
      getAll: jest.fn(async () => [...comms]),
      create: jest.fn(async (data) => { const id = ++mockNextId; const c = { id, ...data, created_at: new Date().toISOString() }; comms.push(c); return c; }),
    },
  };
});

jest.mock('@/api/auth', () => ({
  __esModule: true,
  authApi: {
    login: jest.fn(async (email, password) => {
      if (email === 'admin@church.com' && password === 'Pa$$w0rd!') {
        return {
          user: { id: 'admin-001', name: 'Administrateur', email: 'admin@church.com', role: 'admin', permissions: { canManageUsers: true, canManageAllCults: true, canSendGlobalNotifications: true, canCreateCults: true, canManageSongs: true, canViewCults: true, canCommentOnNotifications: true } },
          token: 'mock-token',
        };
      }
      throw new Error('Email ou mot de passe incorrect');
    }),
    register: jest.fn(async (data) => ({
      user: { id: 'user-123', name: data.name, email: data.email, role: data.role || 'viewer', permissions: { canViewCults: true, canViewNotifications: true, canCommentOnNotifications: true } },
      token: 'mock-token',
    })),
    me: jest.fn(async () => ({ id: 'admin-001', name: 'Administrateur', email: 'admin@church.com', role: 'admin', permissions: {} })),
    changePassword: jest.fn(async () => ({ ok: true })),
    updateProfile: jest.fn(async (name, email) => ({ id: 'admin-001', name, email, role: 'admin', permissions: {} })),
    logout: jest.fn(),
  },
  setToken: jest.fn(),
  getToken: jest.fn(() => 'mock-token'),
}));

jest.mock('@/api/users', () => {
  const users = [
    { id: 'admin-001', name: 'Administrateur', email: 'admin@church.com', role: 'admin', permissions: { canManageUsers: true, canManageAllCults: true, canSendGlobalNotifications: true, canCreateCults: true, canManageSongs: true, canViewCults: true, canCommentOnNotifications: true }, status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];
  return {
    usersApi: {
      getAll: jest.fn(async () => [...users]),
      getById: jest.fn(async (id) => users.find(u => u.id === id) || null),
      create: jest.fn(async (data) => {
        const existing = users.find(u => u.email === data.email);
        if (existing) throw new Error('Email déjà utilisé');
        const id = 'user-' + Date.now();
        const u = { id, ...data, permissions: { ...mockAllPermissionsFalse, canViewCults: true, canViewNotifications: true, canCommentOnNotifications: true }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        users.push(u);
        return u;
      }),
      update: jest.fn(async (id, data) => { const idx = users.findIndex(u => u.id === id); if (idx >= 0) Object.assign(users[idx], data, { updated_at: new Date().toISOString() }); }),
      delete: jest.fn(async (id) => { if (id === 'admin-001') throw new Error('Impossible de supprimer l\'administrateur principal'); const idx = users.findIndex(u => u.id === id); if (idx < 0) throw new Error('Utilisateur non trouvé'); users.splice(idx, 1); return { ok: true }; }),
      updatePermissions: jest.fn(async (id, perms) => { const u = users.find(u => u.id === id); if (u) Object.assign(u.permissions, perms); return { ok: true }; }),
    },
  };
});
