import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function AttendanceConfirmation() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Confirmation de Présence
      </ThemedText>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.confirmButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="checkmark" size={16} color="white" />
          <ThemedText style={styles.buttonText}>
            Confirmer
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.absentButton, { borderColor: accentColor }]}>
          <Ionicons name="close" size={16} color={accentColor} />
          <ThemedText style={[styles.buttonText, { color: accentColor }]}>
            Absence
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
