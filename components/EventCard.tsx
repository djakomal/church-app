import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function EventCard() {
  const backgroundColor = useThemeColor({}, 'mediumGray');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <ThemedText style={[styles.date, { color: textColor }]}>
        Dimanche 24 Mars
      </ThemedText>
      <ThemedText style={[styles.time, { color: textColor }]}>
        10:00 - 12:00
      </ThemedText>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Culte de la Résurrection
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
