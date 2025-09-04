import React, { createContext, useContext, ReactNode } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useDatabase } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DatabaseContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const { isInitialized, isLoading, error } = useDatabase();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  // Écran de chargement pendant l'initialisation
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={[styles.loadingText, { color: textColor }]}>
          Initialisation de la base de données...
        </ThemedText>
      </View>
    );
  }

  // Écran d'erreur si l'initialisation échoue
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <ThemedText style={[styles.errorTitle, { color: useThemeColor({}, 'error') }]}>
          Erreur de base de données
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: textColor }]}>
          {error}
        </ThemedText>
        <ThemedText style={[styles.errorSubtext, { color: useThemeColor({}, 'secondary') }]}>
          Veuillez redémarrer l'application
        </ThemedText>
      </View>
    );
  }

  // Rendu normal une fois la base de données initialisée
  return (
    <DatabaseContext.Provider value={{ isInitialized, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});