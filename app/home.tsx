import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SongCard } from '@/components/SongCard';
import { ThemedText } from '@/components/ThemedText';
import { WorshipCard } from '@/components/WorshipCard';
import { useAuth } from '@/context/AuthContext';
import { useCommunications, useSongs, useWorships } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EventBus } from '@/utils/EventBus';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [refreshing, setRefreshing] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const accentColor = useThemeColor({}, 'accent');

  const { user } = useAuth();
  const { songs, isLoading: songsLoading, loadSongs } = useSongs();
  const { worships, isLoading: worshipsLoading, loadWorships } = useWorships();
  const { communications, isLoading: communicationsLoading, loadCommunications } = useCommunications();

  // Rediriger vers login si l'utilisateur est déconnecté (sécurité côté client)
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadSongs(),
        loadWorships(),
        loadCommunications()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrer les cultes à venir
  const now = new Date();
  const upcomingWorships = worships
    .filter(w => new Date(`${w.date}T${w.time}`) >= now)
    .slice(0, 3);

  // Derniers chants ajoutés
  const recentSongs = songs.slice(0, 4);

  // Communications récentes
  const recentCommunications = communications.slice(0, 5);

  const isLoading = songsLoading || worshipsLoading || communicationsLoading;

  // Recharger les données à chaque focus de l'écran
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await Promise.all([loadSongs(), loadWorships(), loadCommunications()]);
        } catch (e) {}
      })();
      const unsubCreateWorship = EventBus.on('worship_created', async () => { await loadWorships(); });
      const unsubDeleteWorship = EventBus.on('worship_deleted', async () => { await loadWorships(); });
      const unsubComm = EventBus.on('communication_created', async () => { await loadCommunications(); });
      return () => { unsubCreateWorship(); unsubDeleteWorship(); unsubComm(); };
    }, [loadSongs, loadWorships, loadCommunications])
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

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
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <ThemedText style={[styles.welcomeTitle, { color: textColor }]}>
                Bienvenue, {user?.name || 'Utilisateur'}
              </ThemedText>
              <ThemedText style={[styles.welcomeSubtitle, { color: secondaryColor }]}>
                {user?.role === 'admin' && 'Administrateur - Accès complet'}
                {user?.role === 'editor' && 'Éditeur - Gestion des cultes et chants'}
                {user?.role === 'viewer' && 'Musicien - Consultation des informations'}
              </ThemedText>
            </View>

            {/* Prochains Cultes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={24} color={primaryColor} />
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Prochains Cultes
                </ThemedText>
              </View>
              
              {upcomingWorships.length > 0 ? (
                <View style={styles.worshipsList}>
                  {upcomingWorships.map((worship) => (
                    <WorshipCard
                      key={worship.id}
                      id={worship.id!}
                      title={worship.title}
                      date={worship.date}
                      time={worship.time}
                      location={worship.location}
                      theme={worship.theme}
                      description={worship.description}
                      onEdit={() => {}} // Pas d'action pour les viewers
                      onDelete={() => {}} // Pas d'action pour les viewers
                    />
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor, borderColor }]}>
                  <Ionicons name="calendar-outline" size={32} color={secondaryColor} />
                  <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                    Aucun culte planifié prochainement
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Répertoire Musical */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="musical-notes" size={24} color={primaryColor} />
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Répertoire Musical
                </ThemedText>
              </View>
              
              {recentSongs.length > 0 ? (
                <View style={styles.songsList}>
                  {recentSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      title={song.title || 'Sans titre'}
                      artist={song.artist || 'Artiste inconnu'}
                      keySignature={song.key || 'C'}
                      tempo={song.tempo || 'Medium'}
                      duration={song.duration || '3:00'}
                      category={song.category || 'Louange'}
                      notes={song.notes || ''}
                      lyrics={song.lyrics || ''}
                    />
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor, borderColor }]}>
                  <Ionicons name="musical-note-outline" size={32} color={secondaryColor} />
                  <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                    Aucun chant disponible
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Communications */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubbles" size={24} color={primaryColor} />
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Communications Récentes
                </ThemedText>
              </View>
              
              {recentCommunications.length > 0 ? (
                <View style={styles.communicationsList}>
                  {recentCommunications.map((comm) => (
                    <View key={comm.id} style={[styles.communicationCard, { backgroundColor, borderColor }]}>
                      <View style={styles.communicationHeader}>
                        <View style={styles.communicationTypeContainer}>
                          <Ionicons 
                            name={
                              comm.type === 'urgent' ? 'warning' : 
                              comm.type === 'reminder' ? 'time' : 
                              'information-circle'
                            } 
                            size={16} 
                            color={
                              comm.type === 'urgent' ? accentColor : 
                              comm.type === 'reminder' ? warningColor : 
                              primaryColor
                            } 
                          />
                          <ThemedText style={[
                            styles.communicationType, 
                            { 
                              color: comm.type === 'urgent' ? accentColor : 
                                     comm.type === 'reminder' ? warningColor : 
                                     primaryColor 
                            }
                          ]}>
                            {comm.type === 'urgent' ? 'Urgent' : 
                             comm.type === 'reminder' ? 'Rappel' : 
                             'Info'}
                          </ThemedText>
                        </View>
                        <ThemedText style={[styles.communicationTime, { color: secondaryColor }]}>
                          {new Date(comm.sent_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.communicationMessage, { color: textColor }]}>
                        {comm.message || 'Message vide'}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor, borderColor }]}>
                  <Ionicons name="chatbubble-outline" size={32} color={secondaryColor} />
                  <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                    Aucune communication récente
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Informations Utilisateur */}
            <View style={[styles.userInfoCard, { backgroundColor, borderColor }]}>
              <View style={styles.userInfoHeader}>
                <Ionicons name="person-circle" size={32} color={primaryColor} />
                <View style={styles.userInfoText}>
                  <ThemedText style={[styles.userInfoName, { color: textColor }]}>
                    {user?.name}
                  </ThemedText>
                  <ThemedText style={[styles.userInfoRole, { color: secondaryColor }]}>
                    {user?.email}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.permissionsInfo}>
                <ThemedText style={[styles.permissionsTitle, { color: textColor }]}>
                  Vos permissions :
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
                  {user?.permissions.canManageSongs && (
                    <View style={styles.permissionItem}>
                      <Ionicons name="checkmark-circle" size={16} color={successColor} />
                      <ThemedText style={[styles.permissionText, { color: textColor }]}>
                        Gestion des chants
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
                  {user?.permissions.canSendCommunications && (
                    <View style={styles.permissionItem}>
                      <Ionicons name="checkmark-circle" size={16} color={successColor} />
                      <ThemedText style={[styles.permissionText, { color: textColor }]}>
                        Envoi de communications
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
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  worshipsList: {
    gap: 12,
  },
  songsList: {
    gap: 12,
  },
  communicationsList: {
    gap: 12,
  },
  communicationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  communicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  communicationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communicationType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  communicationTime: {
    fontSize: 12,
  },
  communicationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  userInfoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  userInfoText: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userInfoRole: {
    fontSize: 14,
  },
  permissionsInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
  },
});