import * as SQLite from 'expo-sqlite';

// Interface pour la base de données
export interface Song {
  id?: number;
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

export interface TeamMember {
  id?: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Worship {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorshipSong {
  id?: number;
  worship_id: number;
  song_id: number;
  order_index: number;
  notes?: string;
}

export interface Communication {
  id?: number;
  message: string;
  type: 'info' | 'urgent' | 'reminder';
  sent_at: string;
  created_at?: string;
}

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('church_app.db');
      await this.createTables();
      await this.insertInitialData();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    // Table des chants
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        key TEXT NOT NULL,
        tempo TEXT NOT NULL,
        duration TEXT,
        category TEXT NOT NULL,
        notes TEXT,
        lyrics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des membres de l'équipe
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des cultes
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS worships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        theme TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table de liaison culte-chants
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS worship_songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worship_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (worship_id) REFERENCES worships (id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
      );
    `);

    // Table des communications
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS communications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('info', 'urgent', 'reminder')),
        sent_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trigger pour mettre à jour updated_at automatiquement
    await this.db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_songs_timestamp 
      AFTER UPDATE ON songs
      BEGIN
        UPDATE songs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    await this.db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_team_members_timestamp 
      AFTER UPDATE ON team_members
      BEGIN
        UPDATE team_members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    await this.db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_worships_timestamp 
      AFTER UPDATE ON worships
      BEGIN
        UPDATE worships SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
  }

  private async insertInitialData(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    // Vérifier si des données existent déjà
    const songsCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM songs');
    const membersCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM team_members');

    // Insérer des chants par défaut si la table est vide
    if ((songsCount as any)?.count === 0) {
      const initialSongs = [
        {
          title: 'Mon Rocher, Mon Salut',
          artist: 'Hillsong Worship',
          key: 'C',
          tempo: 'Medium',
          duration: '4:32',
          category: 'Louange',
          notes: 'Chant d\'ouverture parfait, très entraînant',
          lyrics: 'Mon rocher, mon salut\nTu es ma forteresse\nEn toi je me confie\nÔ mon Dieu fidèle'
        },
        {
          title: 'Au Pied de la Croix',
          artist: 'Matt Redman',
          key: 'G',
          tempo: 'Slow',
          duration: '5:15',
          category: 'Adoration',
          notes: 'Moment de recueillement, très touchant',
          lyrics: 'Au pied de la croix\nJe dépose mes fardeaux\nTon amour me libère\nJésus mon Sauveur'
        },
        {
          title: 'Glorious Day',
          artist: 'Casting Crowns',
          key: 'D',
          tempo: 'Fast',
          duration: '3:58',
          category: 'Célébration',
          notes: 'Chant de victoire, très dynamique',
          lyrics: 'What a glorious day\nThat will be\nWhen my Jesus I shall see'
        },
        {
          title: 'Saint Esprit',
          artist: 'Jesus Culture',
          key: 'A',
          tempo: 'Medium',
          duration: '6:22',
          category: 'Invocation',
          notes: 'Appel à la présence de Dieu',
          lyrics: 'Saint Esprit viens\nRemplis ce lieu\nDe ta présence\nDe ton feu'
        }
      ];

      for (const song of initialSongs) {
        await this.db.runAsync(
          `INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [song.title, song.artist, song.key, song.tempo, song.duration, song.category, song.notes, song.lyrics]
        );
      }
    }

    // Insérer des membres d'équipe par défaut si la table est vide
    if ((membersCount as any)?.count === 0) {
      const initialMembers = [
        {
          name: 'Jean Dupont',
          role: 'Vocaliste',
          phone: '06 12 34 56 78',
          email: 'jean.dupont@email.com'
        },
        {
          name: 'Sophie Martin',
          role: 'Pianiste',
          phone: '06 98 76 54 32',
          email: 'sophie.martin@email.com'
        },
        {
          name: 'Marc Lefevre',
          role: 'Guitariste',
          phone: '06 11 22 33 44',
          email: 'marc.lefevre@email.com'
        },
        {
          name: 'Clara Dubois',
          role: 'Batteur',
          phone: '06 55 66 77 88',
          email: 'clara.dubois@email.com'
        },
        {
          name: 'Marie Rousseau',
          role: 'Chef de louange',
          phone: '06 77 88 99 00',
          email: 'marie.rousseau@email.com'
        }
      ];

      for (const member of initialMembers) {
        await this.db.runAsync(
          `INSERT INTO team_members (name, role, phone, email) 
           VALUES (?, ?, ?, ?)`,
          [member.name, member.role, member.phone, member.email]
        );
      }
    }
  }

  // CRUD Operations pour les chants
  async getAllSongs(): Promise<Song[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getAllAsync('SELECT * FROM songs ORDER BY created_at DESC') as Song[];
  }

  async getSongById(id: number): Promise<Song | null> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getFirstAsync('SELECT * FROM songs WHERE id = ?', [id]) as Song | null;
  }

  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.runAsync(
      `INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [song.title, song.artist, song.key, song.tempo, song.duration, song.category, song.notes, song.lyrics]
    );
    return result.lastInsertRowId;
  }

  async updateSong(id: number, song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.runAsync(
      `UPDATE songs SET title = ?, artist = ?, key = ?, tempo = ?, duration = ?, category = ?, notes = ?, lyrics = ? 
       WHERE id = ?`,
      [song.title, song.artist, song.key, song.tempo, song.duration, song.category, song.notes, song.lyrics, id]
    );
  }

  async deleteSong(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.runAsync('DELETE FROM songs WHERE id = ?', [id]);
  }

  // CRUD Operations pour les membres de l'équipe
  async getAllTeamMembers(): Promise<TeamMember[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getAllAsync('SELECT * FROM team_members ORDER BY name') as TeamMember[];
  }

  async getTeamMemberById(id: number): Promise<TeamMember | null> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getFirstAsync('SELECT * FROM team_members WHERE id = ?', [id]) as TeamMember | null;
  }

  async createTeamMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.runAsync(
      `INSERT INTO team_members (name, role, phone, email, avatar_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [member.name, member.role, member.phone || null, member.email || null, member.avatar_url || null]
    );
    return result.lastInsertRowId;
  }

  async updateTeamMember(id: number, member: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    
    const fields = [];
    const values = [];
    
    if (member.name !== undefined) { fields.push('name = ?'); values.push(member.name); }
    if (member.role !== undefined) { fields.push('role = ?'); values.push(member.role); }
    if (member.phone !== undefined) { fields.push('phone = ?'); values.push(member.phone); }
    if (member.email !== undefined) { fields.push('email = ?'); values.push(member.email); }
    if (member.avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(member.avatar_url); }
    
    if (fields.length === 0) return;
    
    values.push(id);
    await this.db.runAsync(`UPDATE team_members SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async deleteTeamMember(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.runAsync('DELETE FROM team_members WHERE id = ?', [id]);
  }

  // CRUD Operations pour les communications
  async getAllCommunications(): Promise<Communication[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getAllAsync('SELECT * FROM communications ORDER BY sent_at DESC LIMIT 50') as Communication[];
  }

  async createCommunication(communication: Omit<Communication, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.runAsync(
      `INSERT INTO communications (message, type, sent_at) VALUES (?, ?, ?)`,
      [communication.message, communication.type, communication.sent_at]
    );
    return result.lastInsertRowId;
  }

  // CRUD Operations pour les cultes
  async getAllWorships(): Promise<Worship[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    return await this.db.getAllAsync('SELECT * FROM worships ORDER BY date DESC, time DESC') as Worship[];
  }

  async createWorship(worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.runAsync(
      `INSERT INTO worships (title, date, time, location, theme, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [worship.title, worship.date, worship.time, worship.location, worship.theme || null, worship.description || null]
    );
    return result.lastInsertRowId;
  }

  async updateWorship(id: number, worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.runAsync(
      `UPDATE worships SET title = ?, date = ?, time = ?, location = ?, theme = ?, description = ? 
       WHERE id = ?`,
      [worship.title, worship.date, worship.time, worship.location, worship.theme || null, worship.description || null, id]
    );
  }

  async deleteWorship(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.runAsync('DELETE FROM worships WHERE id = ?', [id]);
  }

  // Méthodes utilitaires
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.execAsync(`
      DELETE FROM worship_songs;
      DELETE FROM communications;
      DELETE FROM worships;
      DELETE FROM team_members;
      DELETE FROM songs;
    `);
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Instance singleton de la base de données
export const database = new DatabaseManager();