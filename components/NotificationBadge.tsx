import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium';
}

export function NotificationBadge({ count, size = 'small' }: NotificationBadgeProps) {
  const accentColor = useThemeColor({}, 'accent');
  
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const badgeSize = size === 'small' ? 18 : 22;
  const fontSize = size === 'small' ? 10 : 12;

  return (
    <View style={[
      styles.badge, 
      { 
        backgroundColor: accentColor,
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2
      }
    ]}>
      <ThemedText style={[styles.badgeText, { fontSize }]}>
        {displayCount}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});