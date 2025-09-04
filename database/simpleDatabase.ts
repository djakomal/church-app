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
  preacher?: string;
  description?: string;
  songs?: string[];
  musicians?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Musician {
  id?: number;
  name: string;
  email: string;
  phone: string;
  type: 'chantre' | 'instrumentiste';
  voiceType?: string;
  instruments?: string[];
  availability?: string[];
  notes?: string;
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

export interface Notification {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning';
  targetAudience: 'all' | 'musicians' | 'leaders' | 'active_members';
  isScheduled: boolean;
  scheduledDate?: string;
  sent_at: string;
  read: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id?: number;
  notificationId: number;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

class SimpleDatabaseManager {
  private readonly SONGS_KEY = 'church_app_songs';
  private readonly TEAM_MEMBERS_KEY = 'church_app_team_members';
  private readonly COMMUNICATIONS_KEY = 'church_app_communications';
  private readonly WORSHIPS_KEY = 'church_app_worships';
  private readonly MUSICIANS_KEY = 'church_app_musicians';
  private readonly NOTIFICATIONS_KEY = 'church_app_notifications';
  private readonly COMMENTS_KEY = 'church_app_comments';

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
      // Utiliser un format ISO pour un tri fiable
      return worships.sort((a: Worship, b: Worship) => {
        const bTime = new Date(`${b.date}T${b.time}`).getTime();
        const aTime = new Date(`${a.date}T${a.time}`).getTime();
        return bTime - aTime;
      });
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

  // CRUD Operations pour les musiciens
  async getAllMusicians(): Promise<Musician[]> {
    try {
      const musiciansJson = await AsyncStorage.getItem(this.MUSICIANS_KEY);
      return musiciansJson ? JSON.parse(musiciansJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des musiciens:', error);
      return [];
    }
  }

  async getMusicianById(id: number): Promise<Musician | null> {
    const musicians = await this.getAllMusicians();
    return musicians.find(musician => musician.id === id) || null;
  }

  async createMusician(musician: Omit<Musician, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const musicians = await this.getAllMusicians();
    const newId = Math.max(...musicians.map(m => m.id || 0), 0) + 1;
    const newMusician: Musician = {
      ...musician,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    musicians.push(newMusician);
    await AsyncStorage.setItem(this.MUSICIANS_KEY, JSON.stringify(musicians));
    return newId;
  }

  async updateMusician(id: number, musician: Partial<Omit<Musician, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const musicians = await this.getAllMusicians();
    const index = musicians.findIndex(m => m.id === id);
    
    if (index !== -1) {
      musicians[index] = {
        ...musicians[index],
        ...musician,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.MUSICIANS_KEY, JSON.stringify(musicians));
    }
  }

  async deleteMusician(id: number): Promise<void> {
    const musicians = await this.getAllMusicians();
    const filteredMusicians = musicians.filter(musician => musician.id !== id);
    await AsyncStorage.setItem(this.MUSICIANS_KEY, JSON.stringify(filteredMusicians));
  }

  // CRUD Operations pour les notifications
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      return notifications.sort((a: Notification, b: Notification) => 
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  async getNotificationById(id: number): Promise<Notification | null> {
    const notifications = await this.getAllNotifications();
    return notifications.find(notification => notification.id === id) || null;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const notifications = await this.getAllNotifications();
    const newId = Math.max(...notifications.map(n => n.id || 0), 0) + 1;
    const newNotification: Notification = {
      ...notification,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newId;
  }

  async updateNotification(id: number, notification: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const notifications = await this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index] = {
        ...notifications[index],
        ...notification,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }

  async deleteNotification(id: number): Promise<void> {
    const notifications = await this.getAllNotifications();
    const filteredNotifications = notifications.filter(notification => notification.id !== id);
    await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
    
    // Supprimer aussi tous les commentaires associés
    await this.deleteCommentsByNotificationId(id);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.updateNotification(id, { read: true });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const notifications = await this.getAllNotifications();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true, updated_at: new Date().toISOString() }));
    await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  }

  // CRUD Operations pour les commentaires
  async getAllComments(): Promise<Comment[]> {
    try {
      const commentsJson = await AsyncStorage.getItem(this.COMMENTS_KEY);
      return commentsJson ? JSON.parse(commentsJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return [];
    }
  }

  async getCommentsByNotificationId(notificationId: number): Promise<Comment[]> {
    const comments = await this.getAllComments();
    return comments
      .filter(comment => comment.notificationId === notificationId)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  }

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const comments = await this.getAllComments();
    const newId = Math.max(...comments.map(c => c.id || 0), 0) + 1;
    const newComment: Comment = {
      ...comment,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    comments.push(newComment);
    await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    return newId;
  }

  async updateComment(id: number, comment: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const comments = await this.getAllComments();
    const index = comments.findIndex(c => c.id === id);
    
    if (index !== -1) {
      comments[index] = {
        ...comments[index],
        ...comment,
        updated_at: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    }
  }

  async deleteComment(id: number): Promise<void> {
    const comments = await this.getAllComments();
    const filteredComments = comments.filter(comment => comment.id !== id);
    await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(filteredComments));
  }

  async deleteCommentsByNotificationId(notificationId: number): Promise<void> {
    const comments = await this.getAllComments();
    const filteredComments = comments.filter(comment => comment.notificationId !== notificationId);
    await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(filteredComments));
  }

  // Méthodes utilitaires
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.SONGS_KEY,
      this.TEAM_MEMBERS_KEY,
      this.COMMUNICATIONS_KEY,
      this.WORSHIPS_KEY,
      this.MUSICIANS_KEY,
      this.NOTIFICATIONS_KEY,
      this.COMMENTS_KEY
    ]);
  }
}

// Instance singleton de la base de données
export const simpleDatabase = new SimpleDatabaseManager();