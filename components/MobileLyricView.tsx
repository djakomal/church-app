import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface MobileLyricViewProps {
  lyrics: string[];
  onNavigate: (index: number) => void;
}

export function MobileLyricView({ lyrics, onNavigate }: MobileLyricViewProps) {
  const colorScheme = useColorScheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isDark = colorScheme === 'dark';
  const effectiveDarkMode = isNightMode || (isDark && !isNightMode);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: effectiveDarkMode ? '#0a0a0a' : '#ffffff',
      padding: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    navButton: {
      padding: 8,
      backgroundColor: effectiveDarkMode ? '#333333' : '#f0f0f0',
      borderRadius: 8,
    },
    navButtonText: {
      color: effectiveDarkMode ? '#ffffff' : '#000000',
      fontWeight: 'bold',
      fontSize: 14,
    },
    progressIndicator: {
      height: 3,
      backgroundColor: '#3498db',
      borderRadius: 2,
      marginBottom: 15,
    },
    lyricsContainer: {
      flex: 1,
      paddingHorizontal: 5,
    },
    lyricItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: effectiveDarkMode ? '#333333' : '#f0f0f0',
    },
    activeLyricItem: {
      backgroundColor: effectiveDarkMode ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)',
      borderLeftWidth: 3,
      borderLeftColor: '#3498db',
    },
    lyricText: {
      fontSize: fontSize,
      lineHeight: fontSize * 1.4,
      color: effectiveDarkMode ? '#e0e0e0' : '#333333',
      textAlign: 'center',
    },
    activeLyricText: {
      color: '#3498db',
      fontWeight: 'bold',
    },
    bottomControls: {
      padding: 15,
      backgroundColor: effectiveDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 12,
      marginTop: 15,
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    controlItem: {
      alignItems: 'center',
      padding: 10,
    },
    controlIcon: {
      fontSize: 20,
      marginBottom: 5,
    },
    controlText: {
      fontSize: 12,
      color: effectiveDarkMode ? '#cccccc' : '#666666',
    },
    quickNav: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    quickNavButton: {
      padding: 6,
      marginHorizontal: 3,
      backgroundColor: effectiveDarkMode ? '#333333' : '#e0e0e0',
      borderRadius: 6,
      minWidth: 30,
      alignItems: 'center',
    },
    quickNavText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: effectiveDarkMode ? '#ffffff' : '#000000',
    },
  });

  const handleSwipeLeft = () => {
    const nextIndex = Math.min(currentIndex + 1, lyrics.length - 1);
    setCurrentIndex(nextIndex);
    onNavigate(nextIndex);
  };

  const handleSwipeRight = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
    onNavigate(prevIndex);
  };

  const handleSwipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 50) {
        handleSwipeLeft();
      } else if (event.translationX < -50) {
        handleSwipeRight();
      }
    });

  useEffect(() => {
    const handleScroll = () => {
      setShowControls(false);
    };

    const scrollTimeout = setTimeout(() => {
      setShowControls(true);
    }, 3000);

    return () => clearTimeout(scrollTimeout);
  }, [showControls]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
  };

  const jumpToSection = (index: number) => {
    setCurrentIndex(index);
    onNavigate(index);
  };

  const renderLyricItem = ({ item, index }: { item: string; index: number }) => {
    const isActive = index === currentIndex;

    return (
      <TouchableOpacity
        style={[styles.lyricItem, isActive && styles.activeLyricItem]}
        onPress={() => jumpToSection(index)}
        activeOpacity={0.7}
      >
        <Text style={[styles.lyricText, isActive && styles.activeLyricText]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const visibleLyrics = lyrics.slice(
    Math.max(0, currentIndex - 3),
    Math.min(lyrics.length, currentIndex + 4)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex(Math.max(0, currentIndex - 5))}>
          <Text style={styles.navButtonText}>↑5</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={toggleNightMode}>
          <Text style={styles.navButtonText}>{isNightMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex(Math.min(lyrics.length - 1, currentIndex + 5))}>
          <Text style={styles.navButtonText}>↓5</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressIndicator} />

      {showControls && (
        <View style={styles.bottomControls}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlItem} onPress={decreaseFontSize}>
              <Text style={styles.controlIcon}>A-</Text>
              <Text style={styles.controlText}>Font -</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlItem} onPress={increaseFontSize}>
              <Text style={styles.controlIcon}>A+</Text>
              <Text style={styles.controlText}>Font +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickNav}>
            {Array.from({ length: Math.min(7, lyrics.length) }, (_, i) => {
              const index = Math.max(0, currentIndex - 3) + i;
              if (index >= lyrics.length) return null;

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickNavButton, index === currentIndex && { backgroundColor: '#3498db' }]}
                  onPress={() => jumpToSection(index)}
                >
                  <Text style={[styles.quickNavText, index === currentIndex && { color: '#ffffff' }]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <GestureDetector gesture={handleSwipeGesture}>
        <View style={styles.lyricsContainer}>
          <FlatList
            data={visibleLyrics}
            renderItem={renderLyricItem}
            keyExtractor={(item, index) => (Math.max(0, currentIndex - 3) + index).toString()}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={3}
            getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
          />
        </View>
      </GestureDetector>

      <View style={{ alignItems: 'center', marginTop: 10, opacity: 0.7 }}>
        <Text style={{ color: effectiveDarkMode ? '#999999' : '#999999', fontSize: 12 }}>
          {currentIndex + 1} / {lyrics.length}
        </Text>
      </View>
    </View>
  );
}