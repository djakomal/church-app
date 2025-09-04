import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WorshipCardProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme?: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function WorshipCard({ 
  id,
  title, 
  date, 
  time, 
  location, 
  theme,
  description,
  onEdit,
  onDelete,
  onDuplicate
}: WorshipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const secondaryColor = useThemeColor({}, 'secondary');

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le culte',
      `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      Alert.alert(
        'Dupliquer le culte',
        `Créer une copie de "${title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Dupliquer', 
            onPress: onDuplicate
          }
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = () => {
    const now = new Date();
    const worshipDate = new Date(`${date}T${time}`);
    
    if (worshipDate < now) {
      return '#6b7280'; // Passé - gris
    } else if (worshipDate.toDateString() === now.toDateString()) {
      return successColor; // Aujourd'hui - vert
    } else {
      return primaryColor; // Futur - bleu
    }
  };

  const getStatusText = () => {
    const now = new Date();
    const worshipDate = new Date(`${date}T${time}`);
    
    if (worshipDate < now) {
      return 'Terminé';
    } else if (worshipDate.toDateString() === now.toDateString()) {
      return 'Aujourd\'hui';
    } else {
      const diffTime = worshipDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location.toLowerCase()) {
      case 'sanctuaire principal':
        return 'business';
      case 'chapelle':
        return 'home';
      case 'salle de conférence':
        return 'people';
      case 'amphithéâtre':
        return 'library';
      case 'extérieur - jardin':
        return 'leaf';
      default:
        return 'location';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.mainInfo}>
          <View style={styles.leftContent}>
            <View style={styles.titleRow}>
              <ThemedText style={[styles.title, { color: textColor }]}>
                {title}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusText()}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Ionicons name="calendar" size={16} color={primaryColor} />
                <ThemedText style={[styles.dateTimeText, { color: textColor }]}>
                  {formatDate(date)}
                </ThemedText>
              </View>
              <View style={styles.dateTimeItem}>
                <Ionicons name="time" size={16} color={primaryColor} />
                <ThemedText style={[styles.dateTimeText, { color: textColor }]}>
                  {formatTime(time)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name={getLocationIcon(location)} size={16} color={secondaryColor} />
              <ThemedText style={[styles.locationText, { color: secondaryColor }]}>
                {location}
              </ThemedText>
            </View>

            {theme && (
              <View style={styles.themeRow}>
                <Ionicons name="bookmark" size={16} color={accentColor} />
                <ThemedText style={[styles.themeText, { color: accentColor }]}>
                  {theme}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={onEdit}
            >
              <Ionicons name="create" size={16} color="white" />
            </TouchableOpacity>
            
            {onDuplicate && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: successColor }]}
                onPress={handleDuplicate}
              >
                <Ionicons name="copy" size={16} color="white" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: accentColor }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && description && (
          <View style={styles.expandedContent}>
            <View style={styles.descriptionSection}>
              <ThemedText style={[styles.descriptionTitle, { color: textColor }]}>
                Description :
              </ThemedText>
              <ThemedText style={[styles.descriptionText, { color: secondaryColor }]}>
                {description}
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});