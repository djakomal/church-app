import { useAuth } from '@/context/AuthContext';
import { useSongs, useTeamMembers } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';

interface ActivityItem {
  id: string;
  type: 'worship' | 'notification' | 'song' | 'member';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'scheduled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export function DashboardOverview() {
  const { user, hasPermission } = useAuth();
  const { songs } = useSongs();
  const { teamMembers } = useTeamMembers();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  // Données simulées pour les activités récentes
  const [recentActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'worship',
      title: 'Culte du Dimanche créé',
      description: 'Nouveau culte programmé pour le 22 décembre à 10h00',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'notification',
      title: 'Notification envoyée',
      description: 'Rappel de répétition envoyé aux musiciens',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'song',
      title: 'Nouveau chant ajouté',
      description: 'Amazing Grace ajouté au répertoire',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '4',
      type: 'member',
      title: 'Nouveau membre d\'équipe',
      description: 'Jean Dupont ajouté comme pianiste',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '5',
      type: 'notification',
      title: 'Notification programmée',
      description: 'Rappel de culte programmé pour demain matin',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      priority: 'high'
    }
  ]);

  // Statistiques
  const stats = {
    totalSongs: songs.length,
    totalMembers: teamMembers.length,
    upcomingWorships: 3, // Simulé
    pendingNotifications: 2, // Simulé
    thisWeekActivities: recentActivities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return activityDate >= weekAgo;
    }).length
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'worship': return 'calendar';
      case 'notification': return 'notifications';
      case 'song': return 'musical-notes';
      case 'member': return 'person-add';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'worship': return primaryColor;
      case 'notification': return warningColor;
      case 'song': return successColor;
      case 'member': return '#8b5cf6';
      default: return secondaryColor;
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'completed': return successColor;
      case 'pending': return warningColor;
      case 'scheduled': return primaryColor;
      default: return secondaryColor;
    }
  };

  const getPriorityColor = (priority?: ActivityItem['priority']) => {
    switch (priority) {
      case 'urgent': return errorColor;
      case 'high': return '#f97316';
      case 'medium': return warningColor;
      case 'low': return successColor;
      default: return secondaryColor;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return time.toLocaleDateString('fr-FR');
  };

  const quickActions = [
    {
      id: 'new-worship',
      title: 'Nouveau Culte',
      icon: 'add-circle',
      color: primaryColor,
      action: () => router.push('/(tabs)/admin'),
      permission: 'canManageWorship'
    },
    {
      id: 'send-notification',
      title: 'Notification',
      icon: 'send',
      color: warningColor,
      action: () => router.push('/(tabs)/admin'),
      permission: 'canSendCommunications'
    },
    {
      id: 'add-song',
      title: 'Ajouter Chant',
      icon: 'musical-note',
      color: successColor,
      action: () => router.push('/(tabs)/songs'),
      permission: 'canManageSongs'
    },
    {
      id: 'manage-team',
      title: 'Gérer Équipe',
      icon: 'people',
      color: '#8b5cf6',
      action: () => router.push('/(tabs)/admin'),
      permission: 'canManageTeam'
    }
  ];

  const availableActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission as any)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="musical-notes" size={24} color={successColor} />
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.totalSongs}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
            Chants
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="people" size={24} color="#8b5cf6" />
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.totalMembers}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
            Musiciens
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="calendar" size={24} color={primaryColor} />
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.upcomingWorships}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
            Cultes à venir
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="trending-up" size={24} color={warningColor} />
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.thisWeekActivities}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
            Cette semaine
          </ThemedText>
        </View>
      </View>

      {/* Actions rapides */}
      {availableActions.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Actions rapides
          </ThemedText>
          <View style={styles.quickActionsContainer}>
            {availableActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: cardColor, borderColor }]}
                onPress={action.action}
              >
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                <ThemedText style={[styles.quickActionText, { color: textColor }]}>
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Activités récentes */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Activités récentes
        </ThemedText>
        <View style={styles.activitiesList}>
          {recentActivities.slice(0, 5).map((activity) => (
            <View key={activity.id} style={[styles.activityCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${getActivityColor(activity.type)}20` }]}>
                  <Ionicons 
                    name={getActivityIcon(activity.type) as any} 
                    size={20} 
                    color={getActivityColor(activity.type)} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityTitleRow}>
                    <ThemedText style={[styles.activityTitle, { color: textColor }]}>
                      {activity.title}
                    </ThemedText>
                    <View style={styles.activityMeta}>
                      {activity.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(activity.priority) }]}>
                          <ThemedText style={styles.priorityText}>
                            {activity.priority.toUpperCase()}
                          </ThemedText>
                        </View>
                      )}
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
                        <ThemedText style={styles.statusText}>
                          {activity.status === 'completed' ? 'Terminé' :
                           activity.status === 'pending' ? 'En attente' :
                           activity.status === 'scheduled' ? 'Programmé' : 'Inconnu'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <ThemedText style={[styles.activityDescription, { color: secondaryColor }]}>
                    {activity.description}
                  </ThemedText>
                  <ThemedText style={[styles.activityTime, { color: secondaryColor }]}>
                    {formatTimeAgo(activity.timestamp)}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Résumé des permissions */}
      <View style={[styles.permissionsCard, { backgroundColor: cardColor, borderColor }]}>
        <ThemedText style={[styles.permissionsTitle, { color: textColor }]}>
          Votre niveau d'accès
        </ThemedText>
        <ThemedText style={[styles.permissionsRole, { color: primaryColor }]}>
          {user?.role === 'admin' ? 'Administrateur' :
           user?.role === 'editor' ? 'Éditeur' : 'Visualiseur'}
        </ThemedText>
        <View style={styles.permissionsList}>
          {user?.permissions.canManageWorship && (
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color={successColor} />
              <ThemedText style={[styles.permissionText, { color: textColor }]}>
                Gestion des cultes
              </ThemedText>
            </View>
          )}
          {user?.permissions.canSendCommunications && (
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color={successColor} />
              <ThemedText style={[styles.permissionText, { color: textColor }]}>
                Envoi de notifications
              </ThemedText>
            </View>
          )}
          {user?.permissions.canManageTeam && (
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color={successColor} />
              <ThemedText style={[styles.permissionText, { color: textColor }]}>
                Gestion de l'équipe
              </ThemedText>
            </View>
          )}
          {user?.permissions.canViewOnly && (
            <View style={styles.permissionItem}>
              <Ionicons name="eye" size={16} color={primaryColor} />
              <ThemedText style={[styles.permissionText, { color: textColor }]}>
                Consultation uniquement
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  permissionsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionsRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  permissionsList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 12,
  },
});