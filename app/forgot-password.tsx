import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';
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
  View
} from 'react-native';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
  const t = useT();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const successColor = useThemeColor({}, 'success');
  const insets = useSafeAreaInsets();

  const { requestOTP, verifyOTP, resetPassword } = useAuth();

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    setIsLoading(true);
    try {
      const result = await requestOTP(email.trim());
      if (result.ok) {
        setStep('otp');
        startCountdown();
        if (result.otp) {
          Alert.alert('Code de vérification', `Code: ${result.otp}`);
        }
      } else {
        Alert.alert('Erreur', result.reason === 'user_not_found' ? 'Aucun compte trouvé avec cet email' : 'Erreur lors de l\'envoi');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code');
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOTP(email.trim(), otp.trim());
      if (result.ok) {
        setStep('reset');
      } else {
        Alert.alert('Erreur', 'Code invalide ou expiré');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(email.trim(), newPassword);
      if (result.ok) {
        Alert.alert('Succès', 'Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Erreur', 'Impossible de réinitialiser le mot de passe');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue');
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
              <Ionicons name="lock-open-outline" size={40} color={primaryColor} />
            </View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Mot de passe oublié
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
              {step === 'email' && 'Entrez votre email pour recevoir un code'}
              {step === 'otp' && 'Entrez le code à 6 chiffres reçu par email'}
              {step === 'reset' && 'Choisissez un nouveau mot de passe'}
            </ThemedText>
          </View>

          <View style={styles.steps}>
            {(['email', 'otp', 'reset'] as Step[]).map((s, i) => (
              <View key={s} style={[styles.stepDot, step === s && { backgroundColor: primaryColor }]} />
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {step === 'email' && (
              <>
                <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
                  <Ionicons name="mail-outline" size={18} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Votre email"
                    placeholderTextColor={placeholderColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                >
                  <Ionicons name="send-outline" size={18} color="white" />
                  <ThemedText style={styles.buttonText}>Envoyer le code</ThemedText>
                </TouchableOpacity>
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
                  <Ionicons name="key-outline" size={18} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={otp}
                    onChangeText={text => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    placeholderTextColor={placeholderColor}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                  <ThemedText style={styles.buttonText}>Vérifier le code</ThemedText>
                </TouchableOpacity>
                <View style={styles.resendContainer}>
                  {countdown > 0 ? (
                    <ThemedText style={[styles.resendText, { color: secondaryColor }]}>
                      Renvoyer dans {countdown}s
                    </ThemedText>
                  ) : (
                    <TouchableOpacity onPress={handleSendOTP}>
                      <ThemedText style={[styles.resendLink, { color: primaryColor }]}>
                        Renvoyer le code
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {step === 'reset' && (
              <>
                <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nouveau mot de passe"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={placeholderColor} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={placeholderColor} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: successColor }]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <Ionicons name="checkmark-done-outline" size={18} color="white" />
                  <ThemedText style={styles.buttonText}>Réinitialiser</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
            <ThemedText style={[styles.loginLinkText, { color: secondaryColor }]}>
              Retour à la connexion
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  content: { maxWidth: 420, width: '100%', alignSelf: 'center' },
  backButton: { position: 'absolute', top: 0, left: 0, zIndex: 10, padding: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, gap: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, minHeight: 22 },
  eyeButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  resendContainer: { alignItems: 'center' },
  resendText: { fontSize: 14 },
  resendLink: { fontSize: 14, fontWeight: '600' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { fontSize: 14 },
});
