import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ManagedTeamMemberCardProps {
  name: string;
  role: string;
  status: 'confirmed' | 'pending' | 'absent';
  avatarUrl?: string;
  onRoleChange: (newRole: string) => void;
}

const roles = ['Vocaliste', 'Pianiste', 'Guitariste', 'Batteur', 'Bassiste', 'Chef de louange'];

export function ManagedTeamMemberCard({ 
  name, 
  role, 
  status, 
  avatarUrl, 
  onRoleChange 
}: ManagedTeamMemberCardProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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
        
        <TouchableOpacity 
          style={styles.roleContainer}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
        >
          <ThemedText style={[styles.role, { color: useThemeColor({}, 'secondary') }]}>
            {role}
          </ThemedText>
          <Ionicons name="chevron-down" size={16} color={useThemeColor({}, 'secondary')} />
        </TouchableOpacity>
        
        {showRoleDropdown && (
          <View style={[styles.dropdown, { backgroundColor, borderColor }]}>
            {roles.map((roleOption) => (
              <TouchableOpacity
                key={roleOption}
                style={styles.dropdownItem}
                onPress={() => {
                  onRoleChange(roleOption);
                  setShowRoleDropdown(false);
                }}
              >
                <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                  {roleOption}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  role: {
    fontSize: 14,
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownText: {
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
