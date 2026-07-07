import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { attendanceApi } from '@/api/attendance';

interface AttendanceConfirmationProps {
  worshipId: number;
  userId: string;
  userName: string;
}

export function AttendanceConfirmation({ worshipId, userId, userName }: AttendanceConfirmationProps) {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');

  const loadStatus = useCallback(async () => {
    try {
      const records = await attendanceApi.getAll(worshipId, userId);
      if (records.length > 0) {
        setConfirmed(records[0].confirmed);
      }
    } catch (error) {
      console.error('Erreur chargement présence:', error);
    }
  }, [worshipId, userId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await attendanceApi.upsert({ worshipId, userId, userName, confirmed: true });
      setConfirmed(true);
      Alert.alert('Succès', 'Présence confirmée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de confirmer la présence');
    } finally {
      setLoading(false);
    }
  };

  const handleAbsent = async () => {
    try {
      setLoading(true);
      await attendanceApi.upsert({ worshipId, userId, userName, confirmed: false });
      setConfirmed(false);
      Alert.alert('Succès', 'Absence signalée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de signaler l\'absence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Confirmation de Présence
      </ThemedText>

      {confirmed !== null && (
        <ThemedText style={[styles.status, { color: confirmed ? '#10b981' : '#ef4444' }]}>
          {confirmed ? '✓ Présence confirmée' : '✗ Absence signalée'}
        </ThemedText>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, { backgroundColor: primaryColor }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={16} color="white" />
          <ThemedText style={styles.buttonText}>Confirmer</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.absentButton, { borderColor: accentColor }]}
          onPress={handleAbsent}
          disabled={loading}
        >
          <Ionicons name="close" size={16} color={accentColor} />
          <ThemedText style={[styles.buttonText, { color: accentColor }]}>Absence</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {},
  absentButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
