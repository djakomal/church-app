import { ThemedText } from '@/components/ThemedText';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const accentColor = useThemeColor({}, 'accent');

  const { register, login } = useAuth();

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom complet');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      });

      if (success) {
        // Connexion automatique après création du compte
        const loggedIn = await login(formData.email.trim().toLowerCase(), formData.password);
        if (loggedIn) {
          router.replace('/(tabs)/home');
        } else {
          Alert.alert(
            'Inscription réussie',
            'Votre compte a été créé. Connectez-vous avec vos identifiants.',
            [
              { text: 'OK', onPress: () => router.replace('/login') }
            ]
          );
        }
      } else {
        Alert.alert('Erreur', 'Cette adresse email est déjà utilisée');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return successColor;
      case 'editor': return warningColor;
      case 'viewer': return accentColor;
      default: return primaryColor;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'editor': return 'create';
      case 'viewer': return 'eye';
      default: return 'person';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Musicien';
      default: return 'Utilisateur';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={primaryColor} />
            </TouchableOpacity>
            
            <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="person-add" size={48} color="white" />
            </View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Créer un compte
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
              Rejoignez l'équipe de l'église
            </ThemedText>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Nom complet *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="person" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholder="Votre nom complet"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Email *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="mail" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="votre.email@church.com"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Mot de passe *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="Au moins 6 caractères"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Confirmer le mot de passe *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  placeholder="Répétez votre mot de passe"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Votre rôle dans l'église
              </ThemedText>
              <ThemedText style={[styles.roleNote, { color: secondaryColor }]}>
                Sélectionnez votre fonction principale
              </ThemedText>
              
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    {
                      backgroundColor: formData.role === 'viewer' ? accentColor : 'transparent',
                      borderColor: accentColor
                    }
                  ]}
                  onPress={() => updateFormData('role', 'viewer')}
                >
                  <Ionicons 
                    name="musical-notes" 
                    size={16} 
                    color={formData.role === 'viewer' ? 'white' : accentColor} 
                  />
                  <ThemedText style={[
                    styles.roleButtonText,
                    { color: formData.role === 'viewer' ? 'white' : accentColor }
                  ]}>
                    Musicien
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    {
                      backgroundColor: formData.role === 'editor' ? warningColor : 'transparent',
                      borderColor: warningColor
                    }
                  ]}
                  onPress={() => updateFormData('role', 'editor')}
                >
                  <Ionicons 
                    name="mic" 
                    size={16} 
                    color={formData.role === 'editor' ? 'white' : warningColor} 
                  />
                  <ThemedText style={[
                    styles.roleButtonText,
                    { color: formData.role === 'editor' ? 'white' : warningColor }
                  ]}>
                    Chantre
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: primaryColor }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.registerButtonText}>
                  Création du compte...
                </ThemedText>
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="white" />
                  <ThemedText style={styles.registerButtonText}>
                    Créer mon compte
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Role Information */}
          <View style={styles.roleInfoSection}>
            <ThemedText style={[styles.roleInfoTitle, { color: textColor }]}>
              Informations sur les rôles :
            </ThemedText>
            
            <View style={styles.rolesInfo}>
              <View style={styles.roleInfo}>
                <Ionicons name="musical-notes" size={16} color={accentColor} />
                <ThemedText style={[styles.roleInfoText, { color: secondaryColor }]}>
                  <ThemedText style={{ fontWeight: '600' }}>Musicien :</ThemedText> Consultation des cultes, chants et communications
                </ThemedText>
              </View>
              
              <View style={styles.roleInfo}>
                <Ionicons name="mic" size={16} color={warningColor} />
                <ThemedText style={[styles.roleInfoText, { color: secondaryColor }]}>
                  <ThemedText style={{ fontWeight: '600' }}>Chantre :</ThemedText> Gestion des cultes, chants et communications
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <ThemedText style={[styles.loginLinkText, { color: secondaryColor }]}>
              Vous avez déjà un compte ?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <ThemedText style={[styles.loginLinkButton, { color: primaryColor }]}>
                Se connecter
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleNote: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  eyeButton: {
    padding: 4,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  roleInfoSection: {
    marginBottom: 24,
  },
  roleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  rolesInfo: {
    gap: 12,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  roleInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});