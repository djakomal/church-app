import { ChurchFooter } from '@/components/ChurchFooter';
import { ChurchHeader } from '@/components/ChurchHeader';
import { ChurchSidebar } from '@/components/ChurchSidebar';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ManagedSongCard } from '@/components/ManagedSongCard';
import { NotificationFormModal, NotificationData } from '@/components/NotificationFormModal';
import { QuickCommunication } from '@/components/QuickCommunication';
import { SongFormModal } from '@/components/SongFormModal';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { TeamMemberFormModal } from '@/components/TeamMemberFormModal';
import { ThemedText } from '@/components/ThemedText';
import { WorshipCard } from '@/components/WorshipCard';
import { WorshipDetailsForm } from '@/components/WorshipDetailsForm';
import { WorshipFormModal, Worship } from '@/components/WorshipFormModal';
import { useAuth } from '@/context/AuthContext';
import { Song, TeamMember } from '@/database/simpleDatabase';
import { useSongs, useTeamMembers } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function WorshipManagementScreen() {
  const [currentPage, setCurrentPage] = useState('gestion-culte');
  const { width } = useWindowDimensions();
  const isNarrow = width < 840;
  const { user, hasPermission } = useAuth();
  
  // Tous les hooks de thème au début
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const secondaryColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'mediumGray');

  // États pour les modals
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [editingWorship, setEditingWorship] = useState<Worship | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);

  // États pour les données
  const [worships, setWorships] = useState<Worship[]>([
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

  const [notifications, setNotifications] = useState<NotificationData[]>([
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

  // Hooks pour la base de données
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

  // Fonctions pour gérer les chants
  const handleAddSong = () => {
    setEditingSong(null);
    setShowSongModal(true);
  };

  const handleEditSong = (id: number) => {
    const song = songs.find(s => s.id === id);
    if (song) {
      setEditingSong(song);
      setShowSongModal(true);
    }
  };

  const handleDeleteSong = async (id: number) => {
    try {
      await deleteSong(id);
      Alert.alert('Succès', 'Le chant a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le chant');
    }
  };

  const handleSaveSong = async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSong && editingSong.id) {
        await updateSong(editingSong.id, songData);
        Alert.alert('Succès', 'Le chant a été modifié avec succès');
      } else {
        await createSong(songData);
        Alert.alert('Succès', 'Le chant a été ajouté avec succès');
      }
      setShowSongModal(false);
      setEditingSong(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le chant');
    }
  };

  const handleCloseSongModal = () => {
    setShowSongModal(false);
    setEditingSong(null);
  };

  // Fonctions pour gérer les membres d'équipe
  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setShowTeamMemberModal(true);
  };

  const handleEditTeamMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
      setEditingTeamMember(member);
      setShowTeamMemberModal(true);
    }
  };

  const handleDeleteTeamMember = async (id: number) => {
    try {
      await deleteTeamMember(id);
      Alert.alert('Succès', 'Le membre a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le membre');
    }
  };

  const handleSaveTeamMember = async (memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTeamMember && editingTeamMember.id) {
        await updateTeamMember(editingTeamMember.id, memberData);
        Alert.alert('Succès', 'Le membre a été modifié avec succès');
      } else {
        await createTeamMember(memberData);
        Alert.alert('Succès', 'Le membre a été ajouté avec succès');
      }
      setShowTeamMemberModal(false);
      setEditingTeamMember(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le membre');
    }
  };

  const handleCloseTeamMemberModal = () => {
    setShowTeamMemberModal(false);
    setEditingTeamMember(null);
  };

  // Fonctions pour gérer les cultes
  const handleAddWorship = () => {
    setEditingWorship(null);
    setShowWorshipModal(true);
  };

  const handleEditWorship = (id: number) => {
    const worship = worships.find(w => w.id === id);
    if (worship) {
      setEditingWorship(worship);
      setShowWorshipModal(true);
    }
  };

  const handleDeleteWorship = (id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce culte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setWorships(prev => prev.filter(w => w.id !== id));
            Alert.alert('Succès', 'Le culte a été supprimé avec succès');
          }
        }
      ]
    );
  };

  const handleSaveWorship = (worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingWorship && editingWorship.id) {
      setWorships(prev => prev.map(w => 
        w.id === editingWorship.id 
          ? { ...w, ...worshipData, updated_at: new Date().toISOString() }
          : w
      ));
      Alert.alert('Succès', 'Le culte a été modifié avec succès');
    } else {
      const newWorship: Worship = {
        ...worshipData,
        id: Math.max(...worships.map(w => w.id || 0), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setWorships(prev => [...prev, newWorship]);
      Alert.alert('Succès', 'Le culte a été créé avec succès');
    }
    setShowWorshipModal(false);
    setEditingWorship(null);
  };

  const handleCloseWorshipModal = () => {
    setShowWorshipModal(false);
    setEditingWorship(null);
  };

  // Fonctions pour gérer les notifications
  const handleAddNotification = () => {
    setEditingNotification(null);
    setShowNotificationModal(true);
  };

  const handleEditNotification = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setEditingNotification(notification);
      setShowNotificationModal(true);
    }
  };

  const handleDeleteNotification = (id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            Alert.alert('Succès', 'La notification a été supprimée avec succès');
          }
        }
      ]
    );
  };

  const handleSaveNotification = (notificationData: Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingNotification && editingNotification.id) {
      setNotifications(prev => prev.map(n => 
        n.id === editingNotification.id 
          ? { ...n, ...notificationData, updated_at: new Date().toISOString() }
          : n
      ));
      Alert.alert('Succès', 'La notification a été modifiée avec succès');
    } else {
      const newNotification: NotificationData = {
        ...notificationData,
        id: Math.max(...notifications.map(n => n.id || 0), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setNotifications(prev => [...prev, newNotification]);
      
      if (notificationData.isScheduled) {
        Alert.alert('Succès', 'La notification a été programmée avec succès');
      } else {
        Alert.alert('Succès', 'La notification a été envoyée avec succès');
      }
    }
    setShowNotificationModal(false);
    setEditingNotification(null);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setEditingNotification(null);
  };

  // Affichage des erreurs
  if (songsError || membersError) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            Erreur de chargement des données
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: secondaryColor }]}>
            {songsError || membersError}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Affichage du chargement
  if (songsLoading || membersLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ChurchHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <View style={[styles.mainContent, isNarrow && { flexDirection: 'column' }]}>
        {/* Sidebar */}
        <View style={isNarrow ? styles.sidebarMobile : undefined}>
          <ChurchSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </View>
        
        {/* Main content area */}
        <ScrollView style={styles.contentArea} contentContainerStyle={[styles.contentContainer, isNarrow && { alignItems: 'stretch' }]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Page title */}
            <ThemedText style={[styles.pageTitle, { color: textColor }]}>
              Gestion du Culte
            </ThemedText>
            
            {/* Worship details form */}
            <WorshipDetailsForm />

            {/* Worship services section */}
            {hasPermission('canManageWorship') && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                    Cultes Programmés
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: primaryColor }]}
                    onPress={handleAddWorship}
                  >
                    <Ionicons name="add" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Nouveau Culte
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.worshipsList}>
                  {worships.map((worship) => (
                    <WorshipCard
                      key={worship.id}
                      id={worship.id!}
                      title={worship.title}
                      date={worship.date}
                      time={worship.time}
                      location={worship.location}
                      theme={worship.theme}
                      preacher={worship.preacher}
                      songs={worship.songs}
                      musicians={worship.musicians}
                      onEdit={() => handleEditWorship(worship.id!)}
                      onDelete={() => handleDeleteWorship(worship.id!)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Notifications section */}
            {hasPermission('canSendCommunications') && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                    Gestion des Notifications
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: primaryColor }]}
                    onPress={handleAddNotification}
                  >
                    <Ionicons name="send" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Nouvelle Notification
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <View key={notification.id} style={[styles.notificationCard, { backgroundColor: cardColor, borderColor }]}>
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
                          <ThemedText style={[styles.notificationTitle, { color: textColor }]}>
                            {notification.title}
                          </ThemedText>
                        </View>
                        <View style={styles.notificationActions}>
                          <TouchableOpacity
                            onPress={() => handleEditNotification(notification.id!)}
                            style={[styles.actionButton, { backgroundColor: primaryColor }]}
                          >
                            <Ionicons name="pencil" size={12} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteNotification(notification.id!)}
                            style={[styles.actionButton, { backgroundColor: errorColor }]}
                          >
                            <Ionicons name="trash" size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ThemedText style={[styles.notificationMessage, { color: secondaryColor }]}>
                        {notification.message}
                      </ThemedText>
                      <View style={styles.notificationMeta}>
                        <ThemedText style={[styles.notificationMetaText, { color: secondaryColor }]}>
                          Pour: {
                            notification.targetAudience === 'all' ? 'Tous les membres' :
                            notification.targetAudience === 'musicians' ? 'Musiciens' :
                            notification.targetAudience === 'leaders' ? 'Responsables' :
                            'Membres actifs'
                          }
                        </ThemedText>
                        {notification.isScheduled && notification.scheduledDate && (
                          <ThemedText style={[styles.notificationMetaText, { color: secondaryColor }]}>
                            Programmée: {new Date(notification.scheduledDate).toLocaleString('fr-FR')}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Musical repertoire section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Répertoire Musical
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddSong}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Ajouter un Chant
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.songsList}>
                {songs.map((song) => (
                  <ManagedSongCard
                    key={song.id}
                    title={song.title}
                    artist={song.artist}
                    keySignature={song.key}
                    tempo={song.tempo}
                    duration={song.duration}
                    category={song.category}
                    notes={song.notes}
                    lyrics={song.lyrics}
                    onEdit={() => handleEditSong(song.id!)}
                    onDelete={() => handleDeleteSong(song.id!)}
                  />
                ))}
              </View>
            </View>
            
            {/* Team management section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Attribution des Musiciens
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddTeamMember}
                >
                  <Ionicons name="person-add" size={16} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Ajouter un Membre
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.teamList}>
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    id={member.id!}
                    name={member.name}
                    role={member.role}
                    phone={member.phone}
                    email={member.email}
                    avatarUrl={member.avatar_url}
                    onEdit={() => handleEditTeamMember(member.id!)}
                    onDelete={() => handleDeleteTeamMember(member.id!)}
                  />
                ))}
              </View>
            </View>
            
            {/* Quick communication section */}
            <QuickCommunication />
          </View>
        </ScrollView>
      </View>
      
      {/* Footer */}
      <ChurchFooter />

      {/* Modal pour ajouter/modifier un chant */}
      <SongFormModal
        visible={showSongModal}
        song={editingSong}
        onClose={handleCloseSongModal}
        onSave={handleSaveSong}
      />

      {/* Modal pour ajouter/modifier un membre d'équipe */}
      <TeamMemberFormModal
        visible={showTeamMemberModal}
        member={editingTeamMember}
        onClose={handleCloseTeamMemberModal}
        onSave={handleSaveTeamMember}
      />

      {/* Modal pour ajouter/modifier un culte */}
      <WorshipFormModal
        visible={showWorshipModal}
        worship={editingWorship}
        onClose={handleCloseWorshipModal}
        onSave={handleSaveWorship}
      />

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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  content: {
    padding: 24,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  sidebarMobile: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  songsList: {
    gap: 8,
  },
  teamList: {
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  worshipsList: {
    gap: 12,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    gap: 8,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    gap: 4,
  },
  notificationMetaText: {
    fontSize: 12,
  },
});