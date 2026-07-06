import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'church.db');

let db: Database.Database;

export function getDb(): Database.Database {
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
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      musician_type TEXT,
      instruments TEXT,
      voice_type TEXT,
      permissions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      key TEXT,
      tempo TEXT,
      duration TEXT,
      category TEXT,
      notes TEXT,
      lyrics TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      email TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS worships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT DEFAULT '',
      theme TEXT DEFAULT '',
      preacher TEXT DEFAULT '',
      description TEXT DEFAULT '',
      songs TEXT DEFAULT '[]',
      musicians TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      created_by TEXT,
      assigned_musicians TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS musicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'instrumentiste',
      voice_type TEXT,
      instruments TEXT DEFAULT '[]',
      availability TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      sent_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      target_audience TEXT DEFAULT 'all',
      is_scheduled INTEGER DEFAULT 0,
      scheduled_date TEXT,
      sent_at TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      pref_key TEXT NOT NULL,
      pref_value TEXT NOT NULL,
      UNIQUE(user_id, pref_key)
    );
  `);
}

function seedDefaults() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c === 0) {
    const adminId = 'admin-001';
    const insert = db.prepare(
      `INSERT INTO users (id, name, email, password, role, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    insert.run(
      adminId,
      'Administrateur',
      'admin@church.com',
      'Pa$$w0rd!',
      'admin',
      JSON.stringify({
        canManageWorship: true,
        canManageSongs: true,
        canManageTeam: true,
        canSendCommunications: true,
        canViewOnly: false,
        canValidateWorship: true,
        canAssignMusicians: true,
        canDeleteComments: true,
      })
    );
  }

  const songCount = db.prepare('SELECT COUNT(*) as c FROM songs').get() as { c: number };
  if (songCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insert.run('Mon Rocher, Mon Salut', 'Hillsong Worship', 'C', 'Medium', '4:32', 'Louange', "Chant d'ouverture parfait", 'Mon rocher, mon salut...');
    insert.run("Au Pied de la Croix", "Matt Redman", "G", "Slow", "5:15", "Adoration", "Moment de recueillement", "Au pied de la croix...");
    insert.run("Glorious Day", "Casting Crowns", "D", "Fast", "3:58", "Célébration", "Chant de victoire", "What a glorious day...");
    insert.run("Saint Esprit", "Jesus Culture", "A", "Medium", "6:22", "Invocation", "Appel à la présence de Dieu", "Saint Esprit viens...");
  }

  const memberCount = db.prepare('SELECT COUNT(*) as c FROM team_members').get() as { c: number };
  if (memberCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO team_members (name, role, phone, email)
       VALUES (?, ?, ?, ?)`
    );
    insert.run('Jean Dupont', 'Vocaliste', '06 12 34 56 78', 'jean.dupont@email.com');
    insert.run('Sophie Martin', 'Pianiste', '06 98 76 54 32', 'sophie.martin@email.com');
    insert.run('Marc Lefevre', 'Guitariste', '06 11 22 33 44', 'marc.lefevre@email.com');
    insert.run('Clara Dubois', 'Batteur', '06 55 66 77 88', 'clara.dubois@email.com');
    insert.run('Marie Rousseau', 'Chef de louange', '06 77 88 99 00', 'marie.rousseau@email.com');
  }
}
