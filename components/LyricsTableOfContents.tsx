import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Section {
  id: string;
  title: string;
  content: string;
  number?: number;
}

interface LyricsTableOfContentsProps {
  song: {
    id: string;
    title: string;
    artist: string;
    sections?: { id: string; title: string; content: string; number?: number }[];
  };
  onNavigate: (sectionId: string) => void;
}

export function LyricsTableOfContents({ song, onNavigate }: LyricsTableOfContentsProps) {
  const colorScheme = useColorScheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    searchInput: {
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? '#555555' : '#dddddd',
      borderRadius: 8,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      marginBottom: 15,
    },
    sectionContainer: {
      marginBottom: 5,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      marginBottom: 5,
    },
    sectionNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#3498db',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionNumberText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#e0e0e0' : '#333333',
    },
    expandButton: {
      padding: 8,
      marginLeft: 8,
    },
    sectionContent: {
      padding: 12,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 8,
      marginTop: 5,
    },
    sectionContentText: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      lineHeight: 20,
    },
    toastContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: isDark ? '#4caf50' : '#4caf50',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      zIndex: 1000,
    },
    toastText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    emptyMessage: {
      textAlign: 'center',
      padding: 20,
      color: isDark ? '#999999' : '#999999',
    },
  });

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToSection = (sectionId: string) => {
    onNavigate(sectionId);
    setExpandedSections(new Set());
    setTimeout(() => {
      alert(`Navigated to section: ${song.sections?.find(s => s.id === sectionId)?.title || ''}`);
    }, 100);
  };

  const filteredSections = song.sections?.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSection = ({ item }: { item: Section }) => {
    const isExpanded = expandedSections.has(item.id);
    const hasPreviewText = item.content && item.content.length > 50;

    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(item.id)}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>{item.number || item.id}</Text>
          </View>
          <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <TouchableOpacity style={styles.expandButton} onPress={() => navigateToSection(item.id)}>
            <Text>→</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionContentText}>
              {item.content}
            </Text>
            {hasPreviewText && (
              <Text style={[styles.sectionContentText, { marginTop: 8, fontStyle: 'italic' }]}>
                ... (suite complète disponible)
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Table des matières</Text>
        {song.title && <Text style={{ fontSize: 14, color: isDark ? '#999999' : '#999999' }}>{song.title}</Text>}
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rechercher une section..."
        placeholderTextColor={isDark ? '#999999' : '#999999'}
      />

      {filteredSections && filteredSections.length > 0 ? (
        <FlatList
          data={filteredSections}
          renderItem={renderSection}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyMessage}>
          {searchQuery ? 'Aucune section trouvée' : 'Aucune section disponible'}
        </Text>
      )}
    </View>
  );
}