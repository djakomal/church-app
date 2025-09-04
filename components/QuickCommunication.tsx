import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCommunications } from '@/hooks/useSimpleDatabase';
import { useAuth } from '@/context/AuthContext';

export function QuickCommunication() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'urgent' | 'reminder'>('info');
  const [showHistory, setShowHistory] = useState(false);

  // Hooks
  const { communications, createCommunication } = useCommunications();
  const { hasPermission } = useAuth();

  // Vérifier les permissions
  const canSendCommunications = hasPermission('canSendCommunications');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const placeholderColor = useThemeColor({}, 'secondary');

  const quickMessages = [
    "Répétition à 18h30 ce soir",
    "N'oubliez pas vos partitions",
    "Changement de tonalité pour le chant d'ouverture",
    "Arrivée 30 minutes avant le culte",
    "Vérifiez vos instruments avant la répétition"
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    try {
      await createCommunication({
        message: message.trim(),
        type: messageType,
        sent_at: new Date().toISOString()
      });

      setMessage('');
      
      Alert.alert(
        'Message envoyé',
        `Votre ${messageType === 'urgent' ? 'message urgent' : messageType === 'reminder' ? 'rappel' : 'message'} a été envoyé à toute l'équipe.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleQuickMessage = (quickMsg: string) => {
    setMessage(quickMsg);
  };

  const getMessageTypeColor = (type: 'info' | 'urgent' | 'reminder') => {
    switch (type) {
      case 'urgent': return accentColor;
      case 'reminder': return warningColor;
      default: return primaryColor;
    }
  };

  const getMessageTypeIcon = (type: 'info' | 'urgent' | 'reminder') => {
    switch (type) {
      case 'urgent': return 'warning';
      case 'reminder': return 'time';
      default: return 'information-circle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {canSendCommunications ? 'Communication Rapide' : 'Communications'}
        </ThemedText>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Ionicons name="time" size={20} color={primaryColor} />
          <ThemedText style={[styles.historyButtonText, { color: primaryColor }]}>
            Historique
          </ThemedText>
        </TouchableOpacity>
      </View>

      {canSendCommunications ? (
        <>
          {/* Messages rapides prédéfinis */}
          <View style={styles.quickMessagesSection}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Messages rapides:
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickMessagesScroll}>
              {quickMessages.map((quickMsg, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickMessageButton, { backgroundColor: useThemeColor({}, 'lightGray') }]}
                  onPress={() => handleQuickMessage(quickMsg)}
                >
                  <ThemedText style={[styles.quickMessageText, { color: textColor }]}>
                    {quickMsg}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.form}>
            {/* Type de message */}
            <View style={styles.messageTypeSection}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Type de message:
              </ThemedText>
              <View style={styles.messageTypeButtons}>
                {(['info', 'reminder', 'urgent'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.messageTypeButton,
                      { 
                        backgroundColor: messageType === type ? getMessageTypeColor(type) : 'transparent',
                        borderColor: getMessageTypeColor(type)
                      }
                    ]}
                    onPress={() => setMessageType(type)}
                  >
                    <Ionicons 
                      name={getMessageTypeIcon(type)} 
                      size={16} 
                      color={messageType === type ? 'white' : getMessageTypeColor(type)} 
                    />
                    <ThemedText style={[
                      styles.messageTypeText,
                      { color: messageType === type ? 'white' : getMessageTypeColor(type) }
                    ]}>
                      {type === 'info' ? 'Info' : type === 'reminder' ? 'Rappel' : 'Urgent'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ThemedText style={[styles.label, { color: textColor }]}>
              Message à envoyer:
            </ThemedText>
            
            <TextInput
              style={[styles.textArea, { backgroundColor, borderColor, color: textColor }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message ici pour toute l'équipe..."
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: getMessageTypeColor(messageType) }]}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={16} color="white" />
                <ThemedText style={styles.sendButtonText}>
                  Envoyer {messageType === 'urgent' ? 'Urgent' : messageType === 'reminder' ? 'Rappel' : 'Message'}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.clearButton, { borderColor }]}
                onPress={() => setMessage('')}
              >
                <Ionicons name="refresh" size={16} color={textColor} />
                <ThemedText style={[styles.clearButtonText, { color: textColor }]}>
                  Effacer
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.readOnlyMessage}>
          <Ionicons name="eye" size={24} color={placeholderColor} />
          <ThemedText style={[styles.readOnlyText, { color: placeholderColor }]}>
            Vous pouvez consulter les communications mais pas en envoyer.
          </ThemedText>
          <ThemedText style={[styles.readOnlySubtext, { color: placeholderColor }]}>
            Contactez un administrateur pour obtenir les permissions d'envoi.
          </ThemedText>
        </View>
      )}

      {/* Historique des messages */}
      {showHistory && (
        <View style={styles.historySection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Messages récents:
          </ThemedText>
          {communications.length === 0 ? (
            <ThemedText style={[styles.emptyHistoryText, { color: placeholderColor }]}>
              Aucun message envoyé récemment
            </ThemedText>
          ) : (
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {communications.slice(0, 5).map((comm) => (
                <View key={comm.id} style={[styles.historyItem, { borderColor }]}>
                  <View style={styles.historyItemHeader}>
                    <View style={styles.historyItemType}>
                      <Ionicons 
                        name={getMessageTypeIcon(comm.type)} 
                        size={14} 
                        color={getMessageTypeColor(comm.type)} 
                      />
                      <ThemedText style={[styles.historyItemTypeText, { color: getMessageTypeColor(comm.type) }]}>
                        {comm.type === 'info' ? 'Info' : comm.type === 'reminder' ? 'Rappel' : 'Urgent'}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.historyItemTime, { color: placeholderColor }]}>
                      {new Date(comm.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.historyItemText, { color: textColor }]}>
                    {comm.message}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickMessagesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickMessagesScroll: {
    flexDirection: 'row',
  },
  quickMessageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    minWidth: 120,
  },
  quickMessageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  messageTypeSection: {
    marginBottom: 12,
  },
  messageTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  messageTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  messageTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  emptyHistoryText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  historyList: {
    maxHeight: 200,
    marginTop: 8,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyItemType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyItemTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyItemTime: {
    fontSize: 12,
  },
  historyItemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  readOnlyMessage: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  readOnlyText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  readOnlySubtext: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
