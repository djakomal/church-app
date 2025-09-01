import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useSongs } from '../hooks/useSongs';
import { SongItem } from '../components/SongItem';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useState } from 'react';

export const SongsScreen = () => {
  const { songs, isLoading, loadSongs } = useSongs();
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!songs.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun chant disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            onPress={() => {
              // Navigation ou action sur le chant
              console.log('Chant sélectionné:', item.title);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={loadSongs}
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});