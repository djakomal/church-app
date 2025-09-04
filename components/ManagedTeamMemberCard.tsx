import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ManagedTeamMemberCardProps {
  name: string;
  role: string;
  status: 'confirmed' | 'pending' | 'absent' | 'late';
  avatarUrl?: string;
  phone?: string;
  email?: string;
  lastConfirmation?: Date;
  onRoleChange: (newRole: string) => void;
  onStatusChange?: (newStatus: 'confirmed' | 'pending' | 'absent' | 'late') => void;
  onSendReminder?: () => void;
}

const roles = ['Vocaliste', 'Pianiste', 'Guitariste', 'Batteur', 'Bassiste', 'Chef de louange', 'Technicien son', 'Projectionniste'];

export function ManagedTeamMemberCard({ 
  name, 
  role, 
  status, 
  avatarUrl,
  phone,
  email,
  lastConfirmation,
  onRoleChange,
  onStatusChange,
  onSendReminder
}: ManagedTeamMemberCardProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const warningColor = useThemeColor({}, 'warning');
  
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return useThemeColor({}, 'success');
      case 'pending':
        return useThemeColor({}, 'warning');
      case 'absent':
        return useThemeColor({}, 'error');
      case 'late':
        return warningColor;
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
      case 'late':
        return 'En retard';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const handleStatusChange = (newStatus: 'confirmed' | 'pending' | 'absent' | 'late') => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowStatusDropdown(false);
  };

  const handleSendReminder = () => {
    Alert.alert(
      'Envoyer un rappel',
      `Voulez-vous envoyer un rappel à ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: () => {
            if (onSendReminder) {
              onSendReminder();
            }
            Alert.alert('Rappel envoyé', `Un rappel a été envoyé à ${name}`);
          }
        }
      ]
    );
  };

  const formatLastConfirmation = () => {
    if (!lastConfirmation) return 'Jamais confirmé';
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastConfirmation.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.mainInfo}>
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
          
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <Ionicons name={getStatusIcon()} size={12} color="white" />
            <ThemedText style={styles.statusText}>
              {getStatusText()}
            </ThemedText>
          </TouchableOpacity>
          
          {showStatusDropdown && (
            <View style={[styles.statusDropdown, { backgroundColor, borderColor }]}>
              {(['confirmed', 'pending', 'absent', 'late'] as const).map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={styles.dropdownItem}
                  onPress={() => handleStatusChange(statusOption)}
                >
                  <Ionicons 
                    name={statusOption === 'confirmed' ? 'checkmark-circle' : 
                          statusOption === 'pending' ? 'time' : 
                          statusOption === 'absent' ? 'close-circle' : 'warning'} 
                    size={16} 
                    color={statusOption === 'confirmed' ? useThemeColor({}, 'success') : 
                           statusOption === 'pending' ? useThemeColor({}, 'warning') : 
                           statusOption === 'absent' ? useThemeColor({}, 'error') : warningColor} 
                  />
                  <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                    {statusOption === 'confirmed' ? 'Confirmé' : 
                     statusOption === 'pending' ? 'En attente' : 
                     statusOption === 'absent' ? 'Absent' : 'En retard'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.contactInfo}>
              {phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={14} color={useThemeColor({}, 'secondary')} />
                  <ThemedText style={[styles.contactText, { color: useThemeColor({}, 'secondary') }]}>
                    {phone}
                  </ThemedText>
                </View>
              )}
              {email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={14} color={useThemeColor({}, 'secondary')} />
                  <ThemedText style={[styles.contactText, { color: useThemeColor({}, 'secondary') }]}>
                    {email}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.confirmationInfo}>
              <ThemedText style={[styles.confirmationLabel, { color: textColor }]}>
                Dernière confirmation:
              </ThemedText>
              <ThemedText style={[styles.confirmationText, { color: useThemeColor({}, 'secondary') }]}>
                {formatLastConfirmation()}
              </ThemedText>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: primaryColor }]}
                onPress={handleSendReminder}
              >
                <Ionicons name="notifications" size={16} color="white" />
                <ThemedText style={styles.actionButtonText}>Rappel</ThemedText>
              </TouchableOpacity>
              
              {phone && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: useThemeColor({}, 'success') }]}
                  onPress={() => Alert.alert('Appel', `Appeler ${name} au ${phone}`)}
                >
                  <Ionicons name="call" size={16} color="white" />
                  <ThemedText style={styles.actionButtonText}>Appeler</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  cardContent: {
    padding: 12,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    minWidth: 150,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
  },
  confirmationInfo: {
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  confirmationText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
