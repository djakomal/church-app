import { WorshipStatus } from '@/database/simpleDatabase';
import { useWorships } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { WorshipCard } from './WorshipCard';
import { WorshipFormModal } from './WorshipFormModal';
import { WorshipAssignmentModal } from './WorshipAssignmentModal';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';

type FilterTab = 'all' | 'draft' | 'published';

export function WorshipDetailsForm() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');

  const t = useT();
  const { user, hasPermission } = useAuth();

  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [editingWorship, setEditingWorship] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assigningWorship, setAssigningWorship] = useState<any>(null);

  const {
    worships,
    isLoading,
    error,
    createWorship,
    updateWorship,
    deleteWorship
  } = useWorships();

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
              Alert.alert(t('success'), t('worships.deletedSuccess'));
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert(t('error'), 'Erreur lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const handleDuplicateWorship = async (id: number) => {
    const worship = worships.find(w => w.id === id);
    if (worship) {
      try {
        setIsSaving(true);
        
        const originalDate = new Date(worship.date);
        const nextWeek = new Date(originalDate);
        nextWeek.setDate(originalDate.getDate() + 7);
        
        const duplicatedWorship = {
          title: `${worship.title} (Copie)`,
          date: nextWeek.toISOString().split('T')[0],
          time: worship.time,
          location: worship.location,
          theme: worship.theme || '',
          description: worship.description || '',
        };
        
        await createWorship(duplicatedWorship);
        Alert.alert(t('success'), 'Culte dupliqué avec succès');
      } catch (error) {
        console.error('Erreur duplication:', error);
        Alert.alert(t('error'), 'Erreur lors de la duplication');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAssignMusicians = (worship: any) => {
    setAssigningWorship(worship);
    setShowAssignmentModal(true);
  };

  const handleSaveAssignments = async (musicianIds: number[]) => {
    if (!assigningWorship?.id) return;
    try {
      await updateWorship(assigningWorship.id, {
        title: assigningWorship.title,
        date: assigningWorship.date,
        time: assigningWorship.time,
        location: assigningWorship.location || '',
        theme: assigningWorship.theme || '',
        preacher: assigningWorship.preacher || '',
        description: assigningWorship.description || '',
        songs: assigningWorship.songs || [],
        musicians: assigningWorship.musicians || [],
        status: assigningWorship.status || 'draft',
        createdBy: assigningWorship.createdBy,
        assignedMusicians: musicianIds,
      });
      Alert.alert(t('success'), 'Musiciens assignés avec succès');
      setShowAssignmentModal(false);
      setAssigningWorship(null);
    } catch (error) {
      Alert.alert(t('error'), 'Erreur lors de l\'assignation');
    }
  };

  const handleValidateWorship = async (id: number) => {
    const worship = worships.find(w => w.id === id);
    if (!worship) return;
    try {
      await updateWorship(id, {
        title: worship.title,
        date: worship.date,
        time: worship.time,
        location: worship.location || '',
        theme: worship.theme || '',
        preacher: worship.preacher || '',
        description: worship.description || '',
        songs: worship.songs || [],
        musicians: worship.musicians || [],
        status: 'published',
        createdBy: worship.createdBy,
        assignedMusicians: worship.assignedMusicians || [],
      });
      Alert.alert(t('success'), 'Culte publié avec succès');
    } catch (error) {
      Alert.alert(t('error'), 'Erreur lors de la publication');
    }
  };

  const handleRejectWorship = async (id: number) => {
    Alert.alert(
      'Refuser le culte',
      'Le culte sera retourné au lead pour modification. Confirmer ?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            const worship = worships.find(w => w.id === id);
            if (!worship) return;
            try {
              await updateWorship(id, {
                title: worship.title,
                date: worship.date,
                time: worship.time,
                location: worship.location || '',
                theme: worship.theme || '',
                preacher: worship.preacher || '',
                description: worship.description || '',
                songs: worship.songs || [],
                musicians: worship.musicians || [],
                status: 'draft',
                createdBy: worship.createdBy,
                assignedMusicians: worship.assignedMusicians || [],
              });
              Alert.alert(t('success'), 'Culte retourné au lead');
            } catch (error) {
              Alert.alert(t('error'), 'Erreur lors du refus');
            }
          }
        }
      ]
    );
  };

  const handleSaveWorship = async (worshipData: any) => {
    try {
      setIsSaving(true);
      
      if (!worshipData.title?.trim()) {
        Alert.alert(t('error'), t('worshipDetailsForm.titleRequired'));
        return;
      }
      if (!worshipData.date) {
        Alert.alert(t('error'), t('worshipDetailsForm.dateRequired'));
        return;
      }
      if (!worshipData.time) {
        Alert.alert(t('error'), t('worshipDetailsForm.timeRequired'));
        return;
      }

      const cleanedData = {
        title: worshipData.title.trim(),
        date: worshipData.date,
        time: worshipData.time,
        location: worshipData.location?.trim() || '',
        theme: worshipData.theme?.trim() || '',
        preacher: worshipData.preacher?.trim() || '',
        description: worshipData.description?.trim() || '',
        songs: worshipData.songs || [],
        musicians: worshipData.musicians || [],
        status: (editingWorship ? editingWorship.status : 'draft') as WorshipStatus,
        createdBy: editingWorship ? editingWorship.createdBy : user?.id,
        assignedMusicians: editingWorship?.assignedMusicians || [],
      };

      if (editingWorship && editingWorship.id) {
        await updateWorship(editingWorship.id, cleanedData);
        Alert.alert(t('success'), t('worshipDetailsForm.updatedSuccess'));
      } else {
        await createWorship(cleanedData);
        Alert.alert(t('success'), t('worshipDetailsForm.createdSuccess'));
      }
      
      setShowWorshipModal(false);
      setEditingWorship(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert(t('error'), 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseWorshipModal = () => {
    if (!isSaving) {
      setShowWorshipModal(false);
      setEditingWorship(null);
    }
  };

  const canValidate = hasPermission('canValidateWorship');
  const isEditor = user?.role === 'editor';

  const filteredWorships = worships.filter(w => {
    if (activeFilter === 'all') return true;
    return w.status === activeFilter;
  });

  const draftWorships = filteredWorships
    .filter(w => w.status === 'draft' || !w.status)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const publishedWorships = filteredWorships
    .filter(w => w.status === 'published')
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const now = new Date();
  const upcomingWorships = publishedWorships
    .filter(w => new Date(`${w.date}T${w.time}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  
  const pastWorships = publishedWorships
    .filter(w => new Date(`${w.date}T${w.time}`) < now)
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor, borderColor }]}>
        <ThemedText style={[styles.errorText, { color: errorColor }]}>
          {t('worshipDetailsForm.loadError', { message: error })}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {t('worships.title')}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={handleAddWorship}
          disabled={isSaving}
        >
          <Ionicons name="add" size={16} color="white" />
          <ThemedText style={styles.addButtonText}>
            {t('worshipDetailsForm.newWorship')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {canValidate && (
        <View style={styles.filterRow}>
          {(['all', 'draft', 'published'] as FilterTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterButton,
                activeFilter === tab && { backgroundColor: primaryColor },
              ]}
              onPress={() => setActiveFilter(tab)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  { color: activeFilter === tab ? 'white' : textColor },
                ]}
              >
                {tab === 'all' ? 'Tous' : tab === 'draft' ? 'Brouillons' : 'Publiés'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading ? (
        <ThemedText style={[styles.loadingText, { color: secondaryColor }]}>
          {t('worshipDetailsForm.loading')}
        </ThemedText>
      ) : (
        <ScrollView style={styles.worshipsList} showsVerticalScrollIndicator={false}>
          {draftWorships.length > 0 && (activeFilter !== 'published') && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Brouillons ({draftWorships.length})
              </ThemedText>
              {draftWorships.map((worship) => (
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
                  status={worship.status || 'draft'}
                  onEdit={() => handleEditWorship(worship.id!)}
                  onDelete={() => handleDeleteWorship(worship.id!)}
                  onAssignMusicians={canValidate ? () => handleAssignMusicians(worship) : undefined}
                  onValidate={canValidate ? () => handleValidateWorship(worship.id!) : undefined}
                  onReject={canValidate ? () => handleRejectWorship(worship.id!) : undefined}
                />
              ))}
            </View>
          )}

          {upcomingWorships.length > 0 && (activeFilter !== 'draft') && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('worshipDetailsForm.upcoming', { count: String(upcomingWorships.length) })}
              </ThemedText>
              {upcomingWorships.map((worship) => (
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
                  status={worship.status || 'draft'}
                  onEdit={canValidate ? () => handleEditWorship(worship.id!) : undefined}
                  onDelete={canValidate ? () => handleDeleteWorship(worship.id!) : undefined}
                />
              ))}
            </View>
          )}

          {pastWorships.length > 0 && (activeFilter !== 'draft') && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('worshipDetailsForm.past', { count: String(pastWorships.length) })}
              </ThemedText>
              {pastWorships.slice(0, 5).map((worship) => (
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
                  status={worship.status || 'draft'}
                  onEdit={canValidate ? () => handleEditWorship(worship.id!) : undefined}
                  onDelete={canValidate ? () => handleDeleteWorship(worship.id!) : undefined}
                />
              ))}
              {pastWorships.length > 5 && (
                <ThemedText style={[styles.moreText, { color: secondaryColor }]}>
                  {t('worshipDetailsForm.morePast', { count: String(pastWorships.length - 5) })}
                </ThemedText>
              )}
            </View>
          )}

          {filteredWorships.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={secondaryColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                {activeFilter === 'draft' ? 'Aucun brouillon' : t('worshipDetailsForm.noWorships')}
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                {activeFilter === 'draft' ? 'Les cultes en brouillon apparaîtront ici' : t('worshipDetailsForm.noWorshipsDesc')}
              </ThemedText>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                onPress={handleAddWorship}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText style={styles.emptyButtonText}>
                  {t('worshipDetailsForm.createWorship')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      <WorshipFormModal
        visible={showWorshipModal}
        worship={editingWorship}
        onClose={handleCloseWorshipModal}
        onSave={handleSaveWorship}
      />

      <WorshipAssignmentModal
        visible={showAssignmentModal}
        selectedIds={assigningWorship?.assignedMusicians || []}
        onClose={() => {
          setShowAssignmentModal(false);
          setAssigningWorship(null);
        }}
        onSave={handleSaveAssignments}
      />
      
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ThemedText style={[styles.savingText, { color: textColor }]}>
            {t('worshipDetailsForm.saving')}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  worshipsList: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  moreText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  savingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
