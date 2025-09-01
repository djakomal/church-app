import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ManagedSongCardProps {
  title: string;
  artist: string;
  keySignature: string;
  tempo: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ManagedSongCard({ 
  title, 
  artist, 
  keySignature, 
  tempo, 
  onEdit, 
  onDelete 
}: ManagedSongCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const iconColor = useThemeColor({}, 'secondary');

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.content}>
        <View style={styles.songInfo}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.artist, { color: useThemeColor({}, 'secondary') }]}>
            {artist}
          </ThemedText>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="musical-note" size={14} color={iconColor} />
              <ThemedText style={[styles.detailText, { color: textColor }]}>
                {keySignature}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={14} color={iconColor} />
              <ThemedText style={[styles.detailText, { color: textColor }]}>
                {tempo}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={onEdit}
          >
            <Ionicons name="create" size={16} color="white" />
            <ThemedText style={styles.actionText}>Modifier</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: accentColor }]}
            onPress={onDelete}
          >
            <Ionicons name="trash" size={16} color="white" />
            <ThemedText style={styles.actionText}>Supprimer</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
