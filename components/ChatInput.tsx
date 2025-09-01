import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={message}
        onChangeText={setMessage}
        placeholder="Écrivez un message..."
        placeholderTextColor={placeholderColor}
        multiline
        maxLength={500}
      />
      <TouchableOpacity 
        style={[styles.sendButton, { backgroundColor: primaryColor }]}
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Ionicons name="paper-plane" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
