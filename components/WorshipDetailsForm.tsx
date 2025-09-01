import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function WorshipDetailsForm() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  const [title, setTitle] = useState('Service de Noël');
  const [date, setDate] = useState('2024-12-25');
  const [time, setTime] = useState('10:00');

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Détails du Culte
      </ThemedText>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: textColor }]}>
            Titre du Culte
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Entrez le titre du culte"
            placeholderTextColor={placeholderColor}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: textColor }]}>
            Date
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={placeholderColor}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: textColor }]}>
            Heure
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
            placeholderTextColor={placeholderColor}
          />
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.saveButtonText}>
            Enregistrer les modifications
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
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
