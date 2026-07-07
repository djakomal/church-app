import { useT } from '@/context/I18nContext';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
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

export default function LoginScreen() {
  const t = useT();
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
  const cardColor = useThemeColor({}, 'cardBackground');
  const insets = useSafeAreaInsets();

  const { login } = useAuth();

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
            <View style={[styles.logoRing, { borderColor: primaryColor + '30' }]}>
              <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                <Ionicons name="musical-notes" size={36} color="white" />
              </View>
            </View>
            <ThemedText style={styles.brandName}>Church App</ThemedText>
            <ThemedText style={[styles.tagline, { color: secondaryColor }]}>
              Gestion de culte simplifiée
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
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

            <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
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

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotLink} onPress={() => router.push('/forgot-password')}>
              <ThemedText style={[styles.forgotLinkText, { color: primaryColor }]}>
                Mot de passe oublié ?
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <ThemedText style={[styles.dividerText, { color: secondaryColor }]}>
                {t('auth.or')}
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, { borderColor: primaryColor }]}
              onPress={() => router.push('/register')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.registerButtonText, { color: primaryColor }]}>
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
    marginBottom: 40,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 28,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
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
    borderRadius: 14,
    gap: 10,
    marginTop: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
