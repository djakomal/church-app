import { useT } from '@/context/I18nContext';
import { ThemedText } from '@/components/ThemedText';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ROLES: { key: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[] = [
  { key: 'editor', label: 'Chantre', icon: 'musical-notes', desc: 'Créer et gérer les cultes', color: '#8b5cf6' },
  { key: 'viewer', label: 'Musicien', icon: 'musical-note', desc: 'Voir les cultes et les chants', color: '#06b6d4' },
];

export default function LoginScreen() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const insets = useSafeAreaInsets();

  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('register.fillAll'));
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert(t('error'), 'Identifiants incorrects');
      }
    } catch {
      Alert.alert(t('error'), t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor, paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={[styles.logoRing, { borderColor: primaryColor + '40' }]}>
              <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                <Ionicons name="musical-notes" size={36} color="white" />
              </View>
            </View>
            <ThemedText style={styles.brandName}>Church App</ThemedText>
            <ThemedText style={[styles.tagline, { color: secondaryColor }]}>
              Gestion de culte simplifiée
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.roleSelector}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.roleCard,
                    {
                      borderColor: selectedRole === r.key ? r.color : borderColor,
                      backgroundColor: selectedRole === r.key ? r.color + '12' : 'transparent',
                    },
                  ]}
                  onPress={() => handleRoleSelect(r.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: r.color + '20' }]}>
                    <Ionicons name={r.icon} size={24} color={r.color} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <ThemedText style={[styles.roleLabel, { color: textColor }]}>
                      {r.label}
                    </ThemedText>
                    <ThemedText style={[styles.roleDesc, { color: secondaryColor }]}>
                      {r.desc}
                    </ThemedText>
                  </View>
                  {selectedRole === r.key && (
                    <View style={[styles.roleCheck, { backgroundColor: r.color }]}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <ThemedText style={[styles.dividerText, { color: secondaryColor }]}>
                ou connectez-vous
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, { borderColor, backgroundColor: backgroundColor }]}>
                <Ionicons name="mail-outline" size={18} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, { borderColor, backgroundColor: backgroundColor }]}>
                <Ionicons name="lock-closed-outline" size={18} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={placeholderColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push('/forgot-password')}
            >
              <ThemedText style={[styles.forgotLinkText, { color: primaryColor }]}>
                Mot de passe oublié ?
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/register')}
            >
              <ThemedText style={[styles.registerText, { color: secondaryColor }]}>
                Pas encore de compte ?{' '}
              </ThemedText>
              <ThemedText style={[styles.registerLinkText, { color: primaryColor }]}>
                Créer un compte
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  roleSelector: {
    gap: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextWrap: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
  },
  roleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 22,
  },
  eyeButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotLink: {
    alignItems: 'center',
    marginBottom: 14,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
