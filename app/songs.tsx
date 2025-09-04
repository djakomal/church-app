import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// Header supprimé: on utilise la barre d'onglets en bas
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ManagedSongCard } from '@/components/ManagedSongCard';
import { SongCard } from '@/components/SongCard';
import { SongFormModal } from '@/components/SongFormModal';
import { useAuth } from '@/context/AuthContext';
import { Song } from '@/database/simpleDatabase';
import { useSongs } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Alert } from 'react-native';

export default function SongsScreen() {
  const [currentPage, setCurrentPage] = useState('mes-chants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');

  const { user, hasPermission } = useAuth();
  const {
    songs,
    isLoading,
    error,
    createSong,
    updateSong,
    deleteSong
  } = useSongs();

  const canManageSongs = hasPermission('canManageSongs');

  const categories = ['Tous', 'Louange', 'Adoration', 'Célébration', 'Invocation'];

  // Filtrer les chants
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || song.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSong = () => {
    if (!canManageSongs) {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour ajouter des chants.');
      return;
    }
    setEditingSong(null);
    setShowSongModal(true);
  };

  const handleEditSong = (id: number) => {
    if (!canManageSongs) {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour modifier des chants.');
      return;
    }
    const song = songs.find(s => s.id === id);
    if (song) {
      setEditingSong(song);
      setShowSongModal(true);
    }
  };

  const handleDeleteSong = async (id: number) => {
    if (!canManageSongs) {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour supprimer des chants.');
      return;
    }
    try {
      await deleteSong(id);
      Alert.alert('Succès', 'Le chant a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le chant');
    }
  };

  const handleSaveSong = async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSong && editingSong.id) {
        await updateSong(editingSong.id, songData);
        Alert.alert('Succès', 'Le chant a été modifié avec succès');
      } else {
        await createSong(songData);
        Alert.alert('Succès', 'Le chant a été ajouté avec succès');
      }
      setShowSongModal(false);
      setEditingSong(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le chant');
    }
  };

  const handleCloseSongModal = () => {
    setShowSongModal(false);
    setEditingSong(null);
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: useThemeColor({}, 'error') }]}>
            Erreur de chargement des chants
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: secondaryColor }]}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      {/* Main content area */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            {/* Page title */}
            <View style={styles.titleSection}>
              <ThemedText style={[styles.pageTitle, { color: textColor }]}>
                {canManageSongs ? 'Mes Chants' : 'Répertoire Musical'}
              </ThemedText>
              <ThemedText style={[styles.pageSubtitle, { color: secondaryColor }]}>
                {canManageSongs 
                  ? 'Gérez votre collection de chants'
                  : 'Consultez le répertoire musical de l\'église'
                }
              </ThemedText>
            </View>

            {/* Search and filters */}
            <View style={styles.filtersSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Rechercher un chant ou un artiste..."
                  placeholderTextColor={placeholderColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: selectedCategory === category ? primaryColor : 'transparent',
                        borderColor: primaryColor
                      }
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <ThemedText style={[
                      styles.categoryText,
                      { color: selectedCategory === category ? 'white' : primaryColor }
                    ]}>
                      {category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Add button for managers */}
            {canManageSongs && (
              <View style={styles.actionSection}>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddSong}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Ajouter un Chant
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Songs list */}
            <View style={styles.songsSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  {filteredSongs.length} chant{filteredSongs.length > 1 ? 's' : ''} 
                  {selectedCategory !== 'Tous' && ` - ${selectedCategory}`}
                  {searchQuery && ` pour "${searchQuery}"`}
                </ThemedText>
              </View>

              {filteredSongs.length > 0 ? (
                <View style={styles.songsList}>
                  {filteredSongs.map((song) => (
                    canManageSongs ? (
                      <ManagedSongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        keySignature={song.key}
                        tempo={song.tempo}
                        duration={song.duration}
                        category={song.category}
                        notes={song.notes}
                        lyrics={song.lyrics}
                        onEdit={() => handleEditSong(song.id!)}
                        onDelete={() => handleDeleteSong(song.id!)}
                      />
                    ) : (
                      <SongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        keySignature={song.key}
                        tempo={song.tempo}
                        duration={song.duration}
                        category={song.category}
                        notes={song.notes}
                        lyrics={song.lyrics}
                      />
                    )
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyState, { backgroundColor, borderColor }]}>
                  <Ionicons name="musical-notes-outline" size={48} color={secondaryColor} />
                  <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                    {searchQuery || selectedCategory !== 'Tous' 
                      ? 'Aucun chant trouvé' 
                      : 'Aucun chant disponible'
                    }
                  </ThemedText>
                  <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                    {searchQuery || selectedCategory !== 'Tous'
                      ? 'Essayez de modifier vos critères de recherche'
                      : canManageSongs 
                        ? 'Commencez par ajouter votre premier chant'
                        : 'Les chants seront affichés ici une fois ajoutés'
                    }
                  </ThemedText>
                  {canManageSongs && !searchQuery && selectedCategory === 'Tous' && (
                    <TouchableOpacity 
                      style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                      onPress={handleAddSong}
                    >
                      <Ionicons name="add" size={20} color="white" />
                      <ThemedText style={styles.emptyButtonText}>
                        Ajouter un chant
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Permission info for viewers */}
            {!canManageSongs && (
              <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
                <Ionicons name="information-circle" size={24} color={primaryColor} />
                <View style={styles.infoContent}>
                  <ThemedText style={[styles.infoTitle, { color: textColor }]}>
                    Mode consultation
                  </ThemedText>
                  <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
                    Vous consultez le répertoire musical en lecture seule. 
                    Contactez un administrateur pour obtenir les permissions de modification.
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

      {/* Modal pour ajouter/modifier un chant */}
      {canManageSongs && (
        <SongFormModal
          visible={showSongModal}
          song={editingSong}
          onClose={handleCloseSongModal}
          onSave={handleSaveSong}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  filtersSection: {
    marginBottom: 24,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  songsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  songsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});