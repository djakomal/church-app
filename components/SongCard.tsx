import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SongCardProps {
  number: number;
  title: string;
  keySignature: string;
  tempo: string;
}

export function SongCard({ number, title, keySignature, tempo }: SongCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const iconColor = useThemeColor({}, 'secondary');

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.number, { color: textColor }]}>
          {number}.
        </ThemedText>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {title}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={iconColor} />
      </View>
      
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    minWidth: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
    color: '#64748b',
  },
});
