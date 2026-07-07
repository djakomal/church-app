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
import { useT } from '@/context/I18nContext';
import { Song } from '@/database/simpleDatabase';
import { useSongs } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

export default function SongsScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState('mes-chants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('songs.all'));
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

  const allLabel = t('songs.all');
  const categories = [allLabel, t('songs.praise'), t('songs.adoration'), t('songs.celebration'), t('songs.invocation')];

  // Filtrer les chants
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === allLabel || song.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSong = () => {
    if (!canManageSongs) {
      Alert.alert(t('error.generic'), t('songs.add'));
      return;
    }
    setEditingSong(null);
    setShowSongModal(true);
  };

  const handleEditSong = (id: number) => {
    if (!canManageSongs) {
      Alert.alert(t('error.generic'), t('songs.edit'));
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
      Alert.alert(t('error.generic'), t('songs.delete'));
      return;
    }
    try {
      await deleteSong(id);
      Alert.alert(t('songs.title'), t('songs.delete'));
    } catch (error) {
      Alert.alert(t('error.generic'), t('songs.delete'));
    }
  };

  const handleSaveSong = async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSong && editingSong.id) {
        await updateSong(editingSong.id, songData);
        Alert.alert(t('songs.title'), t('songs.edit'));
      } else {
        await createSong(songData);
        Alert.alert(t('songs.title'), t('songs.add'));
      }
      setShowSongModal(false);
      setEditingSong(null);
    } catch (error) {
      Alert.alert(t('error.generic'), t('save'));
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
            {t('error.generic')}
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
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View style={styles.content}>
            {/* Page title */}
            <View style={styles.titleSection}>
              <ThemedText style={[styles.pageTitle, { color: textColor }]}>
                {t('songs.title')}
              </ThemedText>
              <ThemedText style={[styles.pageSubtitle, { color: secondaryColor }]}>
                {canManageSongs ? t('songs.add') : t('songs.title')}
              </ThemedText>
            </View>

            {/* Search and filters */}
            <View style={styles.filtersSection}>
              <View style={[styles.searchContainer, { backgroundColor: useThemeColor({}, 'lightGray') }]}>
                <Ionicons name="search" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder={t('songs.search')}
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
                    {t('songs.add')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Songs list */}
            <View style={styles.songsSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  {filteredSongs.length} chant{filteredSongs.length > 1 ? 's' : ''} 
                  {selectedCategory !== allLabel && ` - ${selectedCategory}`}
                  {searchQuery && ` ${t('songs.search')} "${searchQuery}"`}
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
                    {songs.length === 0 ? t('songs.noSongs') : t('songs.noResults')}
                  </ThemedText>
                  <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                    {canManageSongs && songs.length === 0
                      ? t('songs.add')
                      : t('songs.search')}
                  </ThemedText>
                  {canManageSongs && songs.length === 0 && (
                    <TouchableOpacity 
                      style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                      onPress={handleAddSong}
                    >
                      <Ionicons name="add" size={20} color="white" />
                      <ThemedText style={styles.emptyButtonText}>
                        {t('songs.add')}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Permission info for viewers */}

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
    fontSize: 28,
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
    paddingVertical: 12,
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
    paddingVertical: 14,
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
