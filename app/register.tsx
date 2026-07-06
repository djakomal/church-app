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
    } catch (error) {
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
          Alert.alert(
            t('register.success'),
            t('register.successMsg'),
            [{ text: 'OK', onPress: () => router.replace('/login') }]
          );
        }
      } else {
        Alert.alert(t('error'), t('auth.registerError'));
      }
    } catch (error) {
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
              {t('register.title')}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
              {t('register.subtitle')}
            </ThemedText>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('auth.name')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="person" size={20} color={placeholderColor} />
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

            {/* Email */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('auth.email')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="mail" size={20} color={placeholderColor} />
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('auth.password')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder={t('register.passwordTooShort')}
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
                {t('auth.confirmPassword')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="lock-closed" size={20} color={placeholderColor} />
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
            <View style={styles.roleSection}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('register.roleLabel')}
              </ThemedText>
              <ThemedText style={[styles.roleNote, { color: secondaryColor }]}>
                {t('register.roleNote')}
              </ThemedText>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    { borderColor: selectedRole === 'viewer' ? primaryColor : borderColor },
                    selectedRole === 'viewer' && { backgroundColor: primaryColor + '15' }
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
                    selectedRole === 'editor' && { backgroundColor: primaryColor + '15' }
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

            {/* Instruments (for musicien) */}
            {selectedRole === 'viewer' && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  {t('register.instruments')}
                </ThemedText>
                <View style={[styles.inputContainer, { borderColor }]}>
                  <Ionicons name="musical-notes" size={20} color={placeholderColor} />
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
                    style={styles.addInstrumentButton}
                  >
                    <Ionicons name="add-circle" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </View>
                {instruments.length > 0 && (
                  <View style={styles.selectedInstrumentsList}>
                    {instruments.map((inst, idx) => (
                      <View key={idx} style={[styles.instrumentTag, { backgroundColor: primaryColor + '20', borderColor: primaryColor }]}>
                        <ThemedText style={[styles.instrumentTagText, { color: primaryColor }]}>
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

            {/* Voice Type (for chantre) */}
            {selectedRole === 'editor' && (
              <View style={styles.inputGroup}>
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
                        voiceType === vt && { backgroundColor: primaryColor + '15' }
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

            {/* OTP Verification Step */}
            {otpStep === 'otp' ? (
              <View style={styles.otpSection}>
                <ThemedText style={[styles.otpTitle, { color: textColor }]}>
                  {t('register.verifyEmail')}
                </ThemedText>
                <ThemedText style={[styles.otpSubtitle, { color: secondaryColor }]}>
                  {t('register.otpSent')} {formData.email}
                </ThemedText>
                <View style={[styles.inputContainer, { borderColor }]}>
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
                  style={[styles.registerButton, { backgroundColor: primaryColor }]}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ThemedText style={styles.registerButtonText}>
                      {t('register.creating')}
                    </ThemedText>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <ThemedText style={styles.registerButtonText}>
                        {t('register.verifyButton')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backToFormButton}
                  onPress={() => { setOtpStep('form'); setOtpCode(''); }}
                  disabled={isLoading}
                >
                  <ThemedText style={[styles.backToFormText, { color: secondaryColor }]}>
                    {t('register.backToForm')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: primaryColor }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ThemedText style={styles.registerButtonText}>
                    {t('register.sendingOtp')}
                  </ThemedText>
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="white" />
                    <ThemedText style={styles.registerButtonText}>
                      {t('register.button')}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>


        </View>

        {/* Login Link */}
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
  },
  content: {
    maxWidth: 420,
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
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  roleSection: {
    marginBottom: 24,
  },
  roleNote: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  roleDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  eyeButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  selectedInstrumentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  instrumentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  instrumentTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addInstrumentButton: {
    padding: 4,
  },
  voiceOptions: {
    gap: 8,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  otpSection: {
    marginTop: 8,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
    marginTop: 8,
    fontStyle: 'italic',
  },
  backToFormButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  backToFormText: {
    fontSize: 14,
  },
});
