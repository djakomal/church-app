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

export interface Worship {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme: string;
  preacher: string;
  description: string;
  songs: string[];
  musicians: string[];
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
    musicians: []
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');

  useEffect(() => {
    if (worship) {
      setFormData({
        title: worship.title,
        date: worship.date,
        time: worship.time,
        location: worship.location,
        theme: worship.theme,
        preacher: worship.preacher,
        description: worship.description,
        songs: worship.songs,
        musicians: worship.musicians
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
        musicians: []
      });
    }
  }, [worship, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!formData.date.trim()) {
      Alert.alert('Erreur', 'La date est obligatoire');
      return;
    }

    if (!formData.time.trim()) {
      Alert.alert('Erreur', 'L\'heure est obligatoire');
      return;
    }

    // Validation du format de date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Erreur', 'Format de date invalide (YYYY-MM-DD)');
      return;
    }

    // Validation du format d'heure
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(formData.time)) {
      Alert.alert('Erreur', 'Format d\'heure invalide (HH:MM)');
      return;
    }

    onSave(formData);
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
            {worship ? 'Modifier le Culte' : 'Nouveau Culte'}
          </ThemedText>
          <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.saveButtonText}>Sauvegarder</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Titre */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Titre du Culte *
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Ex: Culte du Dimanche"
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Date et Heure */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Date *
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={placeholderColor}
                />
                {formData.date && (
                  <ThemedText style={[styles.datePreview, { color: secondaryColor }]}>
                    {formatDateForDisplay(formData.date)}
                  </ThemedText>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Heure *
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

            {/* Lieu */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Lieu
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Ex: Sanctuaire principal"
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Thème */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Thème
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.theme}
                onChangeText={(text) => setFormData({ ...formData, theme: text })}
                placeholder="Ex: L'amour de Dieu"
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Prédicateur */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Prédicateur
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.preacher}
                onChangeText={(text) => setFormData({ ...formData, preacher: text })}
                placeholder="Nom du prédicateur"
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Description
              </ThemedText>
              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description du culte, notes spéciales..."
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Chants */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Chants (séparés par des virgules)
              </ThemedText>
              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                value={formData.songs.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  songs: text.split(',').map(s => s.trim()).filter(s => s.length > 0)
                })}
                placeholder="Ex: Amazing Grace, How Great Thou Art"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Musiciens */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Musiciens (séparés par des virgules)
              </ThemedText>
              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                value={formData.musicians.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  musicians: text.split(',').map(s => s.trim()).filter(s => s.length > 0)
                })}
                placeholder="Ex: Jean Dupont, Marie Martin"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={3}
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
});