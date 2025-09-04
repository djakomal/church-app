import { CommentSection } from '@/components/CommentSection';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { NotificationFormModal, NotificationData } from '@/components/NotificationFormModal';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useComments } from '@/context/CommentContext';
import { useNotifications } from '@/context/NotificationContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EventBus } from '@/utils/EventBus';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const [currentPage, setCurrentPage] = useState('notifications');
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');

  const { user, hasPermission } = useAuth();
  const { notifications, addNotification, markAsRead } = useNotifications();
  const { getCommentsByNotificationId, addComment, deleteComment } = useComments();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simuler un délai de rafraîchissement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Trier les notifications par date (plus récentes en premier)
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  );

  const getMessageTypeColor = (type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning') => {
    switch (type) {
      case 'urgent': return useThemeColor({}, 'accent');
      case 'reminder': return '#8b5cf6';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return primaryColor;
    }
  };

  const getMessageTypeIcon = (type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning') => {
    switch (type) {
      case 'urgent': return 'alert-circle';
      case 'reminder': return 'time';
      case 'warning': return 'warning';
      case 'success': return 'checkmark-circle';
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

  // Fonctions pour gérer les notifications (admin seulement)
  const handleAddNotification = () => {
    setEditingNotification(null);
    setShowNotificationModal(true);
  };

  const handleSaveNotification = async (notificationData: Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Ajouter la notification via le contexte
      await addNotification(notificationData);
      
      if (notificationData.isScheduled) {
        Alert.alert('Succès', 'La notification a été programmée avec succès');
      } else {
        Alert.alert('Succès', 'La notification a été envoyée avec succès');
      }
      setShowNotificationModal(false);
      setEditingNotification(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification');
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setEditingNotification(null);
  };

  
  return (
    <View style={[styles.container, { backgroundColor }]}> 
      
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
                  {sortedNotifications.length} message{sortedNotifications.length > 1 ? 's' : ''}
                </ThemedText>
              </View>
              {hasPermission('canSendCommunications') && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddNotification}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bouton d'ajout pour admin (version étendue) */}
          {hasPermission('canSendCommunications') && (
            <View style={styles.adminSection}>
              <TouchableOpacity
                style={[styles.createNotificationButton, { backgroundColor: cardColor, borderColor }]}
                onPress={handleAddNotification}
              >
                <Ionicons name="send" size={24} color={primaryColor} />
                <View style={styles.createButtonText}>
                  <ThemedText style={[styles.createButtonTitle, { color: textColor }]}>
                    Envoyer une notification
                  </ThemedText>
                  <ThemedText style={[styles.createButtonSubtitle, { color: secondaryColor }]}>
                    Communiquer avec l'équipe ou les membres
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications list */}
          {sortedNotifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {sortedNotifications.map((notification, index) => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[
                    styles.notificationCard, 
                    { backgroundColor: cardColor, borderColor },
                    !notification.read && { borderLeftWidth: 4, borderLeftColor: primaryColor }
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={styles.typeContainer}>
                      <View style={[styles.typeIcon, { backgroundColor: getMessageTypeColor(notification.type) + '20' }]}>
                        <Ionicons 
                          name={getMessageTypeIcon(notification.type)} 
                          size={16} 
                          color={getMessageTypeColor(notification.type)} 
                        />
                      </View>
                      <View style={styles.typeInfo}>
                        <ThemedText style={[styles.typeText, { color: getMessageTypeColor(notification.type) }]}>
                          {notification.type === 'urgent' ? 'Message urgent' : 
                           notification.type === 'reminder' ? 'Rappel' : 
                           notification.type === 'warning' ? 'Attention' :
                           notification.type === 'success' ? 'Succès' :
                           'Information'}
                        </ThemedText>
                        <ThemedText style={[styles.timeText, { color: secondaryColor }]}>
                          {formatDate(notification.sent_at)}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.notificationStatus}>
                      {notification.type === 'urgent' && (
                        <View style={[styles.urgentBadge, { backgroundColor: useThemeColor({}, 'accent') }]}>
                          <ThemedText style={styles.urgentText}>
                            URGENT
                          </ThemedText>
                        </View>
                      )}
                      {!notification.read && (
                        <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />
                      )}
                    </View>
                  </View>
                  
                  <ThemedText style={[styles.notificationTitle, { color: textColor }]}>
                    {notification.title}
                  </ThemedText>
                  
                  <ThemedText style={[styles.messageText, { color: textColor }]}>
                    {notification.message}
                  </ThemedText>
                  
                  <View style={styles.notificationFooter}>
                    <ThemedText style={[styles.fullTimeText, { color: secondaryColor }]}>
                      {new Date(notification.sent_at).toLocaleString('fr-FR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThemedText>
                  </View>

                  {/* Section des commentaires */}
                  <CommentSection
                    notificationId={notification.id}
                    comments={getCommentsByNotificationId(notification.id)}
                    onAddComment={(content) => addComment(notification.id, content)}
                    onDeleteComment={deleteComment}
                  />
                </TouchableOpacity>
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

      {/* Modal pour ajouter/modifier une notification */}
      <NotificationFormModal
        visible={showNotificationModal}
        notification={editingNotification}
        onClose={handleCloseNotificationModal}
        onSave={handleSaveNotification}
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminSection: {
    marginBottom: 24,
  },
  createNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  createButtonText: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 14,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});