import { useState, useEffect, useCallback } from 'react';
import { simpleDatabase, Song, TeamMember, Communication, Worship } from '../database/simpleDatabase';

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
      setWorships(allWorships);
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
      await loadWorships(); // Recharger la liste
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