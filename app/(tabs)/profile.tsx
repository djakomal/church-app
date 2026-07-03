import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Switch, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTIF_PREF_KEY = 'notification_preferences';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  const { user, logout, changePassword, resetPassword, updateProfile } = useAuth();
  const { isDark, setThemeMode, themeMode } = useThemeContext();
  const { t, language, setLanguage, availableLanguages } = useI18n();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => { loadPreferences(); }, []);

  const loadPreferences = async () => {
    try {
      const notifPref = await AsyncStorage.getItem(NOTIF_PREF_KEY);
      if (notifPref !== null) setNotificationsEnabled(notifPref === 'true');
    } catch {}
  };

  const handleProfileUpdate = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      Alert.alert(t('error'), t('register.fillAll'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail)) {
      Alert.alert(t('error'), t('register.invalidEmail'));
      return;
    }
    setIsSubmitting(true);
    const ok = await updateProfile(profileName.trim(), profileEmail.trim());
    setIsSubmitting(false);
    if (ok) {
      Alert.alert(t('success'), t('profile.profileUpdated'));
      setShowProfileEdit(false);
    } else {
      Alert.alert(t('error'), t('error.generic'));
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIF_PREF_KEY, value.toString());
  };

  const selectLanguage = async (lang: 'fr' | 'en') => {
    await setLanguage(lang);
    setShowLanguageModal(false);
  };

  const themeStatus = themeMode === 'dark' ? t('profile.darkModeActive') : themeMode === 'light' ? t('profile.darkModeInactive') : t('profile.darkModeSystem');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <ThemedText style={[styles.title, { color: textColor }]}>{t('profile.title')}</ThemedText>

        <View style={[styles.card, styles.profileCard]}>
          {!showProfileEdit ? (
            <>
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.profileDetails}>
                  <ThemedText style={[styles.profileName, { color: textColor }]}>{user?.name}</ThemedText>
                  <ThemedText style={[styles.profileEmail, { color: secondaryColor }]}>{user?.email}</ThemedText>
                  <View style={styles.profileRoleContainer}>
                    <Ionicons name="shield" size={14} color={primaryColor} />
                    <ThemedText style={[styles.profileRole, { color: primaryColor }]}>{user?.role}</ThemedText>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: primaryColor }]}
                onPress={() => { setProfileName(user?.name || ''); setProfileEmail(user?.email || ''); setShowProfileEdit(true); }}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <ThemedText style={styles.editButtonText}>{t('profile.edit')}</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.editHeader, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => setShowProfileEdit(false)} style={styles.cancelEditBtn}>
                  <Ionicons name="close" size={24} color={secondaryColor} />
                </TouchableOpacity>
                <ThemedText style={[styles.editTitle, { color: textColor }]}>{t('profile.editTitle')}</ThemedText>
                <TouchableOpacity onPress={handleProfileUpdate} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.6 : 1 }}>
                  <Ionicons name="checkmark" size={24} color={successColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: textColor }]}>{t('auth.name')}</ThemedText>
                  <View style={[styles.inputWrapper, { borderColor }]}>
                    <Ionicons name="person" size={20} color={secondaryColor} />
                    <TextInput
                      style={[styles.textInput, { color: textColor }]}
                      value={profileName}
                      onChangeText={setProfileName}
                      placeholder={t('auth.name')}
                      placeholderTextColor={secondaryColor}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: textColor }]}>{t('auth.email')}</ThemedText>
                  <View style={[styles.inputWrapper, { borderColor }]}>
                    <Ionicons name="mail" size={20} color={secondaryColor} />
                    <TextInput
                      style={[styles.textInput, { color: textColor }]}
                      value={profileEmail}
                      onChangeText={setProfileEmail}
                      placeholder={t('auth.emailPlaceholder')}
                      placeholderTextColor={secondaryColor}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: 'transparent' }]}>
          <View style={styles.themeHeader}>
            <View style={[styles.themeIconContainer, { backgroundColor: primaryColor + '20' }]}>
              <Ionicons name="moon" size={24} color={primaryColor} />
            </View>
            <View style={styles.themeInfo}>
              <ThemedText style={[styles.themeTitle, { color: textColor }]}>{t('profile.darkMode')}</ThemedText>
              <ThemedText style={[styles.themeSubtitle, { color: secondaryColor }]}>{themeStatus}</ThemedText>
            </View>
            <Switch
              value={isDark}
              onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
              trackColor={{ false: secondaryColor, true: primaryColor }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor, borderBottomColor: borderColor }]}>{t('profile.preferences')}</ThemedText>

          <View style={[styles.preferenceItem, { borderBottomColor: borderColor }]}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="notifications" size={20} color={primaryColor} />
              <View style={styles.preferenceText}>
                <ThemedText style={[styles.preferenceTitle, { color: textColor }]}>{t('profile.notifications')}</ThemedText>
                <ThemedText style={[styles.preferenceSubtitle, { color: secondaryColor }]}>{t('profile.notificationsDesc')}</ThemedText>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: secondaryColor, true: primaryColor }}
              thumbColor="white"
            />
          </View>

          <TouchableOpacity style={[styles.preferenceItem, { borderBottomColor: borderColor }]} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="language" size={20} color={primaryColor} />
              <View style={styles.preferenceText}>
                <ThemedText style={[styles.preferenceTitle, { color: textColor }]}>{t('profile.language')}</ThemedText>
                <ThemedText style={[styles.preferenceSubtitle, { color: secondaryColor }]}>{availableLanguages.find(l => l.code === language)?.label || 'Français'}</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.preferenceItem, { borderBottomColor: borderColor }]}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="shield-checkmark" size={20} color={warningColor} />
              <View style={styles.preferenceText}>
                <ThemedText style={[styles.preferenceTitle, { color: textColor }]}>{t('profile.privacy')}</ThemedText>
                <ThemedText style={[styles.preferenceSubtitle, { color: secondaryColor }]}>{t('profile.privacyDesc')}</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
          </TouchableOpacity>
        </View>

        {user?.role === 'admin' && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 12 }]}
            onPress={() => router.push('/user-management')}
          >
            <Ionicons name="people" size={24} color={primaryColor} />
            <View>
              <ThemedText style={[styles.preferenceTitle, { color: textColor }]}>{t('profile.userManagement')}</ThemedText>
              <ThemedText style={[styles.preferenceSubtitle, { color: secondaryColor }]}>{t('profile.userManagementDesc')}</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.card, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.cardTitle, { color: textColor }]}>{t('profile.changePassword')}</ThemedText>
          <View style={[styles.inputRow, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={t('auth.currentPassword')}
              placeholderTextColor={secondaryColor}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={[styles.inputRow, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={t('auth.newPassword')}
              placeholderTextColor={secondaryColor}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: primaryColor }]}
            disabled={isSubmitting}
            onPress={async () => {
              if (!currentPassword || !newPassword) {
                Alert.alert(t('error'), t('register.fillAll'));
                return;
              }
              setIsSubmitting(true);
              const res = await changePassword(currentPassword, newPassword);
              setIsSubmitting(false);
              if (res.ok) {
                setCurrentPassword(''); setNewPassword('');
                Alert.alert(t('success'), t('profile.passwordUpdated'));
              } else {
                const map: Record<string, string> = {
                  not_authenticated: t('profile.pleaseWait'),
                  wrong_password: t('auth.loginError'),
                  weak_password: t('register.passwordTooShort'),
                  user_not_found: t('error.unknown'),
                };
                Alert.alert(t('error'), map[res.reason || ''] || t('error.unknown'));
              }
            }}
          >
            <ThemedText style={styles.primaryBtnText}>{isSubmitting ? t('profile.pleaseWait') : t('profile.updatePassword')}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: 'transparent', borderColor: errorColor + '40' }]}>
          <ThemedText style={[styles.cardTitle, { color: textColor }]}>{t('profile.resetPassword')}</ThemedText>
          <ThemedText style={[styles.resetInfo, { color: secondaryColor }]}>{t('profile.resetPasswordDesc')}</ThemedText>
          <View style={[styles.inputRow, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={t('auth.email')}
              placeholderTextColor={secondaryColor}
              autoCapitalize="none"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
          </View>
          <View style={[styles.inputRow, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={t('auth.newPassword')}
              placeholderTextColor={secondaryColor}
              secureTextEntry
              value={resetNewPassword}
              onChangeText={setResetNewPassword}
            />
          </View>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor }]}
            disabled={isSubmitting}
            onPress={async () => {
              if (!resetEmail) { Alert.alert(t('error'), t('register.fillAll')); return; }
              if (resetNewPassword.length < 6) { Alert.alert(t('error'), t('register.passwordTooShort')); return; }
              setIsSubmitting(true);
              const res = await resetPassword(resetEmail, resetNewPassword);
              setIsSubmitting(false);
              if (res.ok) {
                Alert.alert(t('success'), t('profile.passwordUpdated'));
                setResetEmail(''); setResetNewPassword('');
              } else {
                const map: Record<string, string> = { user_not_found: t('error.unknown'), weak_password: t('register.passwordTooShort') };
                Alert.alert(t('error'), map[res.reason || ''] || t('error.unknown'));
              }
            }}
          >
            <ThemedText style={[styles.secondaryBtnText, { color: textColor }]}>{t('profile.resetPasswordBtn')}</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor }]}
          onPress={async () => { try { await logout(); } catch {} }}
        >
          <Ionicons name="log-out" size={20} color={errorColor} />
          <ThemedText style={[styles.logoutText, { color: errorColor }]}>{t('auth.logout')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showLanguageModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLanguageModal(false)}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <ThemedText style={[styles.modalTitle, { color: textColor }]}>{t('profile.chooseLanguage')}</ThemedText>
            {availableLanguages.map(({ code, label }) => (
              <TouchableOpacity
                key={code}
                style={[styles.langOption, { borderColor }]}
                onPress={() => selectLanguage(code)}
              >
                <ThemedText style={[styles.langText, { color: textColor, fontWeight: language === code ? '700' : '400' }]}>
                  {label}
                </ThemedText>
                {language === code && <Ionicons name="checkmark" size={20} color={successColor} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  card: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: 'transparent', borderRadius: 16, marginBottom: 20 },
  profileCard: { padding: 0, overflow: 'hidden' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  avatarContainer: { marginRight: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: '600' },
  profileDetails: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 8 },
  profileRoleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileRole: { fontSize: 12, fontWeight: '600' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8, borderRadius: 16 },
  editButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  editTitle: { fontSize: 18, fontWeight: '600' },
  cancelEditBtn: { padding: 8 },
  editForm: { padding: 20, gap: 20 },
  inputGroup: { marginBottom: 0 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  textInput: { flex: 1, fontSize: 16 },
  themeHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  themeIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  themeInfo: { flex: 1 },
  themeTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  themeSubtitle: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  preferenceInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  preferenceText: { marginLeft: 8 },
  preferenceTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  preferenceSubtitle: { fontSize: 14 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  input: { flex: 1, fontSize: 16 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
  resetInfo: { fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 8, marginBottom: 40 },
  logoutText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  langText: { fontSize: 16 },
});
