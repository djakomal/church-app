import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useT } from '@/context/I18nContext';

export interface Musician {
  id?: number;
  name: string;
  email: string;
  phone: string;
  type: 'chantre' | 'instrumentiste';
  voiceType?: string;
  instruments?: string[];
  availability?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface MusicianFormModalProps {
  visible: boolean;
  musician?: Musician | null;
  onClose: () => void;
  onSave: (musician: Omit<Musician, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function MusicianFormModal({ visible, musician, onClose, onSave }: MusicianFormModalProps) {
  const [formData, setFormData] = useState<Omit<Musician, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    email: '',
    phone: '',
    type: 'chantre',
    voiceType: 'soprano',
    instruments: [],
    availability: [],
    notes: ''
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');

  const t = useT();

  useEffect(() => {
    if (musician) {
      setFormData({
        name: musician.name,
        email: musician.email,
        phone: musician.phone,
        type: musician.type,
        voiceType: musician.voiceType,
        instruments: musician.instruments || [],
        availability: musician.availability || [],
        notes: musician.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'chantre',
        voiceType: 'soprano',
        instruments: [],
        availability: [],
        notes: ''
      });
    }
  }, [musician, visible]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('error'), t('musicianFormModal.nameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert(t('error'), t('musicianFormModal.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(t('error'), t('musicianFormModal.invalidEmail'));
      return;
    }

    if (formData.type === 'instrumentiste' && formData.instruments!.length === 0) {
      Alert.alert(t('error'), t('musicianFormModal.instrumentRequired'));
      return;
    }

    onSave(formData);
  };

  const voiceTypes = [
    { value: 'soprano', label: t('musicianFormModal.voiceSoprano'), icon: 'musical-note' },
    { value: 'alto', label: t('musicianFormModal.voiceAlto'), icon: 'musical-note' },
    { value: 'tenor', label: t('musicianFormModal.voiceTenor'), icon: 'musical-note' },
    { value: 'basse', label: t('musicianFormModal.voiceBass'), icon: 'musical-note' }
  ];

  const commonInstruments = [
    'Piano', 'Guitare', 'Basse', 'Batterie', 'Violon', 'Saxophone', 
    'Trompette', 'Flûte', 'Clavier', 'Orgue', 'Djembé', 'Cajon'
  ];

  const availabilityOptions = [
    'Dimanche matin', 'Dimanche soir', 'Mercredi soir', 
    'Vendredi soir', 'Samedi soir', 'Événements spéciaux'
  ];

  const toggleInstrument = (instrument: string) => {
    const currentInstruments = formData.instruments || [];
    if (currentInstruments.includes(instrument)) {
      setFormData({
        ...formData,
        instruments: currentInstruments.filter(i => i !== instrument)
      });
    } else {
      setFormData({
        ...formData,
        instruments: [...currentInstruments, instrument]
      });
    }
  };

  const toggleAvailability = (availability: string) => {
    const currentAvailability = formData.availability || [];
    if (currentAvailability.includes(availability)) {
      setFormData({
        ...formData,
        availability: currentAvailability.filter(a => a !== availability)
      });
    } else {
      setFormData({
        ...formData,
        availability: [...currentAvailability, availability]
      });
    }
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
            {musician ? t('musicianFormModal.editTitle') : t('musicianFormModal.addTitle')}
          </ThemedText>
          <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('musicianFormModal.personalInfo')}
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('musicianFormModal.fullName')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t('musicianFormModal.fullNamePlaceholder')}
                  placeholderTextColor={placeholderColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('musicianFormModal.email')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder={t('musicianFormModal.emailPlaceholder')}
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('musicianFormModal.phone')}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder={t('musicianFormModal.phonePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('musicianFormModal.musicianType')}
              </ThemedText>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: cardColor, borderColor },
                    formData.type === 'chantre' && { borderColor: primaryColor, borderWidth: 2 }
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'chantre', instruments: [] })}
                >
                  <Ionicons 
                    name="mic" 
                    size={24} 
                    color={formData.type === 'chantre' ? primaryColor : secondaryColor} 
                  />
                  <ThemedText style={[
                    styles.typeLabel, 
                    { color: formData.type === 'chantre' ? textColor : secondaryColor }
                  ]}>
                    {t('musicianFormModal.singer')}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: cardColor, borderColor },
                    formData.type === 'instrumentiste' && { borderColor: primaryColor, borderWidth: 2 }
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'instrumentiste', voiceType: undefined })}
                >
                  <Ionicons 
                    name="musical-notes" 
                    size={24} 
                    color={formData.type === 'instrumentiste' ? primaryColor : secondaryColor} 
                  />
                  <ThemedText style={[
                    styles.typeLabel, 
                    { color: formData.type === 'instrumentiste' ? textColor : secondaryColor }
                  ]}>
                    {t('musicianFormModal.instrumentalist')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {formData.type === 'chantre' && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  {t('musicianFormModal.voiceType')}
                </ThemedText>

                <View style={styles.voiceGrid}>
                  {voiceTypes.map((voice) => (
                    <TouchableOpacity
                      key={voice.value}
                      style={[
                        styles.voiceOption,
                        { backgroundColor: cardColor, borderColor },
                        formData.voiceType === voice.value && { borderColor: primaryColor, borderWidth: 2 }
                      ]}
                      onPress={() => setFormData({ ...formData, voiceType: voice.value as any })}
                    >
                      <Ionicons 
                        name={voice.icon as any} 
                        size={20} 
                        color={formData.voiceType === voice.value ? primaryColor : secondaryColor} 
                      />
                      <ThemedText style={[
                        styles.voiceLabel, 
                        { color: formData.voiceType === voice.value ? textColor : secondaryColor }
                      ]}>
                        {voice.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {formData.type === 'instrumentiste' && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  {t('musicianFormModal.instruments')}
                </ThemedText>

                <View style={styles.instrumentsGrid}>
                  {commonInstruments.map((instrument) => (
                    <TouchableOpacity
                      key={instrument}
                      style={[
                        styles.instrumentOption,
                        { backgroundColor: cardColor, borderColor },
                        formData.instruments?.includes(instrument) && { 
                          borderColor: primaryColor, 
                          borderWidth: 2,
                          backgroundColor: `${primaryColor}20`
                        }
                      ]}
                      onPress={() => toggleInstrument(instrument)}
                    >
                      <ThemedText style={[
                        styles.instrumentLabel, 
                        { color: formData.instruments?.includes(instrument) ? primaryColor : textColor }
                      ]}>
                        {instrument}
                      </ThemedText>
                      {formData.instruments?.includes(instrument) && (
                        <Ionicons name="checkmark" size={16} color={primaryColor} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('musicianFormModal.availability')}
              </ThemedText>

              <View style={styles.availabilityGrid}>
                {availabilityOptions.map((availability) => (
                  <TouchableOpacity
                    key={availability}
                    style={[
                      styles.availabilityOption,
                      { backgroundColor: cardColor, borderColor },
                      formData.availability?.includes(availability) && { 
                        borderColor: primaryColor, 
                        borderWidth: 2,
                        backgroundColor: `${primaryColor}20`
                      }
                    ]}
                    onPress={() => toggleAvailability(availability)}
                  >
                    <ThemedText style={[
                      styles.availabilityLabel, 
                      { color: formData.availability?.includes(availability) ? primaryColor : textColor }
                    ]}>
                      {availability}
                    </ThemedText>
                    {formData.availability?.includes(availability) && (
                      <Ionicons name="checkmark" size={16} color={primaryColor} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('musicianFormModal.extraNotes')}
              </ThemedText>

              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder={t('musicianFormModal.notesPlaceholder')}
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
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
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    minHeight: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  voiceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instrumentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  instrumentLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availabilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
