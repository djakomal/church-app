import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function QuickCommunication() {
  const [message, setMessage] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Communication rapide
      </ThemedText>
      
      <View style={styles.form}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          Message à envoyer
        </ThemedText>
        
        <TextInput
          style={[styles.textArea, { backgroundColor, borderColor, color: textColor }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Écrivez votre message ici pour toute l'équipe..."
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.sendButtonText}>
            Envoyer la Notification
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
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
