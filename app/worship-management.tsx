import React, { useState, useMemo, useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import { useSongs, useTeamMembers } from '@/hooks/useSimpleDatabase';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ChurchHeader } from '@/components/ChurchHeader';
import { ChurchSidebar } from '@/components/ChurchSidebar';
import { ChurchFooter } from '@/components/ChurchFooter';
import { SongFormModal } from '@/components/SongFormModal';
import { TeamMemberFormModal } from '@/components/TeamMemberFormModal';
import { WorshipFormModal } from '@/components/WorshipFormModal';
import { NotificationFormModal } from '@/components/NotificationFormModal';
import { SectionHeader } from '@/components/ReusableUI';
import { PermissionGate } from '@/components/ReusableUI';
import { EmptyState } from '@/components/ReusableUI';
import { StatusBadge } from '@/components/ReusableUI';
import { Song, TeamMember, Worship } from '@/database/simpleDatabase';
import { NotificationData } from '@/components/NotificationFormModal';
import { WorshipDetailsForm } from '@/components/WorshipDetailsForm';
import { QuickCommunication } from '@/components/QuickCommunication';
import { useT } from '@/context/I18nContext';

const SongManagementSection = React.memo(({ 
  songs, 
  isLoading, 
  error, 
  canManageSongs, 
  onAddSong, 
  onEditSong, 
  onDeleteSong 
}: any) => {
  const t = useT();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{t('songs.loadError')}</ThemedText>
        <ThemedText style={styles.errorSubtext}>{error}</ThemedText>
      </View>
    );
  }

  if (!canManageSongs) {
    return (
      <EmptyState
        icon="eye-outline"
        title={t('common.readonlyMode')}
        message={t('songs.readonlyMessage')}
      />
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('worships.songs')}
        icon="musical-notes"
        action={canManageSongs && (
          <TouchableOpacity style={styles.addButton} onPress={onAddSong}>
            <Ionicons name="add" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>{t('songs.add')}</ThemedText>
          </TouchableOpacity>
        )}
      />
      
      {songs.length > 0 ? (
        <View style={styles.itemsList}>
          {songs.map((song: Song) => (
            <View key={song.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemTitle}>{song.title}</ThemedText>
                <ThemedText style={styles.itemArtist}>{song.artist}</ThemedText>
                <View style={styles.itemMeta}>
                  <StatusBadge
                    status="info"
                    text={`${song.key || 'C'} - ${song.tempo || 'Medium'}`}
                  />
                  <StatusBadge
                    status="success"
                    text={`${song.category || 'Louange'}`}
                  />
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onEditSong(song.id)}>
                  <Ionicons name="pencil" size={16} color={useThemeColor({}, 'primary')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => onDeleteSong(song.id)}>
                  <Ionicons name="trash" size={16} color={useThemeColor({}, 'error')} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="musical-notes-outline"
          title={t('songs.empty')}
          message={t('songs.emptyMessage')}
          action={canManageSongs && (
            <TouchableOpacity style={styles.emptyActionButton} onPress={onAddSong}>
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.emptyActionText}>{t('songs.add')}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
});

const TeamManagementSection = React.memo(({ 
  teamMembers, 
  isLoading, 
  error, 
  canManageTeam, 
  onAddMember, 
  onEditMember, 
  onDeleteMember 
}: any) => {
  const t = useT();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{t('team.loadError')}</ThemedText>
        <ThemedText style={styles.errorSubtext}>{error}</ThemedText>
      </View>
    );
  }

  if (!canManageTeam) {
    return (
      <EmptyState
        icon="person-outline"
        title={t('common.readonlyMode')}
        message={t('team.readonlyMessage')}
      />
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('team.title')}
        icon="people"
        action={canManageTeam && (
          <TouchableOpacity style={styles.addButton} onPress={onAddMember}>
            <Ionicons name="person-add" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>{t('team.add')}</ThemedText>
          </TouchableOpacity>
        )}
      />
      
      {teamMembers.length > 0 ? (
        <View style={styles.itemsList}>
          {teamMembers.map((member: TeamMember) => (
            <View key={member.id} style={styles.itemCard}>
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Ionicons name="person-circle" size={40} color={useThemeColor({}, 'primary')} />
                </View>
                <View style={styles.memberDetails}>
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
                  <ThemedText style={styles.memberContact}>
                    📞 {member.phone || t('common.notSpecified')} | ✉️ {member.email || t('common.notSpecified')}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onEditMember(member.id)}>
                  <Ionicons name="pencil" size={16} color={useThemeColor({}, 'primary')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => onDeleteMember(member.id)}>
                  <Ionicons name="trash" size={16} color={useThemeColor({}, 'error')} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="people-outline"
          title={t('team.empty')}
          message={t('team.emptyMessage')}
          action={canManageTeam && (
            <TouchableOpacity style={styles.emptyActionButton} onPress={onAddMember}>
              <Ionicons name="person-add" size={20} color="white" />
              <ThemedText style={styles.emptyActionText}>{t('team.add')}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
});

const WorshipManagementSection = React.memo(({ 
  worships, 
  canManageWorship, 
  onAddWorship, 
  onEditWorship, 
  onDeleteWorship 
}: any) => {
  const t = useT();

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('worships.upcoming')}
        icon="calendar"
        action={canManageWorship && (
          <TouchableOpacity style={styles.addButton} onPress={onAddWorship}>
            <Ionicons name="add" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>{t('worships.add')}</ThemedText>
          </TouchableOpacity>
        )}
      />
      
      <WorshipDetailsForm />
      
      {canManageWorship && worships.length > 0 ? (
        <View style={styles.itemsList}>
          {worships.map((worship: Worship) => (
            <View key={worship.id} style={styles.itemCard}>
              <View style={styles.worshipInfo}>
                <ThemedText style={styles.worshipTitle}>{worship.title}</ThemedText>
                <View style={styles.worshipMeta}>
                  <View style={styles.worshipDateTime}>
                    <Ionicons name="calendar" size={16} color={useThemeColor({}, 'secondary')} />
                    <ThemedText style={styles.worshipDateTimeText}>
                      {worship.date} {t('worships.at')} {worship.time}
                    </ThemedText>
                  </View>
                  <View style={styles.worshipLocation}>
                    <Ionicons name="location" size={16} color={useThemeColor({}, 'secondary')} />
                    <ThemedText style={styles.worshipLocationText}>
                      {worship.location}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.worshipTheme}>
                  {t('worships.theme')}: {worship.theme}
                </ThemedText>
                <ThemedText style={styles.worshipPreacher}>
                  {t('worships.preacher')}: {worship.preacher}
                </ThemedText>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onEditWorship(worship.id)}>
                  <Ionicons name="pencil" size={16} color={useThemeColor({}, 'primary')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => onDeleteWorship(worship.id)}>
                  <Ionicons name="trash" size={16} color={useThemeColor({}, 'error')} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : canManageWorship ? (
        <EmptyState
          icon="calendar-outline"
          title={t('worships.noUpcoming')}
          message={t('worships.noUpcomingMessage')}
          action={canManageWorship && (
            <TouchableOpacity style={styles.emptyActionButton} onPress={onAddWorship}>
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.emptyActionText}>{t('worships.add')}</ThemedText>
            </TouchableOpacity>
          )}
        />
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={t('worships.noUpcoming')}
          message={t('worships.noUpcomingMessage')}
        />
      )}
    </View>
  );
});

const NotificationManagementSection = React.memo(({ 
  notifications, 
  canSendCommunications, 
  onAddNotification, 
  onEditNotification, 
  onDeleteNotification 
}: any) => {
  const t = useT();

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('notifications.title')}
        icon="chatbubbles"
        action={canSendCommunications && (
          <TouchableOpacity style={styles.addButton} onPress={onAddNotification}>
            <Ionicons name="send" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>{t('notifications.add')}</ThemedText>
          </TouchableOpacity>
        )}
      />
      
      {canSendCommunications && notifications.length > 0 ? (
        <View style={styles.itemsList}>
          {notifications.map((notification: NotificationData) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitleRow}>
                  <Ionicons 
                    name={
                      notification.type === 'urgent' ? 'alert-circle' :
                      notification.type === 'warning' ? 'warning' :
                      notification.type === 'success' ? 'checkmark-circle' :
                      'information-circle'
                    } 
                    size={16} 
                    color={
                      notification.type === 'urgent' ? '#ef4444' :
                      notification.type === 'warning' ? '#f59e0b' :
                      notification.type === 'success' ? '#10b981' :
                      '#3b82f6'
                    } 
                  />
                  <ThemedText style={styles.notificationTitle}>
                    {notification.title}
                  </ThemedText>
                </View>
                <View style={styles.notificationStatus}>
                  {notification.type === 'urgent' && (
                    <View style={styles.urgentBadge}>
                      <ThemedText style={styles.urgentText}>{t('notifications.urgent')}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
              
              <ThemedText style={styles.notificationMessage}>
                {notification.message}
              </ThemedText>
              
              <View style={styles.notificationMeta}>
                <ThemedText style={styles.notificationMetaText}>
                  {notification.targetAudience === 'all' ? t('notifications.allMembers') :
                   notification.targetAudience === 'musicians' ? t('notifications.musicians') :
                   notification.targetAudience === 'leaders' ? t('notifications.leaders') :
                   t('notifications.activeMembers')}
                </ThemedText>
                {notification.isScheduled && notification.scheduledDate && (
                  <ThemedText style={styles.notificationMetaText}>
                    {t('notifications.scheduled')}: {new Date(notification.scheduledDate).toLocaleString('fr-FR')}
                  </ThemedText>
                )}
              </View>
              
              {canSendCommunications && (
                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    onPress={() => onEditNotification(notification.id)}
                    style={[styles.actionButton, { backgroundColor: useThemeColor({}, 'primary') }]}
                  >
                    <Ionicons name="pencil" size={12} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteNotification(notification.id)}
                    style={[styles.actionButton, { backgroundColor: useThemeColor({}, 'error') }]}
                  >
                    <Ionicons name="trash" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : canSendCommunications ? (
        <EmptyState
          icon="chatbubble-outline"
          title={t('notifications.empty')}
          message={t('notifications.emptyMessage')}
          action={canSendCommunications && (
            <TouchableOpacity style={styles.emptyActionButton} onPress={onAddNotification}>
              <Ionicons name="send" size={20} color="white" />
              <ThemedText style={styles.emptyActionText}>{t('notifications.send')}</ThemedText>
            </TouchableOpacity>
          )}
        />
      ) : (
        <EmptyState
          icon="chatbubble-outline"
          title={t('notifications.noNew')}
          message={t('notifications.noNewMessage')}
        />
      )}
    </View>
  );
});

export default function WorshipManagementScreen() {
  const t = useT();
  const [currentPage, setCurrentPage] = useState('gestion-culte');
  const { width } = useWindowDimensions();
  const isNarrow = width < 840;
  const { user, hasPermission } = useAuth();
  
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const secondaryColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'mediumGray');

  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [editingWorship, setEditingWorship] = useState<Worship | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);

  const {
    songs,
    isLoading: songsLoading,
    error: songsError,
    createSong,
    updateSong,
    deleteSong
  } = useSongs();

  const {
    teamMembers,
    isLoading: membersLoading,
    error: membersError,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useTeamMembers();

  const canManageSongs = hasPermission('canManageSongs');
  const canManageTeam = hasPermission('canManageTeam');
  const canManageWorship = hasPermission('canManageWorship');
  const canSendCommunications = hasPermission('canSendCommunications');

  const handleAddSong = useCallback(() => {
    if (!canManageSongs) {
      Alert.alert(t('common.accessDenied'), t('songs.accessDeniedAdd'));
      return;
    }
    setEditingSong(null);
    setShowSongModal(true);
  }, [canManageSongs, t]);

  const handleEditSong = useCallback((id: number) => {
    if (!canManageSongs) {
      Alert.alert(t('common.accessDenied'), t('songs.accessDeniedEdit'));
      return;
    }
    const song = songs.find(s => s.id === id);
    if (song) {
      setEditingSong(song);
      setShowSongModal(true);
    }
  }, [canManageSongs, songs, t]);

  const handleDeleteSong = useCallback(async (id: number) => {
    if (!canManageSongs) {
      Alert.alert(t('common.accessDenied'), t('songs.accessDeniedDelete'));
      return;
    }
    try {
      await deleteSong(id);
      Alert.alert(t('common.success'), t('songs.deletedSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('songs.deleteError'));
    }
  }, [canManageSongs, deleteSong, t]);

  const handleSaveSong = useCallback(async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSong && editingSong.id) {
        await updateSong(editingSong.id, songData);
        Alert.alert(t('common.success'), t('songs.updatedSuccess'));
      } else {
        await createSong(songData);
        Alert.alert(t('common.success'), t('songs.addedSuccess'));
      }
      setShowSongModal(false);
      setEditingSong(null);
    } catch (error) {
      Alert.alert(t('common.error'), t('songs.saveError'));
    }
  }, [editingSong, updateSong, createSong, t]);

  const handleAddTeamMember = useCallback(() => {
    if (!canManageTeam) {
      Alert.alert(t('common.accessDenied'), t('team.accessDeniedAdd'));
      return;
    }
    setEditingTeamMember(null);
    setShowTeamMemberModal(true);
  }, [canManageTeam, t]);

  const handleEditTeamMember = useCallback((id: number) => {
    if (!canManageTeam) {
      Alert.alert(t('common.accessDenied'), t('team.accessDeniedEdit'));
      return;
    }
    const member = teamMembers.find(m => m.id === id);
    if (member) {
      setEditingTeamMember(member);
      setShowTeamMemberModal(true);
    }
  }, [canManageTeam, teamMembers, t]);

  const handleDeleteTeamMember = useCallback(async (id: number) => {
    if (!canManageTeam) {
      Alert.alert(t('common.accessDenied'), t('team.accessDeniedDelete'));
      return;
    }
    try {
      await deleteTeamMember(id);
      Alert.alert(t('common.success'), t('team.deletedSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('team.deleteError'));
    }
  }, [canManageTeam, deleteTeamMember, t]);

  const handleSaveTeamMember = useCallback(async (memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTeamMember && editingTeamMember.id) {
        await updateTeamMember(editingTeamMember.id, memberData);
        Alert.alert(t('common.success'), t('team.updatedSuccess'));
      } else {
        await createTeamMember(memberData);
        Alert.alert(t('common.success'), t('team.addedSuccess'));
      }
      setShowTeamMemberModal(false);
      setEditingTeamMember(null);
    } catch (error) {
      Alert.alert(t('common.error'), t('team.saveError'));
    }
  }, [editingTeamMember, updateTeamMember, createTeamMember, t]);

  const [localWorships, setLocalWorships] = useState<Worship[]>([
    {
      id: 1,
      title: 'Culte du Dimanche',
      date: '2024-12-22',
      time: '10:00',
      location: 'Sanctuaire principal',
      theme: 'L\'amour de Dieu',
      preacher: 'Pasteur Martin',
      description: 'Culte de louange et d\'adoration',
      songs: ['Amazing Grace', 'How Great Thou Art'],
      musicians: ['Jean Dupont', 'Marie Martin'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const handleAddWorship = useCallback(() => {
    if (!canManageWorship) {
      Alert.alert(t('common.accessDenied'), t('worships.accessDeniedAdd'));
      return;
    }
    setEditingWorship(null);
    setShowWorshipModal(true);
  }, [canManageWorship, t]);

  const handleEditWorship = useCallback((id: number) => {
    if (!canManageWorship) {
      Alert.alert(t('common.accessDenied'), t('worships.accessDeniedEdit'));
      return;
    }
    const worship = localWorships.find(w => w.id === id);
    if (worship) {
      setEditingWorship(worship);
      setShowWorshipModal(true);
    }
  }, [canManageWorship, localWorships, t]);

  const handleDeleteWorship = useCallback((id: number) => {
    if (!canManageWorship) {
      Alert.alert(t('common.accessDenied'), t('worships.accessDeniedDelete'));
      return;
    }
    Alert.alert(
      t('common.confirmDelete'),
      t('worships.confirmDeleteMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setLocalWorships(prev => prev.filter(w => w.id !== id));
            Alert.alert(t('common.success'), t('worships.deletedSuccess'));
          }
        }
      ]
    );
  }, [canManageWorship, t]);

  const handleSaveWorship = useCallback((worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingWorship && editingWorship.id) {
      setLocalWorships(prev => prev.map(w => 
        w.id === editingWorship.id 
          ? { ...w, ...worshipData, updated_at: new Date().toISOString() }
          : w
      ));
      Alert.alert(t('common.success'), t('worships.updatedSuccess'));
    } else {
      const newWorship: Worship = {
        ...worshipData,
        id: Math.max(...localWorships.map(w => w.id || 0), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setLocalWorships(prev => [...prev, newWorship]);
      Alert.alert(t('common.success'), t('worships.createdSuccess'));
    }
    setShowWorshipModal(false);
    setEditingWorship(null);
  }, [editingWorship, localWorships, t]);

  const [localNotifications, setLocalNotifications] = useState<NotificationData[]>([
    {
      id: 1,
      title: 'Répétition ce soir',
      message: 'N\'oubliez pas la répétition de ce soir à 19h en salle de musique.',
      type: 'info',
      targetAudience: 'musicians',
      isScheduled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const handleAddNotification = useCallback(() => {
    if (!canSendCommunications) {
      Alert.alert(t('common.accessDenied'), t('notifications.accessDeniedAdd'));
      return;
    }
    setEditingNotification(null);
    setShowNotificationModal(true);
  }, [canSendCommunications, t]);

  const handleEditNotification = useCallback((id: number) => {
    if (!canSendCommunications) {
      Alert.alert(t('common.accessDenied'), t('notifications.accessDeniedEdit'));
      return;
    }
    const notification = localNotifications.find(n => n.id === id);
    if (notification) {
      setEditingNotification(notification);
      setShowNotificationModal(true);
    }
  }, [canSendCommunications, localNotifications, t]);

  const handleDeleteNotification = useCallback((id: number) => {
    if (!canSendCommunications) {
      Alert.alert(t('common.accessDenied'), t('notifications.accessDeniedDelete'));
      return;
    }
    Alert.alert(
      t('common.confirmDelete'),
      t('notifications.confirmDeleteMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setLocalNotifications(prev => prev.filter(n => n.id !== id));
            Alert.alert(t('common.success'), t('notifications.deletedSuccess'));
          }
        }
      ]
    );
  }, [canSendCommunications, t]);

  const handleSaveNotification = useCallback((notificationData: Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingNotification && editingNotification.id) {
      setLocalNotifications(prev => prev.map(n => 
        n.id === editingNotification.id 
          ? { ...n, ...notificationData, updated_at: new Date().toISOString() }
          : n
      ));
      Alert.alert(t('common.success'), t('notifications.updatedSuccess'));
    } else {
      const newNotification: NotificationData = {
        ...notificationData,
        id: Math.max(...localNotifications.map(n => n.id || 0), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setLocalNotifications(prev => [...prev, newNotification]);
      
      if (notificationData.isScheduled) {
        Alert.alert(t('common.success'), t('notifications.scheduledSuccess'));
      } else {
        Alert.alert(t('common.success'), t('notifications.sentSuccess'));
      }
    }
    setShowNotificationModal(false);
    setEditingNotification(null);
  }, [editingNotification, localNotifications, t]);

  if (songsError || membersError) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {t('common.loadError')}
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: secondaryColor }]}>
            {songsError || membersError}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (songsLoading || membersLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ChurchHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <View style={[styles.mainContent, isNarrow && { flexDirection: 'column' }]}>
        <View style={isNarrow ? styles.sidebarMobile : undefined}>
          <ChurchSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </View>
        
        <ScrollView 
          style={styles.contentArea} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <ThemedText style={[styles.pageTitle, { color: textColor }]}>
              {t('worships.title')}
            </ThemedText>
            
            <PermissionGate permission="canManageSongs">
              <SongManagementSection
                songs={songs}
                isLoading={songsLoading}
                error={songsError}
                canManageSongs={canManageSongs}
                onAddSong={handleAddSong}
                onEditSong={handleEditSong}
                onDeleteSong={handleDeleteSong}
              />
            </PermissionGate>
            
            <PermissionGate permission="canManageTeam">
              <TeamManagementSection
                teamMembers={teamMembers}
                isLoading={membersLoading}
                error={membersError}
                canManageTeam={canManageTeam}
                onAddMember={handleAddTeamMember}
                onEditMember={handleEditTeamMember}
                onDeleteMember={handleDeleteTeamMember}
              />
            </PermissionGate>
            
            <PermissionGate permission="canManageWorship">
              <WorshipManagementSection
                worships={localWorships}
                canManageWorship={canManageWorship}
                onAddWorship={handleAddWorship}
                onEditWorship={handleEditWorship}
                onDeleteWorship={handleDeleteWorship}
              />
            </PermissionGate>
            
            <PermissionGate permission="canSendCommunications">
              <NotificationManagementSection
                notifications={localNotifications}
                canSendCommunications={canSendCommunications}
                onAddNotification={handleAddNotification}
                onEditNotification={handleEditNotification}
                onDeleteNotification={handleDeleteNotification}
              />
            </PermissionGate>
            
            <View style={styles.section}>
              <QuickCommunication />
            </View>
          </View>
        </ScrollView>
      </View>
      
      <ChurchFooter />

      <SongFormModal
        visible={showSongModal}
        song={editingSong}
        onClose={() => {
          setShowSongModal(false);
          setEditingSong(null);
        }}
        onSave={handleSaveSong}
      />

      <TeamMemberFormModal
        visible={showTeamMemberModal}
        member={editingTeamMember}
        onClose={() => {
          setShowTeamMemberModal(false);
          setEditingTeamMember(null);
        }}
        onSave={handleSaveTeamMember}
      />

      <WorshipFormModal
        visible={showWorshipModal}
        worship={editingWorship}
        onClose={() => {
          setShowWorshipModal(false);
          setEditingWorship(null);
        }}
        onSave={handleSaveWorship}
      />

      <NotificationFormModal
        visible={showNotificationModal}
        notification={editingNotification}
        onClose={() => {
          setShowNotificationModal(false);
          setEditingNotification(null);
        }}
        onSave={handleSaveNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  itemArtist: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  memberRole: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  memberContact: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  worshipInfo: {
    flex: 1,
  },
  worshipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  worshipMeta: {
    gap: 4,
    marginBottom: 8,
  },
  worshipDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  worshipDateTimeText: {
    fontSize: 14,
    color: '#64748b',
  },
  worshipLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  worshipLocationText: {
    fontSize: 14,
    color: '#64748b',
  },
  worshipTheme: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  worshipPreacher: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    flex: 1,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  notificationMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarMobile: {
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 24,
  },
});
