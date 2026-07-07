import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { messagesApi, Message } from '@/api/messages';

interface ChatPanelProps {
  discussionId: string;
  discussionTitle: string;
  userId?: string;
  userName?: string;
}

export function ChatPanel({ discussionId, discussionTitle, userId, userName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getAll(discussionId);
      setMessages(data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async (newMessage: string) => {
    try {
      const msg = await messagesApi.create({
        discussionId,
        message: newMessage,
        senderName: userName || '',
        userId: userId || '',
      });
      setMessages(prev => [...prev, msg]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
        {loading ? (
          <ThemedText style={[styles.loadingText, { color: textColor }]}>Chargement...</ThemedText>
        ) : messages.length === 0 ? (
          <ThemedText style={[styles.loadingText, { color: textColor }]}>Aucun message</ThemedText>
        ) : messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            time={formatTime(msg.created_at)}
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
