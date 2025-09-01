import { useState } from 'react';

type Storage = {
  [key: string]: any;
};

const localStore: Storage = {};

export const useStorage = () => {
  const [store, setStore] = useState<Storage>(localStore);

  const storeData = async <T>(key: string, value: T): Promise<void> => {
    try {
      localStore[key] = value;
      setStore({ ...localStore });
    } catch (error) {
      console.error('Erreur de stockage:', error);
      throw new Error('Impossible de sauvegarder les données');
    }
  };

  const getData = async (key: string): Promise<any> => {
    try {
      return store[key] || null;
    } catch (error) {
      console.error('Erreur de lecture:', error);
      throw new Error('Impossible de récupérer les données');
    }
  };

  const removeData = async (key: string): Promise<void> => {
    try {
      delete localStore[key];
      setStore({ ...localStore });
    } catch (error) {
      console.error('Erreur de suppression:', error);
      throw new Error('Impossible de supprimer les données');
    }
  };

  return { storeData, getData, removeData };
};