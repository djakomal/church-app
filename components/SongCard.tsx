import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SongCardProps {
  title: string;
  artist: string;
  keySignature: string;
  tempo: string;
  duration: string;
  category: string;
  notes?: string;
  lyrics?: string;
}

export function SongCard({ 
  title, 
  artist, 
  keySignature, 
  tempo, 
  duration, 
  category,
  notes,
  lyrics
}: SongCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'louange': return primaryColor;
      case 'adoration': return accentColor;
      case 'célébration': return successColor;
      case 'invocation': return warningColor;
      default: return secondaryColor;
    }
  };

  const getTempoIcon = (tempo: string) => {
    switch (tempo.toLowerCase()) {
      case 'slow': return 'remove';
      case 'medium': return 'pause';
      case 'fast': return 'play';
      default: return 'musical-note';
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
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
                <ThemedText style={styles.categoryText}>
                  {category}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={[styles.artist, { color: secondaryColor }]}>
              par {artist}
            </ThemedText>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="key" size={14} color={primaryColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {keySignature}
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name={getTempoIcon(tempo)} size={14} color={primaryColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {tempo}
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="time" size={14} color={primaryColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {duration}
                </ThemedText>
              </View>
            </View>

            {notes && (
              <View style={styles.notesRow}>
                <Ionicons name="document-text" size={14} color={secondaryColor} />
                <ThemedText style={[styles.notesText, { color: secondaryColor }]}>
                  {notes}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.expandIcon}>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={secondaryColor} 
            />
          </View>
        </View>

        {isExpanded && lyrics && (
          <View style={styles.expandedContent}>
            <View style={styles.lyricsSection}>
              <View style={styles.lyricsTitleRow}>
                <Ionicons name="musical-notes" size={16} color={primaryColor} />
                <ThemedText style={[styles.lyricsTitle, { color: textColor }]}>
                  Paroles :
                </ThemedText>
              </View>
              <ThemedText style={[styles.lyricsText, { color: textColor }]}>
                {lyrics}
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
    marginBottom: 8,
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
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  artist: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  expandIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  lyricsSection: {
    marginBottom: 12,
  },
  lyricsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  lyricsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  lyricsText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
});