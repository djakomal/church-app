import { songsApi } from '../api/songs';
import { worshipsApi } from '../api/worships';
import { musiciansApi } from '../api/musicians';
import { teamApi } from '../api/team';
import { notificationsApi } from '../api/notifications';
import { commentsApi } from '../api/comments';
import { communicationsApi } from '../api/communications';

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

export type WorshipStatus = 'draft' | 'published' | 'cancelled';

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
  status?: WorshipStatus;
  createdBy?: string;
  assignedMusicians?: number[];
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
  targetAudience: 'all' | 'musicians' | 'leaders' | 'active_members' | 'chantres' | 'instrumentistes';
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
  async init(): Promise<void> {
    return;
  }

  async insertInitialData(): Promise<void> {
    return;
  }

  // Songs
  async getAllSongs(): Promise<Song[]> {
    try {
      return await songsApi.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des chants:', error);
      return [];
    }
  }

  async getSongById(id: number): Promise<Song | null> {
    try {
      return await songsApi.getById(id);
    } catch (error) {
      console.error('Erreur lors du chargement du chant:', error);
      return null;
    }
  }

  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await songsApi.create(song as any);
    return created.id;
  }

  async updateSong(id: number, song: Partial<Song>): Promise<void> {
    await songsApi.update(id, song);
  }

  async deleteSong(id: number): Promise<void> {
    await songsApi.delete(id);
  }

  // Team Members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      return await teamApi.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      return [];
    }
  }

  async getTeamMemberById(id: number): Promise<TeamMember | null> {
    try {
      return await teamApi.getById(id);
    } catch (error) {
      return null;
    }
  }

  async createTeamMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await teamApi.create(member as any);
    return created.id;
  }

  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<void> {
    await teamApi.update(id, member);
  }

  async deleteTeamMember(id: number): Promise<void> {
    await teamApi.delete(id);
  }

  // Communications
  async getAllCommunications(): Promise<Communication[]> {
    try {
      return await communicationsApi.getAll();
    } catch (error) {
      return [];
    }
  }

  async createCommunication(comm: Omit<Communication, 'id' | 'created_at'>): Promise<number> {
    const created = await communicationsApi.create(comm as any);
    return created.id;
  }

  // Worships
  async getAllWorships(): Promise<Worship[]> {
    try {
      return await worshipsApi.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des cultes:', error);
      return [];
    }
  }

  async createWorship(worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await worshipsApi.create(worship as any);
    return created.id;
  }

  async updateWorship(id: number, worship: Partial<Worship>): Promise<void> {
    await worshipsApi.update(id, worship);
  }

  async deleteWorship(id: number): Promise<void> {
    await worshipsApi.delete(id);
  }

  // Musicians
  async getAllMusicians(): Promise<Musician[]> {
    try {
      return await musiciansApi.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des musiciens:', error);
      return [];
    }
  }

  async getMusicianById(id: number): Promise<Musician | null> {
    try {
      return await musiciansApi.getById(id);
    } catch (error) {
      return null;
    }
  }

  async createMusician(musician: Omit<Musician, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await musiciansApi.create(musician as any);
    return created.id;
  }

  async updateMusician(id: number, musician: Partial<Musician>): Promise<void> {
    await musiciansApi.update(id, musician);
  }

  async deleteMusician(id: number): Promise<void> {
    await musiciansApi.delete(id);
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    try {
      return await notificationsApi.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return [];
    }
  }

  async getNotificationById(id: number): Promise<Notification | null> {
    try {
      return await notificationsApi.getById(id);
    } catch (error) {
      return null;
    }
  }

  async createNotification(n: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await notificationsApi.create(n as any);
    return created.id;
  }

  async updateNotification(id: number, n: Partial<Notification>): Promise<void> {
    await notificationsApi.update(id, n);
  }

  async deleteNotification(id: number): Promise<void> {
    await notificationsApi.delete(id);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await notificationsApi.markAsRead(id);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await notificationsApi.markAllAsRead();
  }

  // Comments
  async getAllComments(): Promise<Comment[]> {
    try {
      return await commentsApi.getAll();
    } catch (error) {
      return [];
    }
  }

  async getCommentsByNotificationId(notificationId: number): Promise<Comment[]> {
    try {
      return await commentsApi.getByNotificationId(notificationId);
    } catch (error) {
      return [];
    }
  }

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await commentsApi.create(comment as any);
    return created.id;
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<void> {
    await commentsApi.update(id, { content: comment.content || '' });
  }

  async deleteComment(id: number): Promise<void> {
    await commentsApi.delete(id);
  }

  async deleteCommentsByNotificationId(notificationId: number): Promise<void> {
    await commentsApi.deleteByNotificationId(notificationId);
  }

  async clearAllData(): Promise<void> {
    return;
  }
}

export const simpleDatabase = new SimpleDatabaseManager();
