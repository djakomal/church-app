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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    const demoCredentials = {
      admin: { email: 'admin@church.com', password: 'demo123' },
      editor: { email: 'editor@church.com', password: 'demo123' },
      viewer: { email: 'viewer@church.com', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  // Nettoyage manuel supprimé selon demande

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="musical-notes" size={48} color="white" />
            </View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Gestion de Culte
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
              Connectez-vous pour accéder à l'application
            </ThemedText>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Email
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="mail" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre.email@church.com"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Mot de passe
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Votre mot de passe"
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

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: primaryColor }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.loginButtonText}>
                  Connexion...
                </ThemedText>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="white" />
                  <ThemedText style={styles.loginButtonText}>
                    Se connecter
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>

          
          {/* Register Link */}
          <View style={styles.registerLink}>
            <ThemedText style={[styles.registerLinkText, { color: secondaryColor }]}>
              Pas encore de compte ?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <ThemedText style={[styles.registerLinkButton, { color: primaryColor }]}>
                S'inscrire
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Admin Info (sans bouton de nettoyage) */}
          <View style={styles.adminInfo}>
            <View style={[styles.adminCard, { backgroundColor, borderColor }]}> 
              <View style={styles.adminHeader}>
                <Ionicons name="shield-checkmark" size={20} color={successColor} />
                <ThemedText style={[styles.adminTitle, { color: textColor }]}>Compte Administrateur</ThemedText>
              </View>
              <ThemedText style={[styles.adminText, { color: secondaryColor }]}>Email : admin@church.com</ThemedText>
              <ThemedText style={[styles.adminText, { color: secondaryColor }]}>Mot de passe : admin123</ThemedText>
              <ThemedText style={[styles.adminNote, { color: placeholderColor }]}>Compte créé automatiquement au premier lancement</ThemedText>
            </View>
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
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoSection: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerLinkText: {
    fontSize: 14,
  },
  registerLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminInfo: {
    marginTop: 8,
  },
  adminCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  adminText: {
    fontSize: 14,
    marginBottom: 4,
  },
  adminNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});