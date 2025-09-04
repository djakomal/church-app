import { EventBus } from '@/utils/EventBus';
import { useCallback, useEffect, useState } from 'react';
import { Communication, simpleDatabase, Song, TeamMember, Worship, Musician, Notification, Comment } from '../database/simpleDatabase';

// Hook pour gérer l'initialisation de la base de données
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await simpleDatabase.init();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur d\'initialisation de la base de données');
        console.error('Erreur d\'initialisation de la base de données:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  return { isInitialized, isLoading, error };
}

// Hook pour gérer les chants
export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allSongs = await simpleDatabase.getAllSongs();
      setSongs(allSongs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des chants');
      console.error('Erreur lors du chargement des chants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSong = useCallback(async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createSong(songData);
      await loadSongs(); // Recharger la liste
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du chant');
      console.error('Erreur lors de la création du chant:', err);
      throw err;
    }
  }, [loadSongs]);

  const updateSong = useCallback(async (id: number, songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      await simpleDatabase.updateSong(id, songData);
      await loadSongs(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du chant');
      console.error('Erreur lors de la modification du chant:', err);
      throw err;
    }
  }, [loadSongs]);

  const deleteSong = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteSong(id);
      await loadSongs(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du chant');
      console.error('Erreur lors de la suppression du chant:', err);
      throw err;
    }
  }, [loadSongs]);

  const getSongById = useCallback(async (id: number) => {
    try {
      setError(null);
      return await simpleDatabase.getSongById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du chant');
      console.error('Erreur lors de la récupération du chant:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  return {
    songs,
    isLoading,
    error,
    loadSongs,
    createSong,
    updateSong,
    deleteSong,
    getSongById
  };
}

// Hook pour gérer les membres de l'équipe
export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allMembers = await simpleDatabase.getAllTeamMembers();
      setTeamMembers(allMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des membres');
      console.error('Erreur lors du chargement des membres:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeamMember = useCallback(async (memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createTeamMember(memberData);
      await loadTeamMembers(); // Recharger la liste
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du membre');
      console.error('Erreur lors de la création du membre:', err);
      throw err;
    }
  }, [loadTeamMembers]);

  const updateTeamMember = useCallback(async (id: number, memberData: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      await simpleDatabase.updateTeamMember(id, memberData);
      await loadTeamMembers(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du membre');
      console.error('Erreur lors de la modification du membre:', err);
      throw err;
    }
  }, [loadTeamMembers]);

  const deleteTeamMember = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteTeamMember(id);
      await loadTeamMembers(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du membre');
      console.error('Erreur lors de la suppression du membre:', err);
      throw err;
    }
  }, [loadTeamMembers]);

  const getTeamMemberById = useCallback(async (id: number) => {
    try {
      setError(null);
      return await simpleDatabase.getTeamMemberById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du membre');
      console.error('Erreur lors de la récupération du membre:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  return {
    teamMembers,
    isLoading,
    error,
    loadTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getTeamMemberById
  };
}

// Hook pour gérer les communications
export function useCommunications() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommunications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCommunications = await simpleDatabase.getAllCommunications();
      setCommunications(allCommunications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des communications');
      console.error('Erreur lors du chargement des communications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCommunication = useCallback(async (communicationData: Omit<Communication, 'id' | 'created_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createCommunication(communicationData);
      await loadCommunications(); // Recharger la liste
      EventBus.emit('communication_created', communicationData);
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la communication');
      console.error('Erreur lors de la création de la communication:', err);
      throw err;
    }
  }, [loadCommunications]);

  useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  return {
    communications,
    isLoading,
    error,
    loadCommunications,
    createCommunication
  };
}

// Hook pour gérer les cultes
export function useWorships() {
  const [worships, setWorships] = useState<Worship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorships = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allWorships = await simpleDatabase.getAllWorships();
      // Forcer re-création d'array pour déclencher un re-render fiable
      setWorships([...allWorships]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cultes');
      console.error('Erreur lors du chargement des cultes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorship = useCallback(async (worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createWorship(worshipData);
      await loadWorships(); // Recharger la liste
      EventBus.emit('worship_created', worshipData as any);
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du culte');
      console.error('Erreur lors de la création du culte:', err);
      throw err;
    }
  }, [loadWorships]);

  const updateWorship = useCallback(async (id: number, worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      await simpleDatabase.updateWorship(id, worshipData);
      await loadWorships(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du culte');
      console.error('Erreur lors de la modification du culte:', err);
      throw err;
    }
  }, [loadWorships]);

  const deleteWorship = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteWorship(id);
      await loadWorships();
      EventBus.emit('worship_deleted', { id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du culte');
      console.error('Erreur lors de la suppression du culte:', err);
      throw err;
    }
  }, [loadWorships]);

  useEffect(() => {
    loadWorships();
  }, [loadWorships]);

  return {
    worships,
    isLoading,
    error,
    loadWorships,
    createWorship,
    updateWorship,
    deleteWorship
  };
}

