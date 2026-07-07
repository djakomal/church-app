import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useT } from '@/context/I18nContext';
import { useSongs } from '@/hooks/useSimpleDatabase';

interface Song {
  id?: number;
  title: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  category: string;
  notes: string;
  lyrics: string;
  audio_url: string;
}

interface SongPickerModalProps {
  visible: boolean;
  selectedTitles: string[];
  onClose: () => void;
  onSave: (titles: string[], ids: number[]) => void;
}

export function SongPickerModal({ visible, selectedTitles, onClose, onSave }: SongPickerModalProps) {
  const t = useT();
  const { songs, isLoading } = useSongs();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');

  useEffect(() => {
    if (visible) {
      const ids = new Set<number>();
      songs.forEach(s => {
        if (selectedTitles.includes(s.title)) {
          ids.add(s.id!);
        }
      });
      setSelectedIds(ids);
      setSearch('');
    }
  }, [visible, songs, selectedTitles]);

  const toggleSong = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    const selected = songs.filter(s => selectedIds.has(s.id!));
    onSave(
      selected.map(s => s.title),
      selected.map(s => s.id!)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {t('songPickerModal.title')}
          </ThemedText>
          <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.saveButtonText}>
              {t('save')} ({selectedIds.size})
            </ThemedText>
          </Pressable>
        </View>

        <View style={[styles.searchContainer, { borderColor, backgroundColor: cardColor }]}>
          <Ionicons name="search" size={20} color={secondaryColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('songPickerModal.searchPlaceholder')}
            placeholderTextColor={secondaryColor}
          />
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ThemedText style={{ color: secondaryColor }}>{t('common.loading')}</ThemedText>
          </View>
        ) : filteredSongs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={48} color={secondaryColor} />
            <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
              {search ? t('songPickerModal.noResults') : t('songPickerModal.empty')}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => String(item.id!)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id!);
              return (
                <TouchableOpacity
                  style={[styles.songItem, { borderColor }, isSelected && { backgroundColor: primaryColor + '15' }]}
                  onPress={() => toggleSong(item.id!)}
                >
                  <View style={styles.songInfo}>
                    <ThemedText style={[styles.songTitle, { color: textColor }]}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[styles.songArtist, { color: secondaryColor }]}>
                      {item.artist}
                    </ThemedText>
                  </View>
                  <View style={[styles.checkbox, isSelected && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, minHeight: 24 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: '500' },
  songArtist: { fontSize: 13, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
