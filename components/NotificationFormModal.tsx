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

export interface NotificationData {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning';
  targetAudience: 'all' | 'musicians' | 'leaders' | 'active_members';
  scheduledDate?: string;
  isScheduled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface NotificationFormModalProps {
  visible: boolean;
  notification?: NotificationData | null;
  onClose: () => void;
  onSave: (notification: Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function NotificationFormModal({ visible, notification, onClose, onSave }: NotificationFormModalProps) {
  const [formData, setFormData] = useState<Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all',
    scheduledDate: '',
    isScheduled: false
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetAudience: notification.targetAudience,
        scheduledDate: notification.scheduledDate || '',
        isScheduled: notification.isScheduled
      });
    } else {
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all',
        scheduledDate: '',
        isScheduled: false
      });
    }
  }, [notification, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert('Erreur', 'Le message est obligatoire');
      return;
    }

    if (formData.isScheduled && !formData.scheduledDate.trim()) {
      Alert.alert('Erreur', 'La date de programmation est obligatoire');
      return;
    }

    if (formData.isScheduled && formData.scheduledDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateRegex.test(formData.scheduledDate)) {
        Alert.alert('Erreur', 'Format de date invalide (YYYY-MM-DDTHH:MM)');
        return;
      }
    }

    onSave(formData);
  };

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: 'information-circle', color: '#3b82f6' },
    { value: 'success', label: 'Succès', icon: 'checkmark-circle', color: '#10b981' },
    { value: 'warning', label: 'Attention', icon: 'warning', color: '#f59e0b' },
    { value: 'reminder', label: 'Rappel', icon: 'time', color: '#8b5cf6' },
    { value: 'urgent', label: 'Urgent', icon: 'alert-circle', color: '#ef4444' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'Tous les membres', icon: 'people' },
    { value: 'musicians', label: 'Musiciens', icon: 'musical-notes' },
    { value: 'leaders', label: 'Responsables', icon: 'shield-checkmark' },
    { value: 'active_members', label: 'Membres actifs', icon: 'person' }
  ];

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
            {notification ? 'Modifier la Notification' : 'Nouvelle Notification'}
          </ThemedText>
          <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.saveButtonText}>
              {formData.isScheduled ? 'Programmer' : 'Envoyer'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Titre */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Titre *
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Titre de la notification"
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Message *
              </ThemedText>
              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder="Contenu de la notification..."
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Type de notification */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Type de notification
              </ThemedText>
              <View style={styles.optionsGrid}>
                {notificationTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionCard,
                      { backgroundColor: cardColor, borderColor },
                      formData.type === type.value && { borderColor: type.color, borderWidth: 2 }
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.value as any })}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={formData.type === type.value ? type.color : secondaryColor} 
                    />
                    <ThemedText style={[
                      styles.optionText, 
                      { color: formData.type === type.value ? textColor : secondaryColor }
                    ]}>
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Public cible */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Public cible
              </ThemedText>
              <View style={styles.optionsGrid}>
                {targetAudiences.map((audience) => (
                  <TouchableOpacity
                    key={audience.value}
                    style={[
                      styles.optionCard,
                      { backgroundColor: cardColor, borderColor },
                      formData.targetAudience === audience.value && { borderColor: primaryColor, borderWidth: 2 }
                    ]}
                    onPress={() => setFormData({ ...formData, targetAudience: audience.value as any })}
                  >
                    <Ionicons 
                      name={audience.icon as any} 
                      size={20} 
                      color={formData.targetAudience === audience.value ? primaryColor : secondaryColor} 
                    />
                    <ThemedText style={[
                      styles.optionText, 
                      { color: formData.targetAudience === audience.value ? textColor : secondaryColor }
                    ]}>
                      {audience.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Programmation */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData({ ...formData, isScheduled: !formData.isScheduled })}
              >
                <Ionicons 
                  name={formData.isScheduled ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={primaryColor} 
                />
                <ThemedText style={[styles.checkboxLabel, { color: textColor }]}>
                  Programmer l'envoi
                </ThemedText>
              </TouchableOpacity>

              {formData.isScheduled && (
                <View style={styles.scheduledSection}>
                  <ThemedText style={[styles.sublabel, { color: secondaryColor }]}>
                    Date et heure d'envoi
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={formData.scheduledDate}
                    onChangeText={(text) => setFormData({ ...formData, scheduledDate: text })}
                    placeholder="YYYY-MM-DDTHH:MM"
                    placeholderTextColor={placeholderColor}
                  />
                  <ThemedText style={[styles.hint, { color: secondaryColor }]}>
                    Format: 2024-12-25T10:30 (25 décembre 2024 à 10h30)
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Aperçu */}
            <View style={styles.previewSection}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Aperçu
              </ThemedText>
              <View style={[styles.previewCard, { backgroundColor: cardColor, borderColor }]}>
                <View style={styles.previewHeader}>
                  <Ionicons 
                    name={notificationTypes.find(t => t.value === formData.type)?.icon as any} 
                    size={16} 
                    color={notificationTypes.find(t => t.value === formData.type)?.color} 
                  />
                  <ThemedText style={[styles.previewTitle, { color: textColor }]}>
                    {formData.title || 'Titre de la notification'}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.previewMessage, { color: secondaryColor }]}>
                  {formData.message || 'Contenu de la notification...'}
                </ThemedText>
                <ThemedText style={[styles.previewAudience, { color: secondaryColor }]}>
                  Pour: {targetAudiences.find(a => a.value === formData.targetAudience)?.label}
                </ThemedText>
              </View>
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
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduledSection: {
    marginTop: 12,
    gap: 8,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  previewSection: {
    gap: 12,
  },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewAudience: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});