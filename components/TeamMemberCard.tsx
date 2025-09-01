import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TeamMemberCardProps {
  name: string;
  role: string;
  status: 'confirmed' | 'pending' | 'absent';
  avatarUrl?: string;
}

export function TeamMemberCard({ name, role, status, avatarUrl }: TeamMemberCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return useThemeColor({}, 'success');
      case 'pending':
        return useThemeColor({}, 'warning');
      case 'absent':
        return useThemeColor({}, 'error');
      default:
        return useThemeColor({}, 'secondary');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'absent':
        return 'Absent';
      default:
        return 'Inconnu';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: useThemeColor({}, 'lightGray') }]}>
            <ThemedText style={[styles.avatarText, { color: useThemeColor({}, 'secondary') }]}>
              {name.charAt(0)}
            </ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <ThemedText style={[styles.name, { color: textColor }]}>
          {name}
        </ThemedText>
        <ThemedText style={[styles.role, { color: useThemeColor({}, 'secondary') }]}>
          {role}
        </ThemedText>
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <ThemedText style={styles.statusText}>
          {getStatusText()}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});
