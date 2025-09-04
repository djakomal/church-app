import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface WorshipCardProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location?: string;
  theme?: string;
  preacher?: string;
  songs?: string[];
  musicians?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function WorshipCard({
  id,
  title,
  date,
  time,
  location,
  theme,
  preacher,
  songs,
  musicians,
  onEdit,
  onDelete,
  onView
}: WorshipCardProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    const worshipDate = new Date(date);
    const now = new Date();
    
    if (worshipDate < now) {
      return '#6b7280'; // Passé - gris
    } else if (worshipDate.toDateString() === now.toDateString()) {
      return successColor; // Aujourd'hui - vert
    } else {
      return primaryColor; // Futur - bleu
    }
  };

  const getStatusText = () => {
    const worshipDate = new Date(date);
    const now = new Date();
    
    if (worshipDate < now) {
      return 'Terminé';
    } else if (worshipDate.toDateString() === now.toDateString()) {
      return 'Aujourd\'hui';
    } else {
      return 'À venir';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor, borderColor }]}
      onPress={onView}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText()}
            </ThemedText>
          </View>
        </View>
        
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={[styles.actionButton, { backgroundColor: primaryColor }]}
              >
                <Ionicons name="pencil" size={14} color="white" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={[styles.actionButton, { backgroundColor: errorColor }]}
              >
                <Ionicons name="trash" size={14} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar" size={16} color={secondaryColor} />
            <ThemedText style={[styles.dateText, { color: textColor }]}>
              {formatDate(date)}
            </ThemedText>
          </View>
          <View style={styles.dateTime}>
            <Ionicons name="time" size={16} color={secondaryColor} />
            <ThemedText style={[styles.timeText, { color: textColor }]}>
              {time}
            </ThemedText>
          </View>
        </View>

        {location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={secondaryColor} />
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              {location}
            </ThemedText>
          </View>
        )}

        {theme && (
          <View style={styles.infoRow}>
            <Ionicons name="book" size={16} color={secondaryColor} />
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              Thème: {theme}
            </ThemedText>
          </View>
        )}

        {preacher && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={secondaryColor} />
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              Prédicateur: {preacher}
            </ThemedText>
          </View>
        )}

        {songs && songs.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="musical-notes" size={16} color={secondaryColor} />
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              {songs.length} chant{songs.length > 1 ? 's' : ''}: {songs.slice(0, 2).join(', ')}
              {songs.length > 2 && '...'}
            </ThemedText>
          </View>
        )}

        {musicians && musicians.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="people" size={16} color={secondaryColor} />
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              {musicians.length} musicien{musicians.length > 1 ? 's' : ''}: {musicians.slice(0, 2).join(', ')}
              {musicians.length > 2 && '...'}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
});