// Hook pour gérer les musiciens
export function useMusicians() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMusicians = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allMusicians = await simpleDatabase.getAllMusicians();
      setMusicians(allMusicians);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des musiciens');
      console.error('Erreur lors du chargement des musiciens:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMusician = useCallback(async (musicianData: Omit<Musician, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createMusician(musicianData);
      await loadMusicians(); // Recharger la liste
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du musicien');
      console.error('Erreur lors de la création du musicien:', err);
      throw err;
    }
  }, [loadMusicians]);

  const updateMusician = useCallback(async (id: number, musicianData: Partial<Omit<Musician, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      await simpleDatabase.updateMusician(id, musicianData);
      await loadMusicians(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du musicien');
      console.error('Erreur lors de la modification du musicien:', err);
      throw err;
    }
  }, [loadMusicians]);

  const deleteMusician = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteMusician(id);
      await loadMusicians(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du musicien');
      console.error('Erreur lors de la suppression du musicien:', err);
      throw err;
    }
  }, [loadMusicians]);

  const getMusicianById = useCallback(async (id: number) => {
    try {
      setError(null);
      return await simpleDatabase.getMusicianById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du musicien');
      console.error('Erreur lors de la récupération du musicien:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadMusicians();
  }, [loadMusicians]);

  return {
    musicians,
    isLoading,
    error,
    loadMusicians,
    createMusician,
    updateMusician,
    deleteMusician,
    getMusicianById
  };
}

// Hook pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allNotifications = await simpleDatabase.getAllNotifications();
      setNotifications(allNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
      console.error('Erreur lors du chargement des notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createNotification(notificationData);
      await loadNotifications(); // Recharger la liste
      EventBus.emit('notification_created', notificationData);
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la notification');
      console.error('Erreur lors de la création de la notification:', err);
      throw err;
    }
  }, [loadNotifications]);

  const updateNotification = useCallback(async (id: number, notificationData: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      await simpleDatabase.updateNotification(id, notificationData);
      await loadNotifications(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de la notification');
      console.error('Erreur lors de la modification de la notification:', err);
      throw err;
    }
  }, [loadNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteNotification(id);
      await loadNotifications(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la notification');
      console.error('Erreur lors de la suppression de la notification:', err);
      throw err;
    }
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.markNotificationAsRead(id);
      await loadNotifications(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
      console.error('Erreur lors du marquage comme lu:', err);
      throw err;
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await simpleDatabase.markAllNotificationsAsRead();
      await loadNotifications(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage de toutes les notifications comme lues');
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
      throw err;
    }
  }, [loadNotifications]);

  const getNotificationById = useCallback(async (id: number) => {
    try {
      setError(null);
      return await simpleDatabase.getNotificationById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la notification');
      console.error('Erreur lors de la récupération de la notification:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    getNotificationById
  };
}

// Hook pour gérer les commentaires
export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allComments = await simpleDatabase.getAllComments();
      setComments(allComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commentaires');
      console.error('Erreur lors du chargement des commentaires:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCommentsByNotificationId = useCallback((notificationId: number): Comment[] => {
    return comments.filter(comment => comment.notificationId === notificationId)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  }, [comments]);

  const createComment = useCallback(async (commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newId = await simpleDatabase.createComment(commentData);
      await loadComments(); // Recharger la liste
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du commentaire');
      console.error('Erreur lors de la création du commentaire:', err);
      throw err;
    }
  }, [loadComments]);

  const updateComment = useCallback(async (id: number, commentData: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      await simpleDatabase.updateComment(id, commentData);
      await loadComments(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du commentaire');
      console.error('Erreur lors de la modification du commentaire:', err);
      throw err;
    }
  }, [loadComments]);

  const deleteComment = useCallback(async (id: number) => {
    try {
      setError(null);
      await simpleDatabase.deleteComment(id);
      await loadComments(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire');
      console.error('Erreur lors de la suppression du commentaire:', err);
      throw err;
    }
  }, [loadComments]);

  const getCommentCount = useCallback((notificationId: number): number => {
    return comments.filter(comment => comment.notificationId === notificationId).length;
  }, [comments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    error,
    loadComments,
    getCommentsByNotificationId,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount
  };
}