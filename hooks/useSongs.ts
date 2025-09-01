import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import { Alert } from 'react-native';

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  author: string;
}

export interface SongError extends Error {
  code?: string;
}

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { storeData, getData } = useStorage();

  const loadSongs = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const storedSongs = await getData('songs');
      setSongs(Array.isArray(storedSongs) ? storedSongs as Song[] : []);
    } catch (err: unknown) {
      const songError = err as SongError;
      const errorMessage = songError.message || 'Erreur inconnue';
      setError(errorMessage);
      Alert.alert(
        'Erreur de chargement',
        'Impossible de charger les chants. Veuillez réessayer.'
      );
      console.error('Erreur de chargement:', songError);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  const saveSong = async (song: Song): Promise<void> => {
    if (!song.id || !song.title) {
      const error = new Error('Le chant doit avoir un ID et un titre') as SongError;
      error.code = 'INVALID_SONG';
      throw error;
    }

    try {
      const updatedSongs = [...songs, song];
      await storeData<Song[]>('songs', updatedSongs);
      setSongs(updatedSongs);
      setError(null);
    } catch (err: unknown) {
      const songError = err as SongError;
      const errorMessage = songError.message || 'Erreur inconnue';
      setError(errorMessage);
      Alert.alert(
        'Erreur de sauvegarde',
        'Impossible de sauvegarder le chant. Veuillez réessayer.'
      );
      console.error('Erreur de sauvegarde:', songError);
      throw songError;
    }
  };

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  return {
    songs,
    isLoading,
    saveSong,
    loadSongs,
    error,
  } as const;
};