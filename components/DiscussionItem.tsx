import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DiscussionItemProps {
  title: string;
  icon: string;
  time: string;
  isSelected?: boolean;
  hasNewMessages?: boolean;
  hasUrgentAlert?: boolean;
  onPress: () => void;
}

export function DiscussionItem({ 
  title, 
  icon, 
  time, 
  isSelected = false, 
  hasNewMessages = false, 
  hasUrgentAlert = false,
  onPress 
}: DiscussionItemProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const selectedBackgroundColor = useThemeColor({}, 'lightGray');
  const iconColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: isSelected ? selectedBackgroundColor : backgroundColor }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
        </View>
        
        <View style={styles.rightSection}>
          {hasNewMessages && (
            <View style={[styles.indicator, { backgroundColor: successColor }]} />
          )}
          {hasUrgentAlert && (
            <Ionicons name="warning" size={16} color={warningColor} />
          )}
          <ThemedText style={[styles.time, { color: useThemeColor({}, 'secondary') }]}>
            {time}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
  },
});
