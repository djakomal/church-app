const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.resolve(__dirname, '..', 'data', 'church.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    migrate();
    seedDefaults();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      key TEXT DEFAULT '',
      tempo TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      category TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      lyrics TEXT DEFAULT '',
      audio_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS worships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      location TEXT DEFAULT '',
      theme TEXT DEFAULT '',
      preacher TEXT DEFAULT '',
      description TEXT DEFAULT '',
      songs TEXT DEFAULT '[]',
      musicians TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      createdBy TEXT DEFAULT '',
      assignedMusicians TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS musicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      type TEXT DEFAULT 'chantre',
      voiceType TEXT DEFAULT '',
      instruments TEXT DEFAULT '[]',
      availability TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      targetAudience TEXT DEFAULT 'all',
      userId TEXT DEFAULT '',
      isScheduled INTEGER DEFAULT 0,
      scheduledDate TEXT DEFAULT '',
      sent_at TEXT DEFAULT (datetime('now')),
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notificationId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userRole TEXT DEFAULT '',
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      sent_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'viewer',
      password TEXT NOT NULL,
      permissions TEXT DEFAULT '{}',
      avatar TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      phone TEXT DEFAULT '',
      department TEXT DEFAULT '',
      position TEXT DEFAULT '',
      lastLogin TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS permission_overrides (
      user_id TEXT NOT NULL,
      permission TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, permission),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      permissions TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discussionId TEXT NOT NULL,
      message TEXT NOT NULL,
      senderName TEXT DEFAULT '',
      userId TEXT DEFAULT '',
      isOwnMessage INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS discussions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      icon TEXT DEFAULT 'chatbubble',
      hasNewMessages INTEGER DEFAULT 0,
      hasUrgentAlert INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worshipId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT DEFAULT '',
      confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (worshipId) REFERENCES worships(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY,
      journeyStep INTEGER DEFAULT 0,
      progress REAL DEFAULT 0,
      visitedScreens TEXT DEFAULT '[]',
      featureAccess TEXT DEFAULT '{}',
      accessibilityEnabled INTEGER DEFAULT 0,
      fontSize INTEGER DEFAULT 16,
      theme TEXT DEFAULT 'system',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      requiredRole TEXT DEFAULT 'viewer',
      isEnabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function migrate() {
  // Add userId column to notifications if missing
  const cols = db.prepare("PRAGMA table_info('notifications')").all();
  if (!cols.find(c => c.name === 'userId')) {
    db.exec("ALTER TABLE notifications ADD COLUMN userId TEXT DEFAULT ''");
  }
}

function seedDefaults() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c === 0) {
    const hashed = bcrypt.hashSync('Pa$$w0rd!', 10);
    db.prepare(`INSERT INTO users (id, name, email, role, password, permissions, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'admin-001',
      'Administrateur',
      'admin@church.com',
      'admin',
      hashed,
      JSON.stringify({
        canManageUsers: true, canAssignRoles: true, canValidateCults: true,
        canAssignMusicians: true, canSendGlobalNotifications: true,
        canSendTargetedNotifications: true, canDeleteComments: true,
        canManageAllCults: true, canCreateCults: true, canEditCults: true,
        canSubmitCults: true, canManageSongs: true, canViewCults: true,
        canCreateLeaderCults: true, canEditLeaderCults: true,
        canSubmitLeaderCults: true, canSelectSongs: true,
        canViewMusicians: true, canViewProfile: true,
        canViewAssignedCults: true, canViewNotifications: true,
        canCommentOnNotifications: true
      }),
      'active'
    );
  }

  if (db.prepare('SELECT COUNT(*) as c FROM permissions').get().c === 0) {
    const perms = [
      ['permission-user-create', 'Créer un utilisateur', 'Permet de créer de nouveaux utilisateurs', 'users'],
      ['permission-user-read', 'Lire les utilisateurs', 'Permet de voir la liste des utilisateurs', 'users'],
      ['permission-user-update', 'Modifier un utilisateur', 'Permet de modifier les informations des utilisateurs', 'users'],
      ['permission-user-delete', 'Supprimer un utilisateur', 'Permet de supprimer des utilisateurs', 'users'],
      ['permission-user-manage', 'Gérer les utilisateurs', 'Accès complet à la gestion des utilisateurs', 'users'],
      ['permission-role-create', 'Créer un rôle', 'Permet de créer de nouveaux rôles', 'roles'],
      ['permission-role-read', 'Lire les rôles', 'Permet de voir la liste des rôles', 'roles'],
      ['permission-role-update', 'Modifier un rôle', 'Permet de modifier les rôles existants', 'roles'],
      ['permission-role-delete', 'Supprimer un rôle', 'Permet de supprimer des rôles', 'roles'],
      ['permission-team-create', 'Créer un membre', 'Permet d\'ajouter des membres à l\'équipe', 'team'],
      ['permission-team-read', 'Lire les membres', 'Permet de voir les membres de l\'équipe', 'team'],
      ['permission-team-update', 'Modifier un membre', 'Permet de modifier les membres', 'team'],
      ['permission-team-delete', 'Supprimer un membre', 'Permet de supprimer des membres', 'team'],
      ['permission-song-create', 'Ajouter un chant', 'Permet d\'ajouter des chants', 'songs'],
      ['permission-song-read', 'Lire les chants', 'Permet de voir les chants', 'songs'],
      ['permission-song-update', 'Modifier un chant', 'Permet de modifier les chants', 'songs'],
      ['permission-song-delete', 'Supprimer un chant', 'Permet de supprimer des chants', 'songs'],
      ['permission-worship-create', 'Créer un culte', 'Permet de créer des cultes', 'worships'],
      ['permission-worship-read', 'Lire les cultes', 'Permet de voir les cultes', 'worships'],
      ['permission-worship-update', 'Modifier un culte', 'Permet de modifier les cultes', 'worships'],
      ['permission-worship-delete', 'Supprimer un culte', 'Permet de supprimer des cultes', 'worships'],
      ['permission-worship-validate', 'Valider un culte', 'Permet de valider/publier un culte', 'worships'],
      ['permission-notification-create', 'Envoyer notification', 'Permet d\'envoyer des notifications', 'notifications'],
      ['permission-notification-read', 'Lire notifications', 'Permet de voir les notifications', 'notifications'],
      ['permission-notification-delete', 'Supprimer notification', 'Permet de supprimer des notifications', 'notifications'],
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO permissions (id, name, description, category) VALUES (?, ?, ?, ?)');
    for (const p of perms) stmt.run(...p);
  }

  if (db.prepare('SELECT COUNT(*) as c FROM roles').get().c === 0) {
    const adminPerms = db.prepare('SELECT id FROM permissions').all().map(p => p.id);
    const editorPerms = db.prepare('SELECT id FROM permissions WHERE category NOT IN (\'users\', \'roles\')').all().map(p => p.id);
    db.prepare(`INSERT INTO roles (id, name, level, description, permissions) VALUES (?, ?, ?, ?, ?)`).run(
      'role-admin-001', 'Administrateur', 5, 'Accès complet à toutes les fonctionnalités', JSON.stringify(adminPerms)
    );
    db.prepare(`INSERT INTO roles (id, name, level, description, permissions) VALUES (?, ?, ?, ?, ?)`).run(
      'role-editor-001', 'Éditeur', 4, 'Gestion du contenu sans administration', JSON.stringify(editorPerms)
    );
    db.prepare(`INSERT INTO roles (id, name, level, description, permissions) VALUES (?, ?, ?, ?, ?)`).run(
      'role-leader-001', 'Leader', 3, 'Gestion des cultes et de l\'équipe', JSON.stringify(['permission-team-read', 'permission-song-read', 'permission-worship-create'])
    );
    db.prepare(`INSERT INTO roles (id, name, level, description, permissions) VALUES (?, ?, ?, ?, ?)`).run(
      'role-viewer-001', 'Lecteur', 1, 'Accès en lecture seule', JSON.stringify(['permission-team-read', 'permission-song-read', 'permission-worship-read'])
    );
  }

}

module.exports = { getDb };
