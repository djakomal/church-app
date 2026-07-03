import { MusicianFormModal, Musician } from '@/components/MusicianFormModal';
import { NotificationFormModal, NotificationData } from '@/components/NotificationFormModal';
import { ThemedText } from '@/components/ThemedText';
import { WorshipCard } from '@/components/WorshipCard';
import { WorshipFormModal, Worship } from '@/components/WorshipFormModal';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useWorships, useMusicians } from '@/hooks/useSimpleDatabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function WorshipManagementTabScreen() {
  const t = useT();
  const { user, hasPermission } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');
  const errorColor = useThemeColor({}, 'error');

  const {
    worships,
    isLoading: worshipsLoading,
    error: worshipsError,
    createWorship,
    updateWorship,
    deleteWorship
  } = useWorships();

  const {
    musicians,
    isLoading: musiciansLoading,
    error: musiciansError,
    createMusician,
    updateMusician,
    deleteMusician
  } = useMusicians();

  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [editingWorship, setEditingWorship] = useState<Worship | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);
  const [showMusicianModal, setShowMusicianModal] = useState(false);
  const [editingMusician, setEditingMusician] = useState<Musician | null>(null);

  if (!user || !hasPermission('canManageWorship')) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={48} color={secondaryColor} />
          <ThemedText style={[styles.accessDeniedText, { color: textColor }]}>
            {t('common.accessDenied')}
          </ThemedText>
          <ThemedText style={[styles.accessDeniedSubtext, { color: secondaryColor }]}>
            {t('worships.accessDenied')}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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

  const handleDeleteWorship = async (id: number) => {
    Alert.alert(
      t('common.confirmDelete'),
      t('worships.confirmDeleteMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorship(id);
              Alert.alert(t('common.success'), t('worships.deletedSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), t('worships.deleteError'));
            }
          }
        }
      ]
    );
  };

  const handleSaveWorship = async (worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingWorship && editingWorship.id) {
        await updateWorship(editingWorship.id, worshipData);
        Alert.alert(t('common.success'), t('worships.updatedSuccess'));
      } else {
        await createWorship(worshipData);
        Alert.alert(t('common.success'), t('worships.createdSuccess'));
      }
      setShowWorshipModal(false);
      setEditingWorship(null);
    } catch (error) {
      Alert.alert(t('common.error'), t('worships.saveError'));
    }
  };

  const handleCloseWorshipModal = () => {
    setShowWorshipModal(false);
    setEditingWorship(null);
  };

  const handleAddMusician = () => {
    setEditingMusician(null);
    setShowMusicianModal(true);
  };

  const handleEditMusician = (id: number) => {
    const musician = musicians.find(m => m.id === id);
    if (musician) {
      setEditingMusician(musician);
      setShowMusicianModal(true);
    }
  };

  const handleDeleteMusician = async (id: number) => {
    Alert.alert(
      t('common.confirmDelete'),
      t('worships.confirmDeleteMusician'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMusician(id);
              Alert.alert(t('common.success'), t('worships.musicianDeletedSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), t('worships.musicianDeleteError'));
            }
          }
        }
      ]
    );
  };

  const getWorshipStats = () => {
    const today = new Date();
    const upcomingThisWeek = worships.filter(w => {
      const worshipDate = new Date(w.date);
      const diffTime = worshipDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
    
    const totalMusicians = musicians.length;
    const totalSongs = worships.reduce((sum, w) => sum + (w.songs?.length || 0), 0);
    const averageSongsPerWorship = worships.length > 0 ? totalSongs / worships.length : 0;
    
    return {
      totalWorships: worships.length,
      upcomingThisWeek: upcomingThisWeek.length,
      totalMusicians,
      totalSongs,
      averageSongsPerWorship: averageSongsPerWorship.toFixed(1)
    };
  };

  const stats = getWorshipStats();

  const handleSaveMusician = async (musicianData: Omit<Musician, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingMusician && editingMusician.id) {
        await updateMusician(editingMusician.id, musicianData);
        Alert.alert(t('common.success'), t('worships.musicianUpdatedSuccess'));
      } else {
        await createMusician(musicianData);
        Alert.alert(t('common.success'), t('worships.musicianCreatedSuccess'));
      }
      setShowMusicianModal(false);
      setEditingMusician(null);
    } catch (error) {
      Alert.alert(t('common.error'), t('worships.musicianSaveError'));
    }
  };

  const handleCloseMusicianModal = () => {
    setShowMusicianModal(false);
    setEditingMusician(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {t('worships.title')}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
            {t('worships.subtitle')}
          </ThemedText>
        </View>

        <View style={styles.quickAction}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: primaryColor }]}
            onPress={handleAddWorship}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <ThemedText style={styles.createButtonText}>
              {t('worships.add')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              {t('worships.scheduled')}
            </ThemedText>
            <View style={[styles.countBadge, { backgroundColor: cardColor, borderColor }]}>
              <ThemedText style={[styles.countText, { color: primaryColor }]}>
                {worships.length}
              </ThemedText>
            </View>
          </View>
          
          {worships.length > 0 ? (
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
          ) : (
            <View style={[styles.emptyState, { backgroundColor: cardColor, borderColor }]}>
              <Ionicons name="calendar-outline" size={48} color={secondaryColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                {t('worships.noUpcoming')}
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: secondaryColor }]}>
                {t('worships.noUpcomingDescription')}
              </ThemedText>
            </View>
          )}
        </View>

        {hasPermission('canManageTeam') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('team.title')}
              </ThemedText>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: '#8b5cf6' }]}
                onPress={handleAddMusician}
              >
                <Ionicons name="person-add" size={16} color="white" />
                <ThemedText style={styles.addButtonText}>
                  {t('team.add')}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {musicians.length > 0 ? (
              <View style={styles.musiciansList}>
                {musicians.map((musician) => (
                  <View key={musician.id} style={[styles.musicianCard, { backgroundColor: cardColor, borderColor }]}>
                    <View style={styles.musicianHeader}>
                      <View style={styles.musicianInfo}>
                        <View style={[styles.musicianTypeIcon, { 
                          backgroundColor: musician.type === 'chantre' ? '#10b98120' : '#f59e0b20' 
                        }]}>
                          <Ionicons 
                            name={musician.type === 'chantre' ? 'mic' : 'musical-notes'} 
                            size={20} 
                            color={musician.type === 'chantre' ? '#10b981' : '#f59e0b'} 
                          />
                        </View>
                        <View style={styles.musicianDetails}>
                          <ThemedText style={[styles.musicianName, { color: textColor }]}>
                            {musician.name}
                          </ThemedText>
                          <ThemedText style={[styles.musicianRole, { color: secondaryColor }]}>
                            {musician.type === 'chantre' 
                              ? `${t('musician.type.singer')} - ${musician.voiceType}` 
                              : `${t('musician.type.instrumentalist')} - ${musician.instruments?.join(', ')}`
                            }
                          </ThemedText>
                          <ThemedText style={[styles.musicianContact, { color: secondaryColor }]}>
                            {musician.email} • {musician.phone}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.musicianActions}>
                        <TouchableOpacity
                          onPress={() => handleEditMusician(musician.id!)}
                          style={[styles.actionButton, { backgroundColor: primaryColor }]}
                        >
                          <Ionicons name="pencil" size={12} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteMusician(musician.id!)}
                          style={[styles.actionButton, { backgroundColor: errorColor }]}
                        >
                          <Ionicons name="trash" size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {musician.availability && musician.availability.length > 0 && (
                      <View style={[styles.availabilitySection, { borderTopColor: borderColor }]}>
                        <ThemedText style={[styles.availabilityTitle, { color: textColor }]}>
                          {t('worships.availability')}
                        </ThemedText>
                        <View style={styles.availabilityTags}>
                          {musician.availability.map((availability, index) => (
                            <View key={index} style={[styles.availabilityTag, { backgroundColor: `${primaryColor}20`, borderColor: primaryColor }]}>
                              <ThemedText style={[styles.availabilityText, { color: primaryColor }]}>
                                {availability}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {musician.notes && (
                      <View style={[styles.notesSection, { borderTopColor: borderColor }]}>
                        <ThemedText style={[styles.notesText, { color: secondaryColor }]}>
                          {musician.notes}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: cardColor, borderColor }]}>
                <Ionicons name="people-outline" size={48} color={secondaryColor} />
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                  {t('worships.noMusicians')}
                </ThemedText>
                <ThemedText style={[styles.emptyDescription, { color: secondaryColor }]}>
                  {t('worships.noMusiciansDescription')}
                </ThemedText>
              </View>
            )}
          </View>
        )}

              </ScrollView>

      <WorshipFormModal
        visible={showWorshipModal}
        worship={editingWorship}
        onClose={handleCloseWorshipModal}
        onSave={handleSaveWorship}
      />

      <MusicianFormModal
        visible={showMusicianModal}
        musician={editingMusician}
        onClose={handleCloseMusicianModal}
        onSave={handleSaveMusician}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  quickAction: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
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
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  worshipsList: {
    gap: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  musiciansList: {
    gap: 16,
  },
  musicianCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  musicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  musicianInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  musicianTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicianDetails: {
    flex: 1,
  },
  musicianName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  musicianRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  musicianContact: {
    fontSize: 12,
  },
  musicianActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilitySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  availabilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  availabilityTag: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
