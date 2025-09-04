import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { WorshipCard } from './WorshipCard';
import { WorshipFormModal } from './WorshipFormModal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useWorships } from '@/hooks/useSimpleDatabase';
import { Worship } from '@/database/simpleDatabase';

export function WorshipDetailsForm() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const errorColor = useThemeColor({}, 'error');

  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [editingWorship, setEditingWorship] = useState<Worship | null>(null);

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
    try {
      await deleteWorship(id);
      Alert.alert('Succès', 'Le culte a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le culte');
    }
  };

  const handleDuplicateWorship = async (id: number) => {
    const worship = worships.find(w => w.id === id);
    if (worship) {
      try {
        // Créer une copie avec une nouvelle date (dimanche suivant)
        const originalDate = new Date(worship.date);
        const nextWeek = new Date(originalDate);
        nextWeek.setDate(originalDate.getDate() + 7);
        
        const duplicatedWorship = {
          ...worship,
          title: `${worship.title} (Copie)`,
          date: nextWeek.toISOString().split('T')[0],
          id: undefined,
          created_at: undefined,
          updated_at: undefined
        };
        
        await createWorship(duplicatedWorship);
        Alert.alert('Succès', 'Le culte a été dupliqué avec succès');
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de dupliquer le culte');
      }
    }
  };

  const handleSaveWorship = async (worshipData: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingWorship && editingWorship.id) {
        await updateWorship(editingWorship.id, worshipData);
        Alert.alert('Succès', 'Le culte a été modifié avec succès');
      } else {
        await createWorship(worshipData);
        Alert.alert('Succès', 'Le culte a été créé avec succès');
      }
      setShowWorshipModal(false);
      setEditingWorship(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le culte');
    }
  };

  const handleCloseWorshipModal = () => {
    setShowWorshipModal(false);
    setEditingWorship(null);
  };

  // Séparer les cultes par statut
  const now = new Date();
  const upcomingWorships = worships.filter(w => new Date(`${w.date}T${w.time}`) >= now);
  const pastWorships = worships.filter(w => new Date(`${w.date}T${w.time}`) < now);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor, borderColor }]}>
        <ThemedText style={[styles.errorText, { color: errorColor }]}>
          Erreur lors du chargement des cultes
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Gestion des Cultes
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

      {isLoading ? (
        <ThemedText style={[styles.loadingText, { color: secondaryColor }]}>
          Chargement des cultes...
        </ThemedText>
      ) : (
        <ScrollView style={styles.worshipsList} showsVerticalScrollIndicator={false}>
          {/* Cultes à venir */}
          {upcomingWorships.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Cultes à venir ({upcomingWorships.length})
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
                  description={worship.description}
                  onEdit={() => handleEditWorship(worship.id!)}
                  onDelete={() => handleDeleteWorship(worship.id!)}
                  onDuplicate={() => handleDuplicateWorship(worship.id!)}
                />
              ))}
            </View>
          )}

          {/* Cultes passés */}
          {pastWorships.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Cultes passés ({pastWorships.length})
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
                  description={worship.description}
                  onEdit={() => handleEditWorship(worship.id!)}
                  onDelete={() => handleDeleteWorship(worship.id!)}
                  onDuplicate={() => handleDuplicateWorship(worship.id!)}
                />
              ))}
              {pastWorships.length > 5 && (
                <ThemedText style={[styles.moreText, { color: secondaryColor }]}>
                  ... et {pastWorships.length - 5} autres cultes passés
                </ThemedText>
              )}
            </View>
          )}

          {/* Message si aucun culte */}
          {worships.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={secondaryColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Aucun culte planifié
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                Commencez par créer votre premier culte
              </ThemedText>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                onPress={handleAddWorship}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText style={styles.emptyButtonText}>
                  Créer un culte
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal pour ajouter/modifier un culte */}
      <WorshipFormModal
        visible={showWorshipModal}
        worship={editingWorship}
        onClose={handleCloseWorshipModal}
        onSave={handleSaveWorship}
      />
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
});
