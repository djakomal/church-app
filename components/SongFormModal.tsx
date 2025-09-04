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

interface Song {
  id?: number;
  title: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  category: string;
  notes: string;
  lyrics: string;
}

interface SongFormModalProps {
  visible: boolean;
  song?: Song | null;
  onClose: () => void;
  onSave: (song: Song) => void;
}

const tempos = ['Slow', 'Medium', 'Fast'];
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const categories = ['Louange', 'Adoration', 'Célébration', 'Invocation', 'Communion', 'Offrande'];

export function SongFormModal({ visible, song, onClose, onSave }: SongFormModalProps) {
  const [formData, setFormData] = useState<Song>({
    title: '',
    artist: '',
    key: 'C',
    tempo: 'Medium',
    duration: '',
    category: 'Louange',
    notes: '',
    lyrics: ''
  });

  const [showTempoDropdown, setShowTempoDropdown] = useState(false);
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  useEffect(() => {
    if (song) {
      setFormData(song);
    } else {
      setFormData({
        title: '',
        artist: '',
        key: 'C',
        tempo: 'Medium',
        duration: '',
        category: 'Louange',
        notes: '',
        lyrics: ''
      });
    }
  }, [song, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre du chant est obligatoire');
      return;
    }
    if (!formData.artist.trim()) {
      Alert.alert('Erreur', 'L\'artiste est obligatoire');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setShowTempoDropdown(false);
    setShowKeyDropdown(false);
    setShowCategoryDropdown(false);
    onClose();
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
            {song ? 'Modifier le Chant' : 'Ajouter un Chant'}
          </ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Titre */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Titre du chant *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Entrez le titre du chant"
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Artiste */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Artiste *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.artist}
              onChangeText={(text) => setFormData({ ...formData, artist: text })}
              placeholder="Nom de l'artiste"
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Ligne avec Tonalité, Tempo et Durée */}
          <View style={styles.row}>
            {/* Tonalité */}
            <View style={[styles.formGroup, styles.flex1]}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Tonalité
              </ThemedText>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor, borderColor }]}
                onPress={() => {
                  setShowKeyDropdown(!showKeyDropdown);
                  setShowTempoDropdown(false);
                  setShowCategoryDropdown(false);
                }}
              >
                <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                  {formData.key}
                </ThemedText>
                <Ionicons name="chevron-down" size={16} color={placeholderColor} />
              </TouchableOpacity>
              
              {showKeyDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                  {keys.map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, key });
                        setShowKeyDropdown(false);
                      }}
                    >
                      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                        {key}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Tempo */}
            <View style={[styles.formGroup, styles.flex1, styles.marginLeft]}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Tempo
              </ThemedText>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor, borderColor }]}
                onPress={() => {
                  setShowTempoDropdown(!showTempoDropdown);
                  setShowKeyDropdown(false);
                  setShowCategoryDropdown(false);
                }}
              >
                <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                  {formData.tempo}
                </ThemedText>
                <Ionicons name="chevron-down" size={16} color={placeholderColor} />
              </TouchableOpacity>
              
              {showTempoDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                  {tempos.map((tempo) => (
                    <TouchableOpacity
                      key={tempo}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, tempo });
                        setShowTempoDropdown(false);
                      }}
                    >
                      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                        {tempo}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Durée */}
            <View style={[styles.formGroup, styles.flex1, styles.marginLeft]}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Durée
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                placeholder="3:45"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          {/* Catégorie */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Catégorie
            </ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor, borderColor }]}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowKeyDropdown(false);
                setShowTempoDropdown(false);
              }}
            >
              <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                {formData.category}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={placeholderColor} />
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, category });
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                      {category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Notes
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor, borderColor, color: textColor }]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Notes sur le chant (optionnel)"
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Paroles */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Paroles
            </ThemedText>
            <TextInput
              style={[styles.lyricsArea, { backgroundColor, borderColor, color: textColor }]}
              value={formData.lyrics}
              onChangeText={(text) => setFormData({ ...formData, lyrics: text })}
              placeholder="Paroles du chant (optionnel)"
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
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
              {song ? 'Modifier' : 'Ajouter'}
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
    minHeight: 80,
  },
  lyricsArea: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 150,
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
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
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownItemText: {
    fontSize: 16,
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