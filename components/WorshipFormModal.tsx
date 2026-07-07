import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useT } from '@/context/I18nContext';
import { SongPickerModal } from './SongPickerModal';
import { WorshipAssignmentModal } from './WorshipAssignmentModal';
import { useMusicians } from '@/hooks/useSimpleDatabase';

export interface Worship {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme?: string;
  preacher?: string;
  description?: string;
  songs?: string[];
  musicians?: string[];
  assignedMusicians?: number[];
  created_at?: string;
  updated_at?: string;
}

interface WorshipFormModalProps {
  visible: boolean;
  worship?: Worship | null;
  onClose: () => void;
  onSave: (worship: Omit<Worship, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function WorshipFormModal({ visible, worship, onClose, onSave }: WorshipFormModalProps) {
  const [formData, setFormData] = useState<Omit<Worship, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    date: '',
    time: '',
    location: '',
    theme: '',
    preacher: '',
    description: '',
    songs: [],
    musicians: [],
    assignedMusicians: []
  });

  const { musicians: allMusicians } = useMusicians();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');

  const t = useT();

  useEffect(() => {
    if (worship) {
      const songs = Array.isArray(worship.songs) ? worship.songs : [];
      const assignedMusicians = Array.isArray(worship.assignedMusicians) ? worship.assignedMusicians : [];
      setFormData({
        title: worship.title || '',
        date: worship.date || '',
        time: worship.time || '',
        location: worship.location || '',
        theme: worship.theme || '',
        preacher: worship.preacher || '',
        description: worship.description || '',
        songs,
        musicians: Array.isArray(worship.musicians) ? worship.musicians : [],
        assignedMusicians,
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        theme: '',
        preacher: '',
        description: '',
        songs: [],
        musicians: [],
        assignedMusicians: []
      });
    }
  }, [worship, visible]);

  const handleSave = () => {
    console.log('[WorshipFormModal] handleSave called', JSON.stringify({title: formData.title, date: formData.date, time: formData.time}));
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!formData.title.trim()) { window.alert('Titre obligatoire'); return; }
    if (!formData.date.trim()) { window.alert('Date obligatoire'); return; }
    if (!formData.time.trim()) { window.alert('Heure obligatoire'); return; }
    if (!dateRegex.test(formData.date)) { window.alert('Format de date invalide (AAAA-MM-JJ)'); return; }
    if (!timeRegex.test(formData.time)) { window.alert('Format d\'heure invalide (HH:MM)'); return; }
    try {
      const ids = Array.isArray(formData.assignedMusicians) ? formData.assignedMusicians : [];
      const musicianNames = ids.map(id => {
        const m = allMusicians?.find(m => m?.id === id);
        return m?.name || '';
      }).filter(Boolean);
      onSave({ ...formData, musicians: musicianNames });
      console.log('[WorshipFormModal] onSave called successfully');
    } catch (err) {
      window.alert('Erreur: ' + err);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
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
              {worship ? t('worshipFormModal.editTitle') : t('worshipFormModal.addTitle')}
            </ThemedText>
            <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.worshipTitle')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder={t('worshipFormModal.worshipTitlePlaceholder')}
                  placeholderTextColor={placeholderColor}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('worshipFormModal.date')}
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={placeholderColor}
                  />
                {formData.date ? (
                  <ThemedText style={[styles.datePreview, { color: secondaryColor }]}>
                    {formatDateForDisplay(formData.date)}
                  </ThemedText>
                ) : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('worshipFormModal.time')}
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                    placeholder="HH:MM"
                    placeholderTextColor={placeholderColor}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.location')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder={t('worshipFormModal.locationPlaceholder')}
                  placeholderTextColor={placeholderColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.theme')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.theme}
                  onChangeText={(text) => setFormData({ ...formData, theme: text })}
                  placeholder={t('worshipFormModal.themePlaceholder')}
                  placeholderTextColor={placeholderColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.preacher')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.preacher}
                  onChangeText={(text) => setFormData({ ...formData, preacher: text })}
                  placeholder={t('worshipFormModal.preacherPlaceholder')}
                  placeholderTextColor={placeholderColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.description')}
                </ThemedText>
                <TextInput
                  style={[styles.textArea, { color: textColor, borderColor }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder={t('worshipFormModal.descriptionPlaceholder')}
                  placeholderTextColor={placeholderColor}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.songs')}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.musicianSelectButton, { borderColor, backgroundColor: borderColor + '20' }]}
                  onPress={() => setShowSongPicker(true)}
                >
                  <Ionicons name="musical-notes" size={20} color={textColor} />
                  <ThemedText style={[styles.musicianSelectText, { color: textColor }]}>
                    {(formData.songs || []).length > 0
                      ? `${(formData.songs || []).length} chant(s) sélectionné(s)`
                      : t('worshipFormModal.selectSongs')}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
                </TouchableOpacity>
                {(formData.songs || []).length > 0 && (
                  <View style={styles.selectedMusiciansList}>
                    {(formData.songs || []).map((title, idx) => (
                      <View key={idx} style={[styles.selectedMusicianTag, { backgroundColor: primaryColor + '20', borderColor: primaryColor }]}>
                        <Ionicons name="musical-note" size={12} color={primaryColor} />
                        <ThemedText style={[styles.selectedMusicianTagText, { color: primaryColor }]}>
                          {title}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('worshipFormModal.musicians')}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.musicianSelectButton, { borderColor, backgroundColor: borderColor + '20' }]}
                  onPress={() => setShowAssignmentModal(true)}
                >
                  <Ionicons name="people" size={20} color={textColor} />
                  <ThemedText style={[styles.musicianSelectText, { color: textColor }]}>
                    {(formData.assignedMusicians || []).length > 0
                      ? `${(formData.assignedMusicians || []).length} musicien(s) sélectionné(s)`
                      : t('worshipFormModal.selectMusicians')}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
                </TouchableOpacity>
                {(formData.assignedMusicians || []).length > 0 && (
                  <View style={styles.selectedMusiciansList}>
                    {(formData.assignedMusicians || []).map(id => {
                      const musician = allMusicians.find(m => m.id === id);
                      return musician ? (
                        <View key={id} style={[styles.selectedMusicianTag, { backgroundColor: primaryColor + '20', borderColor: primaryColor }]}>
                          <Ionicons
                            name={musician.type === 'chantre' ? 'mic' : 'musical-notes'}
                            size={12}
                            color={primaryColor}
                          />
                          <ThemedText style={[styles.selectedMusicianTagText, { color: primaryColor }]}>
                            {musician.name}
                          </ThemedText>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <SongPickerModal
        visible={showSongPicker}
        selectedTitles={formData.songs || []}
        onClose={() => setShowSongPicker(false)}
        onSave={(titles, ids) => {
          setFormData(prev => ({ ...prev, songs: titles }));
          setShowSongPicker(false);
        }}
      />

      <WorshipAssignmentModal
        visible={showAssignmentModal}
        selectedIds={formData.assignedMusicians || []}
        onClose={() => setShowAssignmentModal(false)}
        onSave={(musicianIds) => {
          setFormData(prev => ({ ...prev, assignedMusicians: musicianIds }));
          setShowAssignmentModal(false);
        }}
      />
    </>
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
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  datePreview: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  musicianSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  musicianSelectText: {
    flex: 1,
    fontSize: 16,
  },
  selectedMusiciansList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  selectedMusicianTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedMusicianTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
