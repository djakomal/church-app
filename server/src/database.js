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
  `);
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

  const songCount = db.prepare('SELECT COUNT(*) as c FROM songs').get();
  if (songCount.c === 0) {
    const insert = db.prepare(`INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const seedSongs = [
      ['Combien de fois', 'Exo', 'D', 'Medium', '4:30', 'Louange', '', 'Combien de fois...'],
      ['Je veux te louer', 'David', 'G', 'Medium', '3:45', 'Louange', '', 'Je veux te louer...'],
      ['Oh viens Esprit', 'Adoration', 'A', 'Lent', '5:00', 'Adoration', '', 'Oh viens Esprit...'],
      ['Grand est ton amour', 'Équipe', 'C', 'Medium', '4:00', 'Louange', '', 'Grand est ton amour...'],
    ];
    for (const s of seedSongs) insert.run(...s);
  }
}

module.exports = { getDb };
