import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatMessageProps {
  message: string;
  time: string;
  isOwnMessage: boolean;
  senderName?: string;
  avatarInitial?: string;
}

export function ChatMessage({ 
  message, 
  time, 
  isOwnMessage, 
  senderName, 
  avatarInitial 
}: ChatMessageProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const lightGrayColor = useThemeColor({}, 'lightGray');

  return (
    <View style={[
      styles.container, 
      { justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }
    ]}>
      <View style={styles.messageContainer}>
        {!isOwnMessage && (
          <View style={[styles.avatar, { backgroundColor: lightGrayColor }]}>
            <ThemedText style={[styles.avatarText, { color: useThemeColor({}, 'secondary') }]}>
              {avatarInitial || senderName?.charAt(0) || '?'}
            </ThemedText>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          { 
            backgroundColor: isOwnMessage ? primaryColor : lightGrayColor,
            marginLeft: isOwnMessage ? 0 : 8,
            marginRight: isOwnMessage ? 8 : 0,
          }
        ]}>
          {!isOwnMessage && senderName && (
            <ThemedText style={[styles.senderName, { color: useThemeColor({}, 'secondary') }]}>
              {senderName}
            </ThemedText>
          )}
          <ThemedText style={[
            styles.messageText, 
            { color: isOwnMessage ? 'white' : textColor }
          ]}>
            {message}
          </ThemedText>
          <ThemedText style={[
            styles.timeText, 
            { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : useThemeColor({}, 'secondary') }
          ]}>
            {time}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
});
