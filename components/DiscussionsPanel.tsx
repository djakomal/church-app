import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { DiscussionItem } from './DiscussionItem';
import { useThemeColor } from '@/hooks/useThemeColor';
import { discussionsApi, Discussion } from '@/api/discussions';

interface DiscussionsPanelProps {
  selectedDiscussion: string;
  onDiscussionSelect: (discussion: string) => void;
}

interface DiscussionGroup {
  category: string;
  items: Discussion[];
}

export function DiscussionsPanel({ selectedDiscussion, onDiscussionSelect }: DiscussionsPanelProps) {
  const [groups, setGroups] = useState<DiscussionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const loadDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const all = await discussionsApi.getAll();
      const grouped: Record<string, Discussion[]> = {};
      const categoryOrder = ['Messages Directs', 'Alertes Urgentes', 'Rappels de Service', 'Confirmations'];
      for (const d of all) {
        const cat = d.category || 'Messages Directs';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(d);
      }
      const sorted = categoryOrder
        .filter(c => grouped[c])
        .map(c => ({ category: c, items: grouped[c] }));
      setGroups(sorted);
    } catch (error) {
      console.error('Erreur chargement discussions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

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
        {loading ? (
          <ThemedText style={[styles.loadingText, { color: textColor }]}>Chargement...</ThemedText>
        ) : groups.map(group => (
          <View key={group.category} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              {group.category}
            </ThemedText>
            {group.items.map(discussion => (
              <DiscussionItem
                key={discussion.id}
                title={discussion.title}
                icon={discussion.icon}
                time=""
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
