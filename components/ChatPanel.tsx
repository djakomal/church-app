import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatPanelProps {
  discussionTitle: string;
}

export function ChatPanel({ discussionTitle }: ChatPanelProps) {
  const [messages, setMessages] = useState([
    { id: 1, message: 'Bonjour à tous, j\'espère que tout le monde va bien!', time: '10:00', isOwnMessage: true },
    { id: 2, message: 'Super! Hâte de voir le nouveau répertoire.', time: '10:05', isOwnMessage: false, senderName: 'Sophie Dupont' },
    { id: 3, message: 'Merci à tous pour la répétition d\'hier soir, c\'était très productif!', time: '10:15', isOwnMessage: false, senderName: 'David Martin' },
    { id: 4, message: 'Oui, le Seigneur était avec nous. J\'ai hâte pour dimanche!', time: '10:20', isOwnMessage: true },
  ]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const handleSendMessage = (newMessage: string) => {
    const newMsg = {
      id: messages.length + 1,
      message: newMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: true,
    };
    setMessages([...messages, newMsg]);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {discussionTitle}
        </ThemedText>
        <TouchableOpacity style={[styles.optionsButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            time={msg.time}
            isOwnMessage={msg.isOwnMessage}
            senderName={msg.senderName}
          />
        ))}
      </ScrollView>

      <ChatInput onSendMessage={handleSendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
});
