import AsyncStorage from '@react-native-async-storage/async-storage';
import { simpleDatabase, Song, Worship, TeamMember, Musician, Notification, Communication, Comment } from '../../database/simpleDatabase';

beforeEach(async () => {
  await AsyncStorage.clear();
  await simpleDatabase.init();
});

describe('SimpleDatabase', () => {
  describe('Songs', () => {
    it('should seed initial songs on first init', async () => {
      const songs = await simpleDatabase.getAllSongs();
      expect(songs.length).toBeGreaterThan(0);
      expect(songs[0]).toHaveProperty('title');
      expect(songs[0]).toHaveProperty('artist');
    });

    it('should not duplicate seed data on second init', async () => {
      await simpleDatabase.init();
      const songs = await simpleDatabase.getAllSongs();
      expect(songs.length).toBe(4);
    });

    it('should create a new song', async () => {
      const id = await simpleDatabase.createSong({
        title: 'Nouveau Chant',
        artist: 'Artiste Test',
        key: 'C',
        tempo: 'Medium',
        duration: '3:00',
        category: 'Louange',
        notes: '',
        lyrics: '',
      });
      expect(id).toBeGreaterThan(0);
      const song = await simpleDatabase.getSongById(id);
      expect(song?.title).toBe('Nouveau Chant');
    });

    it('should update an existing song', async () => {
      const songs = await simpleDatabase.getAllSongs();
      const first = songs[0];
      await simpleDatabase.updateSong(first.id!, { ...first, title: 'Titre Modifié' });
      const updated = await simpleDatabase.getSongById(first.id!);
      expect(updated?.title).toBe('Titre Modifié');
    });

    it('should delete a song', async () => {
      const before = await simpleDatabase.getAllSongs();
      await simpleDatabase.deleteSong(before[0].id!);
      const after = await simpleDatabase.getAllSongs();
      expect(after.length).toBe(before.length - 1);
    });
  });

  describe('Team Members', () => {
    it('should seed initial members', async () => {
      const members = await simpleDatabase.getAllTeamMembers();
      expect(members.length).toBeGreaterThan(0);
    });

    it('should create a team member', async () => {
      const id = await simpleDatabase.createTeamMember({
        name: 'Test Member',
        role: 'Pianiste',
        phone: '01 23 45 67 89',
        email: 'test@test.com',
      });
      const member = await simpleDatabase.getTeamMemberById(id);
      expect(member?.name).toBe('Test Member');
    });

    it('should update a team member', async () => {
      const members = await simpleDatabase.getAllTeamMembers();
      const first = members[0];
      await simpleDatabase.updateTeamMember(first.id!, { name: 'Nom Modifié' });
      const updated = await simpleDatabase.getTeamMemberById(first.id!);
      expect(updated?.name).toBe('Nom Modifié');
    });

    it('should delete a team member', async () => {
      const before = await simpleDatabase.getAllTeamMembers();
      await simpleDatabase.deleteTeamMember(before[0].id!);
      const after = await simpleDatabase.getAllTeamMembers();
      expect(after.length).toBe(before.length - 1);
    });
  });

  describe('Worships', () => {
    it('should create a worship', async () => {
      const id = await simpleDatabase.createWorship({
        title: 'Culte Test',
        date: '2026-07-10',
        time: '10:00',
        location: 'Sanctuaire',
        theme: 'Amour de Dieu',
        preacher: 'Pasteur Test',
        description: 'Description du culte',
        status: 'draft',
      });
      const worships = await simpleDatabase.getAllWorships();
      const worship = worships.find(w => w.id === id);
      expect(worship?.title).toBe('Culte Test');
      expect(worship?.status).toBe('draft');
    });

    it('should update a worship', async () => {
      const id = await simpleDatabase.createWorship({
        title: 'Test', date: '2026-07-10', time: '10:00',
        location: 'Lieu', status: 'draft',
      });
      await simpleDatabase.updateWorship(id, { title: 'Mis à Jour', status: 'published' });
      const worships = await simpleDatabase.getAllWorships();
      const updated = worships.find(w => w.id === id);
      expect(updated?.title).toBe('Mis à Jour');
      expect(updated?.status).toBe('published');
    });

    it('should delete a worship', async () => {
      const id = await simpleDatabase.createWorship({
        title: 'À Supprimer', date: '2026-07-10', time: '10:00',
        location: 'Lieu', status: 'draft',
      });
      await simpleDatabase.deleteWorship(id);
      const worships = await simpleDatabase.getAllWorships();
      const found = worships.find(w => w.id === id);
      expect(found).toBeUndefined();
    });
  });

  describe('Musicians', () => {
    it('should create a musician', async () => {
      const id = await simpleDatabase.createMusician({
        name: 'Musicien Test',
        email: 'musicien@test.com',
        phone: '01 23 45 67 89',
        type: 'chantre',
      });
      const musician = await simpleDatabase.getMusicianById(id);
      expect(musician?.name).toBe('Musicien Test');
    });

    it('should update a musician', async () => {
      const musicians = await simpleDatabase.getAllMusicians();
      if (musicians.length > 0) {
        const first = musicians[0];
        await simpleDatabase.updateMusician(first.id!, { name: 'Mis à Jour' });
        const updated = await simpleDatabase.getMusicianById(first.id!);
        expect(updated?.name).toBe('Mis à Jour');
      }
    });

    it('should delete a musician', async () => {
      const id = await simpleDatabase.createMusician({
        name: 'À Supprimer', email: 'del@test.com',
        phone: '00', type: 'instrumentiste',
      });
      await simpleDatabase.deleteMusician(id);
      const found = await simpleDatabase.getMusicianById(id);
      expect(found).toBeNull();
    });
  });

  describe('Notifications', () => {
    it('should create a notification', async () => {
      const id = await simpleDatabase.createNotification({
        title: 'Notification Test',
        message: 'Message de test',
        type: 'info',
        targetAudience: 'all',
        isScheduled: false,
        sent_at: new Date().toISOString(),
        read: false,
      });
      const notification = await simpleDatabase.getNotificationById(id);
      expect(notification?.title).toBe('Notification Test');
    });

    it('should mark notification as read', async () => {
      const notifications = await simpleDatabase.getAllNotifications();
      if (notifications.length > 0) {
        await simpleDatabase.markNotificationAsRead(notifications[0].id!);
        const updated = await simpleDatabase.getNotificationById(notifications[0].id!);
        expect(updated?.read).toBe(true);
      }
    });

    it('should mark all notifications as read', async () => {
      await simpleDatabase.markAllNotificationsAsRead();
      const all = await simpleDatabase.getAllNotifications();
      all.forEach(n => expect(n.read).toBe(true));
    });
  });

  describe('Communications', () => {
    it('should create a communication', async () => {
      const id = await simpleDatabase.createCommunication({
        message: 'Message de test',
        type: 'info',
        sent_at: new Date().toISOString(),
      });
      const comms = await simpleDatabase.getAllCommunications();
      expect(comms.length).toBeGreaterThan(0);
    });
  });

  describe('Comments', () => {
    it('should add a comment to a notification', async () => {
      const notifId = await simpleDatabase.createNotification({
        title: 'Notif Commentaire',
        message: 'Test',
        type: 'info',
        targetAudience: 'all',
        isScheduled: false,
        sent_at: new Date().toISOString(),
        read: false,
      });
      await simpleDatabase.createComment({
        notificationId: notifId,
        userId: 'user-1',
        userName: 'Test User',
        content: 'Super message !',
      });
      const comments = await simpleDatabase.getCommentsByNotificationId(notifId);
      expect(comments.length).toBe(1);
      expect(comments[0].content).toBe('Super message !');
    });

    it('should delete a comment', async () => {
      const notifId = await simpleDatabase.createNotification({
        title: 'Notif', message: 'Test',
        type: 'info', targetAudience: 'all',
        isScheduled: false, sent_at: new Date().toISOString(), read: false,
      });
      await simpleDatabase.createComment({
        notificationId: notifId, userId: 'user-1',
        userName: 'User', content: 'Commentaire',
      });
      const comments = await simpleDatabase.getCommentsByNotificationId(notifId);
      await simpleDatabase.deleteComment(comments[0].id!);
      const after = await simpleDatabase.getCommentsByNotificationId(notifId);
      expect(after.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no songs exist after clearing', async () => {
      const songs = await simpleDatabase.getAllSongs();
      for (const song of songs) {
        if (song.id != null) await simpleDatabase.deleteSong(song.id);
      }
      const after = await simpleDatabase.getAllSongs();
      expect(after.length).toBe(0);
    });

    it('should return null for non-existent song', async () => {
      const song = await simpleDatabase.getSongById(99999);
      expect(song).toBeNull();
    });
  });
});
