import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChurchHeader } from '@/components/ChurchHeader';
import { DarkSidebar } from '@/components/DarkSidebar';
import { NextWorshipCard } from '@/components/NextWorshipCard';
import { AttendanceConfirmation } from '@/components/AttendanceConfirmation';
import { DetailedSongCard } from '@/components/DetailedSongCard';
import { ChurchFooter } from '@/components/ChurchFooter';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function MySongsScreen() {
  const [currentPage, setCurrentPage] = useState('mes-chants');
  const backgroundColor = useThemeColor({}, 'background');

  const songs = [
    { number: 1, title: 'Grand Dieu, nous te louons', subtitle: 'Traditionnel', key: 'Ré Majeur' },
    { number: 2, title: 'Bénis le Seigneur, ô mon âme', subtitle: 'Matt Redman', key: 'Sol Majeur' },
    { number: 3, title: 'À Toi la gloire', subtitle: 'Traditionnel', key: 'Do Majeur' },
    { number: 4, title: 'Mon secours est en l\'Éternel', subtitle: 'Hillsong Worship', key: 'Mi b Majeur' },
    { number: 5, title: 'Je Te donne tout', subtitle: 'Elevation Worship', key: 'La Majeur' },
  ];

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'accueil') {
      router.push('/(tabs)');
    } else if (page === 'gestion-culte') {
      router.push('/worship-management');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ChurchHeader currentPage={currentPage} onPageChange={handlePageChange} />
      
      <View style={styles.mainContent}>
        {/* Dark Sidebar */}
        <DarkSidebar currentPage={currentPage} onPageChange={handlePageChange} />
        
        {/* Main content area */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Next Worship Card */}
            <NextWorshipCard />
            
            {/* Attendance Confirmation */}
            <AttendanceConfirmation />
            
            {/* Worship Repertoire */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: useThemeColor({}, 'text') }]}>
                Répertoire du Culte
              </ThemedText>
              
              <View style={styles.songsList}>
                {songs.map((song) => (
                  <DetailedSongCard
                    key={song.number}
                    number={song.number}
                    title={song.title}
                    subtitle={song.subtitle}
                    keySignature={song.key}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* Footer */}
      <ChurchFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  songsList: {
    gap: 8,
  },
});
