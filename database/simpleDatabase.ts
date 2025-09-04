import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface Communication {
  id?: number;
  message: string;
  type: 'info' | 'urgent' | 'reminder';
  sent_at: string;
  created_at?: string;
}

class SimpleDatabaseManager {
  private readonly SONGS_KEY = 'church_app_songs';
  private readonly TEAM_MEMBERS_KEY = 'church_app_team_members';
  private readonly COMMUNICATIONS_KEY = 'church_app_communications';
  private readonly WORSHIPS_KEY = 'church_app_worships';

  async init(): Promise<void> {
    try {
      await this.insertInitialData();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  private async insertInitialData(): Promise<void> {
    // Vérifier si des données existent déjà
    const existingSongs = await this.getAllSongs();
    const existingMembers = await this.getAllTeamMembers();

    // Insérer des chants par défaut si aucun n'existe
    if (existingSongs.length === 0) {
      const initialSongs: Song[] = [
        {
          id: 1,
          title: 'Mon Rocher, Mon Salut',
          artist: 'Hillsong Worship',
          key: 'C',
          tempo: 'Medium',
          duration: '4:32',
          category: 'Louange',
          notes: 'Chant d\'ouverture parfait, très entraînant',
          lyrics: 'Mon rocher, mon salut\nTu es ma forteresse\nEn toi je me confie\nÔ mon Dieu fidèle',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Au Pied de la Croix',
          artist: 'Matt Redman',
          key: 'G',
          tempo: 'Slow',
          duration: '5:15',
          category: 'Adoration',
          notes: 'Moment de recueillement, très touchant',
          lyrics: 'Au pied de la croix\nJe dépose mes fardeaux\nTon amour me libère\nJésus mon Sauveur',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Glorious Day',
          artist: 'Casting Crowns',
          key: 'D',
          tempo: 'Fast',
          duration: '3:58',
          category: 'Célébration',
          notes: 'Chant de victoire, très dynamique',
          lyrics: 'What a glorious day\nThat will be\nWhen my Jesus I shall see',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Saint Esprit',
          artist: 'Jesus Culture',
          key: 'A',
          tempo: 'Medium',
          duration: '6:22',
          category: 'Invocation',
          notes: 'Appel à la présence de Dieu',
          lyrics: 'Saint Esprit viens\nRemplis ce lieu\nDe ta présence\nDe ton feu',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      await AsyncStorage.setItem(this.SONGS_KEY, JSON.stringify(initialSongs));
    }

    // Insérer des membres d'équipe par défaut si aucun n'existe
    if (existingMembers.length === 0) {
      const initialMembers: TeamMember[] = [
        {
          id: 1,
          name: 'Jean Dupont',
          role: 'Vocaliste',
          phone: '06 12 34 56 78',
          email: 'jean.dupont@email.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Sophie Martin',
          role: 'Pianiste',
          phone: '06 98 76 54 32',
          email: 'sophie.martin@email.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Marc Lefevre',
          role: 'Guitariste',
          phone: '06 11 22 33 44',
          email: 'marc.lefevre@email.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Clara Dubois',
          role: 'Batteur',
          phone: '06 55 66 77 88',
          email: 'clara.dubois@email.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Marie Rousseau',
          role: 'Chef de louange',
          phone: '06 77 88 99 00',
          email: 'marie.rousseau@email.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      await AsyncStorage.setItem(this.TEAM_MEMBERS_KEY, JSON.stringify(initialMembers));
    }
  }

  // CRUD Operations pour les chants
  async getAllSongs(): Promise<Song[]> {
    try {
      const songsJson = await AsyncStorage.getItem(this.SONGS_KEY);
      return songsJson ? JSON.parse(songsJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des chants:', error);
      return [];
    }
  }

  async getSongById(id: number): Promise<Song | null> {
    const songs = await this.getAllSongs();
    return songs.find(song => song.id === id) || null;
  }

  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const songs = await this.getAllSongs();
    const newId = Math.max(...songs.map(s => s.id || 0), 0) + 1;
    const newSong: Song = {
      ...song,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    songs.push(newSong);
    await AsyncStorage.setItem(this.SONGS_KEY, JSON.stringify(songs));
    return newId;
  }

  async updateSong(id: number, song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const songs = await this.getAllSongs();
    const index = songs.findIndex(s => s.id === id);
    
    if (index !== -1) {
      songs[index] = {
        ...songs[index],
        ...song,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.SONGS_KEY, JSON.stringify(songs));
    }
  }

  async deleteSong(id: number): Promise<void> {
    const songs = await this.getAllSongs();
    const filteredSongs = songs.filter(song => song.id !== id);
    await AsyncStorage.setItem(this.SONGS_KEY, JSON.stringify(filteredSongs));
  }

  // CRUD Operations pour les membres de l'équipe
  async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      const membersJson = await AsyncStorage.getItem(this.TEAM_MEMBERS_KEY);
      return membersJson ? JSON.parse(membersJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      return [];
    }
  }

  async getTeamMemberById(id: number): Promise<TeamMember | null> {
    const members = await this.getAllTeamMembers();
    return members.find(member => member.id === id) || null;
  }

  async createTeamMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const members = await this.getAllTeamMembers();
    const newId = Math.max(...members.map(m => m.id || 0), 0) + 1;
    const newMember: TeamMember = {
      ...member,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    members.push(newMember);
    await AsyncStorage.setItem(this.TEAM_MEMBERS_KEY, JSON.stringify(members));
    return newId;
  }

  async updateTeamMember(id: number, member: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const members = await this.getAllTeamMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index !== -1) {
      members[index] = {
        ...members[index],
        ...member,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.TEAM_MEMBERS_KEY, JSON.stringify(members));
    }
  }

  async deleteTeamMember(id: number): Promise<void> {
    const members = await this.getAllTeamMembers();
    const filteredMembers = members.filter(member => member.id !== id);
    await AsyncStorage.setItem(this.TEAM_MEMBERS_KEY, JSON.stringify(filteredMembers));
  }

  // CRUD Operations pour les communications
  async getAllCommunications(): Promise<Communication[]> {
    try {
      const communicationsJson = await AsyncStorage.getItem(this.COMMUNICATIONS_KEY);
      const communications = communicationsJson ? JSON.parse(communicationsJson) : [];
      return communications.sort((a: Communication, b: Communication) => 
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      ).slice(0, 50);
    } catch (error) {
      console.error('Erreur lors de la récupération des communications:', error);
      return [];
    }
  }

  async createCommunication(communication: Omit<Communication, 'id' | 'created_at'>): Promise<number> {
    const communications = await this.getAllCommunications();
    const newId = Math.max(...communications.map(c => c.id || 0), 0) + 1;
    const newCommunication: Communication = {
      ...communication,
      id: newId,
      created_at: new Date().toISOString()
    };
    
    communications.unshift(newCommunication);
    await AsyncStorage.setItem(this.COMMUNICATIONS_KEY, JSON.stringify(communications.slice(0, 50)));
    return newId;
  }

  // CRUD Operations pour les cultes
  async getAllWorships(): Promise<Worship[]> {
    try {
      const worshipsJson = await AsyncStorage.getItem(this.WORSHIPS_KEY);
      const worships = worshipsJson ? JSON.parse(worshipsJson) : [];
      return worships.sort((a: Worship, b: Worship) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des cultes:', error);
      return [];
    }
  }

  async createWorship(worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const worships = await this.getAllWorships();
    const newId = Math.max(...worships.map(w => w.id || 0), 0) + 1;
    const newWorship: Worship = {
      ...worship,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    worships.push(newWorship);
    await AsyncStorage.setItem(this.WORSHIPS_KEY, JSON.stringify(worships));
    return newId;
  }

  async updateWorship(id: number, worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const worships = await this.getAllWorships();
    const index = worships.findIndex(w => w.id === id);
    
    if (index !== -1) {
      worships[index] = {
        ...worships[index],
        ...worship,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.WORSHIPS_KEY, JSON.stringify(worships));
    }
  }

  async deleteWorship(id: number): Promise<void> {
    const worships = await this.getAllWorships();
    const filteredWorships = worships.filter(worship => worship.id !== id);
    await AsyncStorage.setItem(this.WORSHIPS_KEY, JSON.stringify(filteredWorships));
  }

  // Méthodes utilitaires
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.SONGS_KEY,
      this.TEAM_MEMBERS_KEY,
      this.COMMUNICATIONS_KEY,
      this.WORSHIPS_KEY
    ]);
  }
}

// Instance singleton de la base de données
export const simpleDatabase = new SimpleDatabaseManager();