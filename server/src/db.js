const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'church.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initSchema();
  seedDefaults();
  saveDb();
  return db;
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initSchema() {
  db.run(`
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
    )
  `);
  db.run(`
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
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      email TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
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
    )
  `);
  db.run(`
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
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      sent_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
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
    )
  `);
  db.run(`
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
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      pref_key TEXT NOT NULL,
      pref_value TEXT NOT NULL,
      UNIQUE(user_id, pref_key)
    )
  `);
}

function seedDefaults() {
  const count = db.exec("SELECT COUNT(*) as c FROM users");
  if (!count.length || !count[0].values.length || count[0].values[0][0] === 0) {
    db.run(
      `INSERT INTO users (id, name, email, password, role, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin-001', 'Administrateur', 'admin@church.com', 'Pa$$w0rd!', 'admin',
        JSON.stringify({
          canManageWorship: true, canManageSongs: true, canManageTeam: true,
          canSendCommunications: true, canViewOnly: false, canValidateWorship: true,
          canAssignMusicians: true, canDeleteComments: true,
        })]
    );
  }

  const songCount = db.exec("SELECT COUNT(*) as c FROM songs");
  if (!songCount.length || !songCount[0].values.length || songCount[0].values[0][0] === 0) {
    const songs = [
      ['Mon Rocher, Mon Salut', 'Hillsong Worship', 'C', 'Medium', '4:32', 'Louange', "Chant d'ouverture parfait", 'Mon rocher, mon salut...'],
      ["Au Pied de la Croix", "Matt Redman", "G", "Slow", "5:15", "Adoration", "Moment de recueillement", "Au pied de la croix..."],
      ["Glorious Day", "Casting Crowns", "D", "Fast", "3:58", "Célébration", "Chant de victoire", "What a glorious day..."],
      ["Saint Esprit", "Jesus Culture", "A", "Medium", "6:22", "Invocation", "Appel à la présence de Dieu", "Saint Esprit viens..."],
    ];
    for (const s of songs) {
      db.run(
        `INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        s
      );
    }
  }

  const memCount = db.exec("SELECT COUNT(*) as c FROM team_members");
  if (!memCount.length || !memCount[0].values.length || memCount[0].values[0][0] === 0) {
    const members = [
      ['Jean Dupont', 'Vocaliste', '06 12 34 56 78', 'jean.dupont@email.com'],
      ['Sophie Martin', 'Pianiste', '06 98 76 54 32', 'sophie.martin@email.com'],
      ['Marc Lefevre', 'Guitariste', '06 11 22 33 44', 'marc.lefevre@email.com'],
      ['Clara Dubois', 'Batteur', '06 55 66 77 88', 'clara.dubois@email.com'],
      ['Marie Rousseau', 'Chef de louange', '06 77 88 99 00', 'marie.rousseau@email.com'],
    ];
    for (const m of members) {
      db.run(`INSERT INTO team_members (name, role, phone, email) VALUES (?, ?, ?, ?)`, m);
    }
  }
}

module.exports = { getDb, saveDb };
