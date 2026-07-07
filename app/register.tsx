import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const t = useT();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor'>('viewer');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [instrumentInput, setInstrumentInput] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const otpInputRef = useRef<any>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const insets = useSafeAreaInsets();

  const { register, login, requestOTP, verifyOTP } = useAuth();

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('error'), t('register.fillAll'));
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert(t('error'), t('register.fillAll'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(t('error'), t('register.invalidEmail'));
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(t('error'), t('register.passwordTooShort'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('error'), t('register.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await requestOTP(formData.email.trim().toLowerCase());
      if (result.ok) {
        if (result.devCode) setDevCode(result.devCode);
        setOtpStep('otp');
        setTimeout(() => otpInputRef.current?.focus(), 300);
      } else {
        Alert.alert(t('error'), result.reason || t('error.generic'));
      }
    } catch {
      Alert.alert(t('error'), t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      Alert.alert(t('error'), t('register.enterOTP'));
      return;
    }
    setIsLoading(true);
    try {
      const email = formData.email.trim().toLowerCase();
      const result = await verifyOTP(email, otpCode.trim());
      if (!result.ok) {
        Alert.alert(t('error'), result.reason || t('error.generic'));
        setIsLoading(false);
        return;
      }
      const success = await register({
        name: formData.name.trim(),
        email,
        password: formData.password,
        role: selectedRole,
        musicianType: selectedRole === 'viewer' ? 'instrumentiste' : 'chantre',
        instruments: selectedRole === 'viewer' ? instruments : undefined,
        voiceType: selectedRole === 'editor' ? voiceType : undefined,
      });
      if (success) {
        const loggedIn = await login(email, formData.password);
        if (loggedIn) {
          router.replace('/(tabs)/home');
        } else {
          Alert.alert(t('register.success'), t('register.successMsg'), [
            { text: 'OK', onPress: () => router.replace('/login') },
          ]);
        }
      } else {
        Alert.alert(t('error'), t('auth.registerError'));
      }
    } catch {
      Alert.alert(t('error'), t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor, paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={primaryColor} />
            </TouchableOpacity>
            <View style={[styles.logoCircle, { backgroundColor: primaryColor + '15' }]}>
              <View style={[styles.logoInner, { backgroundColor: primaryColor }]}>
                <Ionicons name="person-add" size={28} color="white" />
              </View>
            </View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              {t('register.title')}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
              {t('register.subtitle')}
            </ThemedText>
          </View>

          {otpStep === 'otp' ? (
            <View style={[styles.card, { backgroundColor: cardColor }]}>
              <ThemedText style={[styles.otpTitle, { color: textColor }]}>
                {t('register.verifyEmail')}
              </ThemedText>
              <ThemedText style={[styles.otpSubtitle, { color: secondaryColor }]}>
                {t('register.otpSent')} {formData.email}
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                <Ionicons name="lock-open" size={20} color={placeholderColor} />
                <TextInput
                  ref={otpInputRef}
                  style={[styles.otpInput, { color: textColor }]}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="123456"
                  placeholderTextColor={placeholderColor}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                />
              </View>
              {devCode ? (
                <ThemedText style={[styles.devCodeHint, { color: secondaryColor }]}>
                  {t('register.devCode')}: {devCode}
                </ThemedText>
              ) : null}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <ThemedText style={styles.primaryButtonText}>
                  {isLoading ? t('register.creating') : t('register.verifyButton')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => { setOtpStep('form'); setOtpCode(''); }}
                disabled={isLoading}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: secondaryColor }]}>
                  {t('register.backToForm')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: cardColor }]}>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('auth.name')} *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                    <Ionicons name="person" size={18} color={placeholderColor} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      value={formData.name}
                      onChangeText={(value) => updateFormData('name', value)}
                      placeholder={t('auth.name')}
                      placeholderTextColor={placeholderColor}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('auth.email')} *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                    <Ionicons name="mail" size={18} color={placeholderColor} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      placeholder={t('auth.email')}
                      placeholderTextColor={placeholderColor}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('auth.password')} *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                    <Ionicons name="lock-closed" size={18} color={placeholderColor} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      placeholder="Min. 6 caractères"
                      placeholderTextColor={placeholderColor}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color={placeholderColor} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('auth.confirmPassword')} *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                    <Ionicons name="lock-closed" size={18} color={placeholderColor} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      placeholder={t('auth.confirmPassword')}
                      placeholderTextColor={placeholderColor}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color={placeholderColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: cardColor }]}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('register.roleLabel')}
                </ThemedText>
                <ThemedText style={[styles.roleHint, { color: secondaryColor }]}>
                  {t('register.roleNote')}
                </ThemedText>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      { borderColor: selectedRole === 'viewer' ? primaryColor : borderColor },
                      selectedRole === 'viewer' && { backgroundColor: primaryColor + '12' }
                    ]}
                    onPress={() => setSelectedRole('viewer')}
                  >
                    <Ionicons name="musical-notes" size={28} color={selectedRole === 'viewer' ? primaryColor : secondaryColor} />
                    <ThemedText style={[styles.roleTitle, { color: textColor }]}>
                      {t('register.musician')}
                    </ThemedText>
                    <ThemedText style={[styles.roleDesc, { color: secondaryColor }]}>
                      {t('register.musicianDesc')}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      { borderColor: selectedRole === 'editor' ? primaryColor : borderColor },
                      selectedRole === 'editor' && { backgroundColor: primaryColor + '12' }
                    ]}
                    onPress={() => setSelectedRole('editor')}
                  >
                    <Ionicons name="mic" size={28} color={selectedRole === 'editor' ? primaryColor : secondaryColor} />
                    <ThemedText style={[styles.roleTitle, { color: textColor }]}>
                      {t('register.singer')}
                    </ThemedText>
                    <ThemedText style={[styles.roleDesc, { color: secondaryColor }]}>
                      {t('register.singerDesc')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedRole === 'viewer' && (
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('register.instruments')}
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                    <Ionicons name="musical-notes" size={18} color={placeholderColor} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      value={instrumentInput}
                      onChangeText={setInstrumentInput}
                      placeholder={t('register.instrumentPlaceholder')}
                      placeholderTextColor={placeholderColor}
                      onSubmitEditing={() => {
                        const trimmed = instrumentInput.trim();
                        if (trimmed && !instruments.includes(trimmed)) {
                          setInstruments(prev => [...prev, trimmed]);
                        }
                        setInstrumentInput('');
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const trimmed = instrumentInput.trim();
                        if (trimmed && !instruments.includes(trimmed)) {
                          setInstruments(prev => [...prev, trimmed]);
                        }
                        setInstrumentInput('');
                      }}
                    >
                      <Ionicons name="add-circle" size={24} color={primaryColor} />
                    </TouchableOpacity>
                  </View>
                  {instruments.length > 0 && (
                    <View style={styles.tagsList}>
                      {instruments.map((inst, idx) => (
                        <View key={idx} style={[styles.tag, { backgroundColor: primaryColor + '15' }]}>
                          <ThemedText style={[styles.tagText, { color: primaryColor }]}>
                            {inst}
                          </ThemedText>
                          <TouchableOpacity onPress={() => setInstruments(prev => prev.filter((_, i) => i !== idx))}>
                            <Ionicons name="close-circle" size={16} color={primaryColor} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {selectedRole === 'editor' && (
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    {t('register.voiceType')}
                  </ThemedText>
                  <View style={styles.voiceOptions}>
                    {['Soprano', 'Alto', 'Ténor', 'Basse'].map(vt => (
                      <TouchableOpacity
                        key={vt}
                        style={[
                          styles.voiceOption,
                          { borderColor: voiceType === vt ? primaryColor : borderColor },
                          voiceType === vt && { backgroundColor: primaryColor + '12' }
                        ]}
                        onPress={() => setVoiceType(vt)}
                      >
                        <Ionicons
                          name={voiceType === vt ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={voiceType === vt ? primaryColor : secondaryColor}
                        />
                        <ThemedText style={[styles.voiceOptionText, { color: textColor }]}>
                          {vt}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <ThemedText style={styles.primaryButtonText}>
                  {isLoading ? t('register.sendingOtp') : t('register.button')}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.loginLink}>
            <ThemedText style={[styles.loginLinkText, { color: secondaryColor }]}>
              {t('auth.hasAccount')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <ThemedText style={[styles.loginLinkButton, { color: primaryColor }]}>
                {t('auth.login')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  content: { maxWidth: 420, alignSelf: 'center', width: '100%', gap: 16 },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    paddingTop: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
  roleHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: -8,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  roleDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  voiceOptions: { gap: 8 },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginLinkText: { fontSize: 13 },
  loginLinkButton: { fontSize: 13, fontWeight: '600' },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    minHeight: 40,
    fontWeight: '600',
  },
  devCodeHint: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
