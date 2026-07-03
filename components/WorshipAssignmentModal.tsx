import { useThemeColor } from '@/hooks/useThemeColor';
import { useMusicians } from '@/hooks/useSimpleDatabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useT } from '@/context/I18nContext';
import { Musician } from '@/database/simpleDatabase';

interface WorshipAssignmentModalProps {
  visible: boolean;
  selectedIds: number[];
  onClose: () => void;
  onSave: (musicianIds: number[]) => void;
}

export function WorshipAssignmentModal({
  visible,
  selectedIds,
  onClose,
  onSave
}: WorshipAssignmentModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const successColor = useThemeColor({}, 'success');

  const t = useT();
  const { musicians, isLoading } = useMusicians();
  const [selected, setSelected] = useState<number[]>(selectedIds);

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds, visible]);

  const toggleMusician = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(mid => mid !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Assigner des musiciens
          </ThemedText>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: primaryColor }]}
          >
            <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ThemedText style={[styles.loadingText, { color: secondaryColor }]}>
              Chargement...
            </ThemedText>
          ) : musicians.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={secondaryColor} />
              <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                Aucun musicien disponible. Ajoutez-en d'abord.
              </ThemedText>
            </View>
          ) : (
            musicians.map(musician => {
              const isSelected = selected.includes(musician.id!);
              return (
                <TouchableOpacity
                  key={musician.id}
                  style={[
                    styles.musicianItem,
                    { borderColor },
                    isSelected && { borderColor: primaryColor, backgroundColor: primaryColor + '15' }
                  ]}
                  onPress={() => toggleMusician(musician.id!)}
                >
                  <View style={styles.musicianInfo}>
                    <Ionicons
                      name={musician.type === 'chantre' ? 'mic' : 'musical-notes'}
                      size={20}
                      color={secondaryColor}
                    />
                    <View style={styles.musicianDetails}>
                      <ThemedText style={[styles.musicianName, { color: textColor }]}>
                        {musician.name}
                      </ThemedText>
                      <ThemedText style={[styles.musicianType, { color: secondaryColor }]}>
                        {musician.type === 'chantre' ? 'Chantre' : 'Instrumentiste'}
                        {musician.voiceType ? ` - ${musician.voiceType}` : ''}
                        {musician.instruments?.length ? ` - ${musician.instruments.join(', ')}` : ''}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.checkbox, isSelected && { backgroundColor: primaryColor }]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  musicianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  musicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  musicianDetails: {
    gap: 2,
  },
  musicianName: {
    fontSize: 16,
    fontWeight: '600',
  },
  musicianType: {
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
