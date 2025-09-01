import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ExploreScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Explore
        </ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Découvrez notre église
          </ThemedText>
          <ThemedText style={[styles.description, { color: useThemeColor({}, 'secondary') }]}>
            Explorez les différentes sections de notre application d'église pour gérer les cultes, 
            les chants et les équipes de louange.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Fonctionnalités disponibles
          </ThemedText>
          <View style={styles.featureList}>
            <ThemedText style={[styles.feature, { color: useThemeColor({}, 'secondary') }]}>
              • Gestion du culte et des chants
            </ThemedText>
            <ThemedText style={[styles.feature, { color: useThemeColor({}, 'secondary') }]}>
              • Répertoire musical complet
            </ThemedText>
            <ThemedText style={[styles.feature, { color: useThemeColor({}, 'secondary') }]}>
              • Gestion des équipes de louange
            </ThemedText>
            <ThemedText style={[styles.feature, { color: useThemeColor({}, 'secondary') }]}>
              • Système de notifications et chat
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
  },
});
