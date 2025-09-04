import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Worship {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  theme?: string;
  description?: string;
}

interface WorshipFormModalProps {
  visible: boolean;
  worship?: Worship | null;
  onClose: () => void;
  onSave: (worship: Worship) => void;
}

const locations = [
  'Sanctuaire Principal',
  'Chapelle',
  'Salle de Conférence',
  'Amphithéâtre',
  'Salle Polyvalente',
  'Extérieur - Jardin',
  'Salle de Jeunesse',
  'Autre lieu'
];

const themes = [
  'Louange et Adoration',
  'Évangélisation',
  'Enseignement Biblique',
  'Prière et Intercession',
  'Communion Fraternelle',
  'Service de Noël',
  'Service de Pâques',
  'Baptême',
  'Mariage',
  'Funérailles',
  'Consécration',
  'Action de Grâces',
  'Jeûne et Prière',
  'Mission et Évangélisation',
  'Guérison et Délivrance'
];

export function WorshipFormModal({ visible, worship, onClose, onSave }: WorshipFormModalProps) {
  const [formData, setFormData] = useState<Worship>({
    title: '',
    date: '',
    time: '',
    location: 'Sanctuaire Principal',
    theme: '',
    description: ''
  });

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  useEffect(() => {
    if (worship) {
      setFormData(worship);
    } else {
      // Valeurs par défaut pour un nouveau culte
      const today = new Date();
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + (7 - today.getDay()));
      
      setFormData({
        title: '',
        date: nextSunday.toISOString().split('T')[0],
        time: '10:00',
        location: 'Sanctuaire Principal',
        theme: '',
        description: ''
      });
    }
  }, [worship, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre du culte est obligatoire');
      return;
    }

    if (!formData.date.trim()) {
      Alert.alert('Erreur', 'La date du culte est obligatoire');
      return;
    }

    if (!formData.time.trim()) {
      Alert.alert('Erreur', 'L\'heure du culte est obligatoire');
      return;
    }

    // Validation de la date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Erreur', 'Format de date invalide (YYYY-MM-DD)');
      return;
    }

    // Validation de l'heure
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(formData.time)) {
      Alert.alert('Erreur', 'Format d\'heure invalide (HH:MM)');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setShowLocationDropdown(false);
    setShowThemeDropdown(false);
    onClose();
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
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
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {worship ? 'Modifier le Culte' : 'Nouveau Culte'}
          </ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Titre */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Titre du Culte *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Ex: Service Dominical, Culte de Noël..."
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Date */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Date *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={placeholderColor}
            />
            {formData.date && (
              <ThemedText style={[styles.datePreview, { color: placeholderColor }]}>
                {formatDateForDisplay(formData.date)}
              </ThemedText>
            )}
          </View>

          {/* Heure */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Heure *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
              placeholder="HH:MM"
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Lieu */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Lieu *
            </ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor, borderColor }]}
              onPress={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                {formData.location}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={placeholderColor} />
            </TouchableOpacity>
            
            {showLocationDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {locations.map((location) => (
                    <TouchableOpacity
                      key={location}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, location });
                        setShowLocationDropdown(false);
                      }}
                    >
                      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                        {location}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Thème */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Thème
            </ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor, borderColor }]}
              onPress={() => setShowThemeDropdown(!showThemeDropdown)}
            >
              <ThemedText style={[styles.dropdownText, { color: formData.theme ? textColor : placeholderColor }]}>
                {formData.theme || 'Sélectionner un thème...'}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={placeholderColor} />
            </TouchableOpacity>
            
            {showThemeDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, theme: '' });
                      setShowThemeDropdown(false);
                    }}
                  >
                    <ThemedText style={[styles.dropdownItemText, { color: placeholderColor }]}>
                      Aucun thème
                    </ThemedText>
                  </TouchableOpacity>
                  {themes.map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, theme });
                        setShowThemeDropdown(false);
                      }}
                    >
                      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                        {theme}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Description
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor, borderColor, color: textColor }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description du culte, instructions spéciales, notes..."
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Informations sur les champs */}
          <View style={styles.infoSection}>
            <ThemedText style={[styles.infoTitle, { color: textColor }]}>
              Conseils :
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: useThemeColor({}, 'secondary') }]}>
              • Utilisez un titre descriptif pour identifier facilement le culte
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: useThemeColor({}, 'secondary') }]}>
              • Le thème aide à organiser la musique et le message
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: useThemeColor({}, 'secondary') }]}>
              • La description peut inclure des instructions pour l'équipe
            </ThemedText>
          </View>
        </ScrollView>

        {/* Boutons d'action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor }]}
            onPress={handleClose}
          >
            <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>
              Annuler
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: primaryColor }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <ThemedText style={styles.saveButtonText}>
              {worship ? 'Modifier' : 'Créer'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  datePreview: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  infoSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});