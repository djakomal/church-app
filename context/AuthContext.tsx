import React, { createContext, useState, useContext, useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'leader';
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { storeData, getData, removeData } = useStorage();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur stocké
    const checkUser = async () => {
      const storedUser = await getData('user');
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulation d'une API d'authentification
      const userData = {
        id: '1',
        name: 'John Doe',
        role: 'member' as const,
      };
      await storeData('user', userData);
      setUser(userData);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await removeData('user');
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};