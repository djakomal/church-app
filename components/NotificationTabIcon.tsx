import { useNotifications } from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { NotificationBadge } from './NotificationBadge';

interface NotificationTabIconProps {
  color: string;
  size: number;
}

export function NotificationTabIcon({ color, size }: NotificationTabIconProps) {
  const { unreadCount } = useNotifications();

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="chatbubbles" size={size} color={color} />
      <NotificationBadge count={unreadCount} />
    </View>
  );
}