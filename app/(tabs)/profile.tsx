import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const { user, logout, changePassword, resetPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailForReset, setEmailForReset] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <ThemedText style={[styles.title, { color: textColor }]}>Profil</ThemedText>
      <ThemedText style={{ color: textColor }}>Nom: {user?.name}</ThemedText>
      <ThemedText style={{ color: secondaryColor }}>Email: {user?.email}</ThemedText>
      <ThemedText style={{ color: secondaryColor }}>Rôle: {user?.role}</ThemedText>

      {/* Changement de mot de passe (connecté) */}
      <View style={styles.card}>
        <ThemedText style={[styles.cardTitle, { color: textColor }]}>Changer le mot de passe</ThemedText>
        <View style={[styles.inputRow, { borderColor }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Mot de passe actuel"
            placeholderTextColor={secondaryColor}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>
        <View style={[styles.inputRow, { borderColor }]}> 
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Nouveau mot de passe (min 6)"
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
              Alert.alert('Erreur', 'Veuillez remplir les champs');
              return;
            }
            setIsSubmitting(true);
            const res = await changePassword(currentPassword, newPassword);
            setIsSubmitting(false);
            if (res.ok) {
              setCurrentPassword(''); setNewPassword('');
              Alert.alert('Succès', 'Mot de passe mis à jour');
            } else {
              const map: Record<string, string> = {
                not_authenticated: 'Veuillez vous reconnecter.',
                wrong_password: 'Mot de passe actuel incorrect.',
                weak_password: 'Nouveau mot de passe trop court (min 6).',
                user_not_found: 'Utilisateur introuvable.',
              };
              Alert.alert('Erreur', map[res.reason || ''] || 'Impossible de changer le mot de passe');
            }
          }}
        >
          <ThemedText style={styles.primaryBtnText}>{isSubmitting ? 'Veuillez patienter...' : 'Mettre à jour'}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Réinitialisation en cas d'oubli */}
      <View style={styles.card}> 
        <ThemedText style={[styles.cardTitle, { color: textColor }]}>Mot de passe oublié</ThemedText>
        <View style={[styles.inputRow, { borderColor }]}> 
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Votre email"
            placeholderTextColor={secondaryColor}
            autoCapitalize="none"
            value={emailForReset}
            onChangeText={setEmailForReset}
          />
        </View>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor }]}
          disabled={isSubmitting}
          onPress={async () => {
            if (!emailForReset) { Alert.alert('Erreur', 'Saisissez votre email'); return; }
            if (newPassword.length < 6) { Alert.alert('Erreur', 'Définissez un nouveau mot de passe (min 6) dans le champ ci-dessus'); return; }
            setIsSubmitting(true);
            const res = await resetPassword(emailForReset, newPassword);
            setIsSubmitting(false);
            if (res.ok) {
              Alert.alert('Succès', 'Mot de passe réinitialisé. Connectez-vous.');
            } else {
              const map: Record<string, string> = { user_not_found: 'Email inconnu.', weak_password: 'Mot de passe trop court.' };
              Alert.alert('Erreur', map[res.reason || ''] || 'Impossible de réinitialiser');
            }
          }}
        >
          <ThemedText style={[styles.secondaryBtnText, { color: textColor }]}>Réinitialiser</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor }]}
        onPress={async () => { try { await logout(); } catch {} }}
      >
        <ThemedText style={[styles.logoutText, { color: textColor }]}>Se déconnecter</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

