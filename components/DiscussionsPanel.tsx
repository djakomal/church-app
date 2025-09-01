import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { DiscussionItem } from './DiscussionItem';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DiscussionsPanelProps {
  selectedDiscussion: string;
  onDiscussionSelect: (discussion: string) => void;
}

export function DiscussionsPanel({ selectedDiscussion, onDiscussionSelect }: DiscussionsPanelProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const discussions = {
    'Messages Directs': [
      { id: 'discussion-generale', title: 'Discussion Générale', icon: 'document-text', time: '', hasNewMessages: true, hasUrgentAlert: true },
      { id: 'equipe-louange', title: 'Équipe Louange', icon: 'document-text', time: '2h' },
      { id: 'leader-louange', title: 'Leader Louange', icon: 'document-text', time: 'Hier' },
    ],
    'Alertes Urgentes': [
      { id: 'alertes-eglise', title: 'Alertes Église', icon: 'warning', time: '10 min', hasNewMessages: true, hasUrgentAlert: true },
    ],
    'Rappels de Service': [
      { id: 'rappel-prochain-culte', title: 'Rappel Prochain Culte', icon: 'notifications', time: 'Aujourd\'hui' },
    ],
    'Confirmations d\'Présence': [
      { id: 'confirmations-equipe', title: 'Confirmations Équipe', icon: 'checkmark-circle', time: 'Hier' },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Discussions
        </ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(discussions).map(([sectionTitle, sectionDiscussions]) => (
          <View key={sectionTitle} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              {sectionTitle}
            </ThemedText>
            
            {sectionDiscussions.map((discussion) => (
              <DiscussionItem
                key={discussion.id}
                title={discussion.title}
                icon={discussion.icon}
                time={discussion.time}
                isSelected={selectedDiscussion === discussion.id}
                hasNewMessages={discussion.hasNewMessages}
                hasUrgentAlert={discussion.hasUrgentAlert}
                onPress={() => onDiscussionSelect(discussion.id)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
