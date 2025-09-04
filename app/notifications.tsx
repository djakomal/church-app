import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ChurchHeader } from '@/components/ChurchHeader';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCommunications } from '@/hooks/useSimpleDatabase';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsScreen() {
  const [currentPage, setCurrentPage] = useState('notifications');
  const [refreshing, setRefreshing] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');

  const { user } = useAuth();
  const { communications, isLoading, loadCommunications } = useCommunications();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCommunications();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Trier les communications par date (plus récentes en premier)
  const sortedCommunications = [...communications].sort((a, b) => 
    new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  );

  const getMessageTypeColor = (type: 'info' | 'urgent' | 'reminder') => {
    switch (type) {
      case 'urgent': return useThemeColor({}, 'accent');
      case 'reminder': return useThemeColor({}, 'warning');
      default: return primaryColor;
    }
  };

  const getMessageTypeIcon = (type: 'info' | 'urgent' | 'reminder') => {
    switch (type) {
      case 'urgent': return 'warning';
      case 'reminder': return 'time';
      default: return 'information-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ChurchHeader currentPage={currentPage} onPageChange={setCurrentPage} />
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ChurchHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main content area */}
      <ScrollView 
        style={styles.contentArea} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Page title */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={32} color={primaryColor} />
              <View style={styles.titleText}>
                <ThemedText style={[styles.pageTitle, { color: textColor }]}>
                  Notifications
                </ThemedText>
                <ThemedText style={[styles.pageSubtitle, { color: secondaryColor }]}>
                  {sortedCommunications.length} message{sortedCommunications.length > 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Notifications list */}
          {sortedCommunications.length > 0 ? (
            <View style={styles.notificationsList}>
              {sortedCommunications.map((comm, index) => (
                <View key={comm.id} style={[styles.notificationCard, { backgroundColor, borderColor }]}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.typeContainer}>
                      <View style={[styles.typeIcon, { backgroundColor: getMessageTypeColor(comm.type) + '20' }]}>
                        <Ionicons 
                          name={getMessageTypeIcon(comm.type)} 
                          size={16} 
                          color={getMessageTypeColor(comm.type)} 
                        />
                      </View>
                      <View style={styles.typeInfo}>
                        <ThemedText style={[styles.typeText, { color: getMessageTypeColor(comm.type) }]}>
                          {comm.type === 'urgent' ? 'Message urgent' : 
                           comm.type === 'reminder' ? 'Rappel' : 
                           'Information'}
                        </ThemedText>
                        <ThemedText style={[styles.timeText, { color: secondaryColor }]}>
                          {formatDate(comm.sent_at)}
                        </ThemedText>
                      </View>
                    </View>
                    
                    {comm.type === 'urgent' && (
                      <View style={[styles.urgentBadge, { backgroundColor: useThemeColor({}, 'accent') }]}>
                        <ThemedText style={styles.urgentText}>
                          URGENT
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  <ThemedText style={[styles.messageText, { color: textColor }]}>
                    {comm.message}
                  </ThemedText>
                  
                  <View style={styles.notificationFooter}>
                    <ThemedText style={[styles.fullTimeText, { color: secondaryColor }]}>
                      {new Date(comm.sent_at).toLocaleString('fr-FR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor, borderColor }]}>
              <Ionicons name="notifications-off-outline" size={64} color={secondaryColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Aucune notification
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                Vous n'avez reçu aucune communication pour le moment.
                Les messages de l'équipe apparaîtront ici.
              </ThemedText>
            </View>
          )}

          {/* Info section */}
          <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
            <Ionicons name="information-circle" size={24} color={primaryColor} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoTitle, { color: textColor }]}>
                À propos des notifications
              </ThemedText>
              <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
                • Les messages urgents sont prioritaires{'\n'}
                • Les rappels concernent les événements à venir{'\n'}
                • Tirez vers le bas pour actualiser
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  titleText: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  notificationsList: {
    gap: 16,
    marginBottom: 24,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  notificationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  fullTimeText: {
    fontSize: 12,
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});