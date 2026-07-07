import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useT } from '@/context/I18nContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function OnboardingScreen() {
  const t = useT();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const placeholderColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const accentColor = useThemeColor({}, 'accent');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const { register } = useAuth();

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!name.trim()) {
          Alert.alert(t('error'), t('onboarding.errorName'));
          return false;
        }
        break;
      case 1:
        if (!email.trim()) {
          Alert.alert(t('error'), t('onboarding.errorEmail'));
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert(t('error'), t('register.invalidEmail'));
          return false;
        }
        break;
      case 2:
        if (!phone.trim()) {
          Alert.alert(t('error'), t('onboarding.errorPhone'));
          return false;
        }
        if (!/^\+?[0-9\s-]{10,}$/.test(phone)) {
          Alert.alert(t('error'), t('onboarding.invalidPhone'));
          return false;
        }
        break;
      case 3:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      const success = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: 'temp123456',
        role: role as any
      });

      if (success) {
        Alert.alert(
          t('register.success'),
          t('onboarding.welcomeRedirect', { name: name.trim() })
        );
        router.replace('/login');
      } else {
        Alert.alert(t('error'), t('auth.registerError'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('register.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="person-add" size={64} color="white" />
            </View>
            <ThemedText style={[styles.stepTitle, { color: textColor }]}>
              {t('onboarding.personalInfo')}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: secondaryColor }]}>
              {t('onboarding.personalInfoDesc')}
            </ThemedText>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('auth.name')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="person" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('auth.name')}
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="mail" size={64} color="white" />
            </View>
            <ThemedText style={[styles.stepTitle, { color: textColor }]}>
              {t('onboarding.emailTitle')}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: secondaryColor }]}>
              {t('onboarding.emailDesc')}
            </ThemedText>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('auth.email')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="mail" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('onboarding.emailPlaceholder')}
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="call" size={64} color="white" />
            </View>
            <ThemedText style={[styles.stepTitle, { color: textColor }]}>
              {t('onboarding.phoneTitle')}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: secondaryColor }]}>
              {t('onboarding.phoneDesc')}
            </ThemedText>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                {t('onboarding.phone')} *
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="call" size={20} color={placeholderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('onboarding.phonePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="briefcase" size={64} color="white" />
            </View>
            <ThemedText style={[styles.stepTitle, { color: textColor }]}>
              {t('onboarding.role')}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: secondaryColor }]}>
              {t('onboarding.roleDesc')}
            </ThemedText>
            <View style={styles.roleGrid}>
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: cardBackground }]}
                onPress={() => setRole('editor')}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: warningColor }]}>
                  <Ionicons name="create" size={32} color="white" />
                </View>
                <ThemedText style={styles.roleTitle}>{t('auth.editor')}</ThemedText>
                <ThemedText style={styles.roleDescription}>
                  {t('onboarding.roleEditorDesc')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: cardBackground }]}
                onPress={() => setRole('leader')}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: successColor }]}>
                  <Ionicons name="people" size={32} color="white" />
                </View>
                <ThemedText style={styles.roleTitle}>{t('onboarding.roleLeader')}</ThemedText>
                <ThemedText style={styles.roleDescription}>
                  {t('onboarding.roleLeaderDesc')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: cardBackground }]}
                onPress={() => setRole('admin')}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: primaryColor }]}>
                  <Ionicons name="shield" size={32} color="white" />
                </View>
                <ThemedText style={styles.roleTitle}>{t('auth.admin')}</ThemedText>
                <ThemedText style={styles.roleDescription}>
                  {t('onboarding.roleAdminDesc')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: cardBackground }]}
                onPress={() => setRole('viewer')}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: accentColor }]}>
                  <Ionicons name="eye" size={32} color="white" />
                </View>
                <ThemedText style={styles.roleTitle}>{t('register.musician')}</ThemedText>
                <ThemedText style={styles.roleDescription}>
                  {t('onboarding.roleViewerDesc')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, {
                    width: `${((currentStep + 1) / 4) * 100}%`,
                    backgroundColor: primaryColor
                  }]}
                />
              </View>
              <ThemedText style={[styles.progressText, { color: textColor }]}>
                {t('onboarding.step', { current: String(currentStep + 1), total: '4' })}
              </ThemedText>
            </View>

            {renderStep()}

            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={handleBack}
                  disabled={isLoading}
                >
                  <ThemedText style={[styles.buttonText, { color: textColor }]}>
                    {t('onboarding.back')}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {currentStep < 3 ? (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { backgroundColor: primaryColor }]}
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                      {t('onboarding.loading')}
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText style={styles.buttonText}>
                        {t('onboarding.next')}
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { backgroundColor: successColor }]}
                  onPress={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                      {t('onboarding.creating')}
                    </ThemedText>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <ThemedText style={styles.buttonText}>
                        {t('onboarding.finish')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.skipButton, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                onPress={handleSkip}
                disabled={isLoading}
              >
                <ThemedText style={[styles.buttonText, { color: secondaryColor }]}>
                  {t('onboarding.skip')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '80%',
    maxWidth: 200,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
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
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  roleCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
