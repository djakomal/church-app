import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  sections?: { id: string; title: string; content: string }[];
}

interface SongLyricModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export function SongLyricModal({ visible, song, onClose }: SongLyricModalProps) {
  const colorScheme = useColorScheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!song) return null;

  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '95%',
      height: '90%',
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 20,
      padding: 20,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      flex: 1,
    },
    artist: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 15,
    },
    closeButton: {
      backgroundColor: '#e74c3c',
      borderRadius: 20,
      padding: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
    },
    sectionTabContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
      gap: 8,
    },
    sectionTab: {
      backgroundColor: isDark ? '#333333' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#555555' : '#dddddd',
    },
    activeSectionTab: {
      backgroundColor: '#3498db',
      borderColor: '#3498db',
    },
    sectionTabText: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#000000',
    },
    activeSectionTabText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    lyricsContainer: {
      flex: 1,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 10,
      padding: 15,
    },
    lyricsText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? '#e0e0e0' : '#333333',
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? '#999999' : '#999999',
      textAlign: 'center',
      marginTop: 50,
    },
  });

  const renderLyrics = () => {
    if (song.sections && song.sections.length > 0) {
      const activeSectionContent = song.sections.find(s => s.id === activeSection);
      if (activeSectionContent) {
        return (
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsText}>{activeSectionContent.content}</Text>
          </View>
        );
      }
      return (
        <View style={styles.lyricsContainer}>
          <Text style={styles.emptyText}>Cliquez sur une section pour commencer</Text>
        </View>
      );
    }
    return (
      <View style={styles.lyricsContainer}>
        <ScrollView>
          <Text style={styles.lyricsText}>{song.lyrics}</Text>
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {song.sections && song.sections.length > 0 && (
            <View style={styles.sectionTabContainer}>
              {song.sections.map(section => (
                <TouchableOpacity
                  key={section.id}
                  style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]}
                  onPress={() => setActiveSection(section.id)}
                >
                  <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>
                    {section.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {renderLyrics()}
        </View>
      </View>
    </Modal>
  );
}