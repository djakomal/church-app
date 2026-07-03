import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  type: 'song' | 'lyric' | 'artist';
}

interface LyricsSearchProps {
  onSearch: (query: string) => void;
  suggestions: Suggestion[];
}

export function LyricsSearch({ onSearch, suggestions }: LyricsSearchProps) {
  const colorScheme = useColorScheme();
  const [query, setQuery] = useState<string>('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
      borderWidth: 1,
      borderColor: isFocused ? '#3498db' : (isDark ? '#333333' : '#e0e0e0'),
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? '#555555' : '#dddddd',
      borderRadius: 8,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
    },
    voiceButton: {
      marginLeft: 10,
      backgroundColor: isVoiceSearchActive ? '#e74c3c' : '#3498db',
      borderRadius: 25,
      padding: 10,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    historyContainer: {
      marginTop: 10,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 8,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      marginBottom: 5,
    },
    historyText: {
      fontSize: 14,
      color: isDark ? '#e0e0e0' : '#333333',
      flex: 1,
    },
    clearHistoryButton: {
      color: '#e74c3c',
      fontSize: 12,
      fontWeight: 'bold',
    },
    suggestionsContainer: {
      marginTop: 15,
      maxHeight: 200,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333333' : '#f0f0f0',
    },
    suggestionText: {
      fontSize: 14,
      color: isDark ? '#e0e0e0' : '#333333',
      marginLeft: 10,
      flex: 1,
    },
    suggestionType: {
      fontSize: 12,
      color: '#3498db',
      backgroundColor: '#e3f2fd',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    searchButton: {
      backgroundColor: '#3498db',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    searchButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setRecentSearches(prev => {
        const newSearches = [query.trim(), ...prev.filter(s => s !== query.trim())].slice(0, 5);
        return newSearches;
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const searchText = `${suggestion.artist} - ${suggestion.title}`;
    setQuery(searchText);
    onSearch(searchText);
  };

  return (
    <View style={styles.container}>\t					
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher des chansons..."
          placeholderTextColor={isDark ? '#999999' : '#999999'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setIsVoiceSearchActive(!isVoiceSearchActive)}
        >
          <Text>{isVoiceSearchActive ? '🎤' : '🎤'}</Text>
        </TouchableOpacity>
      </View>

      {recentSearches.length > 0 && isFocused && (
        <View style={styles.historyContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.historyTitle}>Recherches récentes</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearHistoryButton}>Effacer</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.map((search, index) => (
            <TouchableOpacity key={index} style={styles.historyItem} onPress={() => {
              setQuery(search);
              onSearch(search);
            }}>
              <Text style={styles.historyText}>{search}</Text>
              <Text>🗑️</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {suggestions.length > 0 && isFocused && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionClick(suggestion)}
            >
              <Text style={styles.suggestionType}>{suggestion.type}</Text>
              <Text style={styles.suggestionText}>{suggestion.title} - {suggestion.artist}</Text>
              <Text>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Rechercher</Text>
      </TouchableOpacity>
    </View>
  );
}