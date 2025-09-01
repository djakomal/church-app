import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function StatusSection() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Votre Statut
      </ThemedText>
      
      <View style={styles.statusInfo}>
        <ThemedText style={[styles.statusLabel, { color: textColor }]}>
          Statut actuel: En attente
        </ThemedText>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.confirmButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="checkmark" size={16} color="white" />
          <ThemedText style={styles.buttonText}>
            Confirmer Présence
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.absentButton, { borderColor: accentColor }]}>
          <Ionicons name="close" size={16} color={accentColor} />
          <ThemedText style={[styles.buttonText, { color: accentColor }]}>
            Confirmer Absence
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.songsButton, { backgroundColor: secondaryColor }]}>
          <Ionicons name="list" size={16} color="white" />
          <ThemedText style={styles.buttonText}>
            Voir Mes Chants (Mobile)
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusInfo: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {
    // Primary blue background
  },
  absentButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  songsButton: {
    // Secondary gray background
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
