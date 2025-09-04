import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TeamMemberCardProps {
  id: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
  onCall?: () => void;
  onMessage?: () => void;
}

export function TeamMemberCard({ 
  id,
  name, 
  role, 
  phone,
  email,
  avatarUrl,
  onEdit,
  onDelete,
  onCall,
  onMessage
}: TeamMemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const secondaryColor = useThemeColor({}, 'secondary');

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le membre',
      `Êtes-vous sûr de vouloir supprimer ${name} de l'équipe ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  const handleCall = () => {
    if (phone) {
      Alert.alert(
        'Appeler',
        `Appeler ${name} au ${phone} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Appeler', 
            onPress: () => {
              if (onCall) onCall();
              // Ici vous pourriez implémenter l'ouverture de l'app téléphone
            }
          }
        ]
      );
    }
  };

  const handleMessage = () => {
    if (phone) {
      Alert.alert(
        'Envoyer un SMS',
        `Envoyer un message à ${name} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Envoyer', 
            onPress: () => {
              if (onMessage) onMessage();
              // Ici vous pourriez implémenter l'ouverture de l'app SMS
            }
          }
        ]
      );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'vocaliste':
      case 'chef de louange':
      case 'choriste':
        return 'mic';
      case 'pianiste':
        return 'musical-notes';
      case 'guitariste':
      case 'bassiste':
        return 'musical-note';
      case 'batteur':
        return 'radio';
      case 'technicien son':
        return 'volume-high';
      case 'projectionniste':
        return 'tv';
      default:
        return 'musical-notes';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'vocaliste':
      case 'chef de louange':
        return primaryColor;
      case 'pianiste':
        return successColor;
      case 'guitariste':
      case 'bassiste':
        return accentColor;
      case 'batteur':
        return '#ff6b6b';
      case 'technicien son':
        return '#4ecdc4';
      case 'projectionniste':
        return '#45b7d1';
      default:
        return secondaryColor;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.mainInfo}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(role) }]}>
                <Ionicons name={getRoleIcon(role)} size={20} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.info}>
            <ThemedText style={[styles.name, { color: textColor }]}>
              {name}
            </ThemedText>
            <View style={styles.roleContainer}>
              <Ionicons name={getRoleIcon(role)} size={14} color={getRoleColor(role)} />
              <ThemedText style={[styles.role, { color: getRoleColor(role) }]}>
                {role}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={onEdit}
            >
              <Ionicons name="create" size={16} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: accentColor }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Informations de contact */}
            <View style={styles.contactInfo}>
              {phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={14} color={secondaryColor} />
                  <ThemedText style={[styles.contactText, { color: secondaryColor }]}>
                    {phone}
                  </ThemedText>
                </View>
              )}
              {email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={14} color={secondaryColor} />
                  <ThemedText style={[styles.contactText, { color: secondaryColor }]}>
                    {email}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {/* Actions de contact */}
            {(phone || email) && (
              <View style={styles.contactActions}>
                {phone && (
                  <>
                    <TouchableOpacity 
                      style={[styles.contactActionButton, { backgroundColor: successColor }]}
                      onPress={handleCall}
                    >
                      <Ionicons name="call" size={16} color="white" />
                      <ThemedText style={styles.contactActionText}>Appeler</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.contactActionButton, { backgroundColor: '#4ecdc4' }]}
                      onPress={handleMessage}
                    >
                      <Ionicons name="chatbubble" size={16} color="white" />
                      <ThemedText style={styles.contactActionText}>SMS</ThemedText>
                    </TouchableOpacity>
                  </>
                )}
                
                {email && (
                  <TouchableOpacity 
                    style={[styles.contactActionButton, { backgroundColor: '#45b7d1' }]}
                    onPress={() => Alert.alert('Email', `Envoyer un email à ${email}`)}
                  >
                    <Ionicons name="mail" size={16} color="white" />
                    <ThemedText style={styles.contactActionText}>Email</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Informations sur le rôle */}
            <View style={styles.roleInfo}>
              <ThemedText style={[styles.roleInfoTitle, { color: textColor }]}>
                Responsabilités :
              </ThemedText>
              <ThemedText style={[styles.roleInfoText, { color: secondaryColor }]}>
                {getRoleDescription(role)}
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function getRoleDescription(role: string): string {
  switch (role.toLowerCase()) {
    case 'vocaliste':
      return 'Chant principal, harmonies vocales';
    case 'chef de louange':
      return 'Direction musicale, animation du culte';
    case 'pianiste':
      return 'Accompagnement piano, direction harmonique';
    case 'guitariste':
      return 'Guitare rythmique et mélodique';
    case 'bassiste':
      return 'Ligne de basse, fondation rythmique';
    case 'batteur':
      return 'Rythme, tempo, dynamique musicale';
    case 'choriste':
      return 'Chœurs, harmonies vocales';
    case 'technicien son':
      return 'Mixage, sonorisation, technique audio';
    case 'projectionniste':
      return 'Projection paroles, visuels, présentation';
    default:
      return 'Membre de l\'équipe musicale';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  role: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
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
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  contactActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  roleInfo: {
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  roleInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});