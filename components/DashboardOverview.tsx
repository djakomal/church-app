import { useAuth } from '@/context/AuthContext';
import { useSongs, useTeamMembers, useWorships, useNotifications } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';

export function DashboardOverview() {
  const { user, hasPermission } = useAuth();
  const { songs } = useSongs();
  const { teamMembers } = useTeamMembers();
  const { worships } = useWorships();
  const { notifications } = useNotifications();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  const now = new Date();
  const upcomingWorships = worships.filter(w => new Date(`${w.date}T${w.time}`) >= now).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = {
    totalSongs: songs.length,
    totalMembers: teamMembers.length,
    upcomingWorships,
    pendingNotifications: unreadNotifications,
    thisWeekActivities: notifications.filter(n => {
      const d = new Date(n.created_at || n.sent_at);
      return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length,
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
      color: primaryColor,
      action: () => router.push('/(tabs)/admin'),
      permission: 'canManageTeam'
    }
  ];

  const availableActions = quickActions.filter(action =>
    !action.permission || hasPermission(action.permission as any)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <Ionicons name="people" size={24} color={primaryColor} />
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

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Activités récentes
        </ThemedText>
        <View style={styles.activitiesList}>
          {notifications.slice(0, 5).map((activity) => (
            <View key={activity.id} style={[styles.activityCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${primaryColor}20` }]}>
                  <Ionicons name="notifications" size={20} color={primaryColor} />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityTitleRow}>
                    <ThemedText style={[styles.activityTitle, { color: textColor }]}>
                      {activity.title}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.activityDescription, { color: secondaryColor }]}>
                    {activity.message}
                  </ThemedText>
                  <ThemedText style={[styles.activityTime, { color: secondaryColor }]}>
                    {new Date(activity.created_at || activity.sent_at).toLocaleDateString('fr-FR')}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
          {notifications.length === 0 && (
            <ThemedText style={[styles.activityDescription, { color: secondaryColor, textAlign: 'center' }]}>
              Aucune activité récente
            </ThemedText>
          )}
        </View>
      </View>

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
