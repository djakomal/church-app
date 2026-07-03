import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LyricPlayerProps {
  lyrics: string[];
  onNavigate: (index: number) => void;
}

export function LyricPlayer({ lyrics, onNavigate }: LyricPlayerProps) {
  const colorScheme = useColorScheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [fontSize, setFontSize] = useState(16);

  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
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
      flex: 1,
      marginRight: 10,
    },
    artist: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    timeText: {
      fontSize: 12,
      color: isDark ? '#999999' : '#999999',
      width: 40,
      textAlign: 'center',
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: '#dddddd',
      borderRadius: 2,
      marginHorizontal: 10,
    },
    activeProgressBar: {
      height: '100%',
      backgroundColor: '#3498db',
      borderRadius: 2,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    controlButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#3498db',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    playPauseButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    controlText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    settingsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 15,
    },
    settingItem: {
      alignItems: 'center',
      padding: 10,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      width: '30%',
    },
    settingIcon: {
      fontSize: 20,
      marginBottom: 5,
    },
    settingText: {
      fontSize: 12,
      color: isDark ? '#e0e0e0' : '#333333',
    },
    lyricContent: {
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 8,
      padding: 15,
      minHeight: 100,
    },
    lyricText: {
      fontSize: fontSize,
      lineHeight: fontSize * 1.4,
      color: isDark ? '#e0e0e0' : '#333333',
      textAlign: 'center',
    },
    navButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
    },
    navButton: {
      padding: 8,
      marginHorizontal: 5,
      backgroundColor: isDark ? '#333333' : '#f0f0f0',
      borderRadius: 6,
    },
    navButtonText: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 14,
    },
  });

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, lyrics.length - 1));
    onNavigate(currentIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    onNavigate(Math.max(currentIndex - 1, 0));
  };

  const increasePlaybackRate = () => {
    setPlaybackRate(prev => Math.min(prev + 0.5, 2.0));
  };

  const decreasePlaybackRate = () => {
    setPlaybackRate(prev => Math.max(prev - 0.5, 0.5));
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  useEffect(() => {
    if (currentIndex < lyrics.length) {
      onNavigate(currentIndex);
    }
  }, [currentIndex, lyrics.length, onNavigate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>Chanson actuelle</Text>
        <Text style={styles.artist} numberOfLines={1}>Artiste</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.activeProgressBar, { width: `${(position / duration) * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
          <Text style={styles.controlText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.playPauseButton]} onPress={handlePlayPause}>
          <Text style={styles.controlText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
          <Text style={styles.controlText}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem} onPress={increasePlaybackRate}>
          <Text style={styles.settingIcon}>⚡</Text>
          <Text style={styles.settingText}>{playbackRate}x</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={decreasePlaybackRate}>
          <Text style={styles.settingIcon}>🐢</Text>
          <Text style={styles.settingText}>Lent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={increaseFontSize}>
          <Text style={styles.settingIcon}>A</Text>
          <Text style={styles.settingText}>{fontSize}px</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lyricContent}>
        <Text style={styles.lyricText}>
          {lyrics[currentIndex] || 'Pas de paroles disponibles'}
        </Text>
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex(0)}>
          <Text style={styles.navButtonText}>Début</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex(lyrics.length - 1)}>
          <Text style={styles.navButtonText}>Fin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}