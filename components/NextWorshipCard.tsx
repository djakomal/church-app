import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function NextWorshipCard() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const iconColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Prochain Culte
        </ThemedText>
        <TouchableOpacity style={[styles.checkIcon, { backgroundColor: successColor }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color={iconColor} />
          <ThemedText style={[styles.detailText, { color: textColor }]}>
            Samedi 10 Août 2024
          </ThemedText>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={iconColor} />
          <ThemedText style={[styles.detailText, { color: textColor }]}>
            10:00 - 12:00
          </ThemedText>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color={iconColor} />
          <ThemedText style={[styles.detailText, { color: textColor }]}>
            Église de la Grâce, Salle Principale
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
