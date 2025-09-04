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

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

interface TeamMemberFormModalProps {
  visible: boolean;
  member?: TeamMember | null;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
}

const roles = [
  'Vocaliste',
  'Chef de louange',
  'Pianiste',
  'Guitariste',
  'Bassiste',
  'Batteur',
  'Technicien son',
  'Projectionniste',
  'Choriste',
  'Violoniste',
  'Saxophoniste',
  'Trompettiste'
];

export function TeamMemberFormModal({ visible, member, onClose, onSave }: TeamMemberFormModalProps) {
  const [formData, setFormData] = useState<TeamMember>({
    name: '',
    role: 'Vocaliste',
    phone: '',
    email: '',
    avatar_url: ''
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'secondary');

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        name: '',
        role: 'Vocaliste',
        phone: '',
        email: '',
        avatar_url: ''
      });
    }
  }, [member, visible]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom du membre est obligatoire');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setShowRoleDropdown(false);
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
            {member ? 'Modifier le Membre' : 'Ajouter un Membre'}
          </ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nom */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Nom complet *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Entrez le nom complet"
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Rôle */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Rôle *
            </ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor, borderColor }]}
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              <ThemedText style={[styles.dropdownText, { color: textColor }]}>
                {formData.role}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={placeholderColor} />
            </TouchableOpacity>
            
            {showRoleDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor, borderColor }]}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, role });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>
                        {role}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Téléphone */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Téléphone
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="06 12 34 56 78"
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Email
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="exemple@email.com"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* URL Avatar */}
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Photo de profil (URL)
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: textColor }]}
              value={formData.avatar_url}
              onChangeText={(text) => setFormData({ ...formData, avatar_url: text })}
              placeholder="https://exemple.com/photo.jpg"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
            />
          </View>

          {/* Informations sur les rôles */}
          <View style={styles.infoSection}>
            <ThemedText style={[styles.infoTitle, { color: textColor }]}>
              Rôles disponibles :
            </ThemedText>
            <View style={styles.rolesList}>
              <View style={styles.rolesColumn}>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Vocaliste / Chef de louange
                </ThemedText>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Pianiste / Guitariste
                </ThemedText>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Bassiste / Batteur
                </ThemedText>
              </View>
              <View style={styles.rolesColumn}>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Technicien son
                </ThemedText>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Projectionniste
                </ThemedText>
                <ThemedText style={[styles.roleItem, { color: useThemeColor({}, 'secondary') }]}>
                  • Instruments divers
                </ThemedText>
              </View>
            </View>
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
              {member ? 'Modifier' : 'Ajouter'}
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
    marginBottom: 12,
  },
  rolesList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rolesColumn: {
    flex: 1,
  },
  roleItem: {
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