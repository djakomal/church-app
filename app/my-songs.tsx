import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChurchHeader } from '@/components/ChurchHeader';
import { DarkSidebar } from '@/components/DarkSidebar';
import { NextWorshipCard } from '@/components/NextWorshipCard';
import { AttendanceConfirmation } from '@/components/AttendanceConfirmation';
import { DetailedSongCard } from '@/components/DetailedSongCard';
import { ChurchFooter } from '@/components/ChurchFooter';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useT } from '@/context/I18nContext';
import { useSongs } from '@/hooks/useSimpleDatabase';

export default function MySongsScreen() {
  const [currentPage, setCurrentPage] = useState('mes-chants');
  const backgroundColor = useThemeColor({}, 'background');
  const t = useT();
  const { songs, isLoading, loadSongs } = useSongs();

  useEffect(() => { loadSongs(); }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'accueil') {
      router.push('/home');
    } else if (page === 'gestion-culte') {
      router.push('/worship-management');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ChurchHeader currentPage={currentPage} onPageChange={handlePageChange} />
      <View style={styles.mainContent}>
        <DarkSidebar currentPage={currentPage} onPageChange={handlePageChange} />
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <NextWorshipCard />
            <AttendanceConfirmation />
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: useThemeColor({}, 'text') }]}>
                {t('mySongs.repertoireTitle')}
              </ThemedText>
              {isLoading ? (
                <ActivityIndicator size="large" color={useThemeColor({}, 'primary')} />
              ) : songs.length === 0 ? (
                <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>{t('songs.empty')}</ThemedText>
              ) : (
                <View style={styles.songsList}>
                  {songs.map((song, index) => (
                    <DetailedSongCard
                      key={song.id || index}
                      number={index + 1}
                      title={song.title}
                      subtitle={song.artist}
                      keySignature={song.key}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
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
