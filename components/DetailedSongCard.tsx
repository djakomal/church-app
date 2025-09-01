import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DetailedSongCardProps {
  number: number;
  title: string;
  subtitle?: string;
  keySignature: string;
}

export function DetailedSongCard({ number, title, subtitle, keySignature }: DetailedSongCardProps) {
  const [showActions, setShowActions] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({}, 'secondary');

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <ThemedText style={[styles.number, { color: textColor }]}>
            {number}.
          </ThemedText>
          <View style={styles.titleSection}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText style={[styles.subtitle, { color: useThemeColor({}, 'secondary') }]}>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.keyBadge, { backgroundColor: primaryColor }]}
          onPress={() => setShowActions(!showActions)}
        >
          <ThemedText style={styles.keyText}>{keySignature}</ThemedText>
        </TouchableOpacity>
      </View>
      
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="musical-notes" size={16} color={iconColor} />
            <ThemedText style={[styles.actionText, { color: textColor }]}>Accords</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={16} color={iconColor} />
            <ThemedText style={[styles.actionText, { color: textColor }]}>Paroles</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="musical-note" size={16} color={iconColor} />
            <ThemedText style={[styles.actionText, { color: textColor }]}>Partition</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="play" size={16} color={iconColor} />
            <ThemedText style={[styles.actionText, { color: textColor }]}>Audio</ThemedText>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  keyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
