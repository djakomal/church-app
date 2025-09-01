import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { EventCard } from '@/components/EventCard';
import { SongCard } from '@/components/SongCard';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { StatusSection } from '@/components/StatusSection';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const songs = [
    { number: 1, title: 'Mon Rédempteur', key: 'G Majeur', tempo: 'Rapide' },
    { number: 2, title: 'Hosanna', key: 'E Majeur', tempo: 'Modéré' },
    { number: 3, title: 'Digne Est L\'Agneau', key: 'A Mineur', tempo: 'Lent' },
    { number: 4, title: 'Jésus est le Cher', key: 'D Majeur', tempo: 'Modéré' },
    { number: 5, title: 'Oh La Grâce', key: 'C Majeur', tempo: 'Lent' },
  ];

  const teamMembers = [
    { name: 'Elise Dupont', role: 'Chef de louange', status: 'confirmed' as const },
    { name: 'Marc Leclerc', role: 'Clavier', status: 'confirmed' as const },
    { name: 'Sophie Martin', role: 'Chant', status: 'pending' as const },
    { name: 'David Dubois', role: 'Guitare', status: 'absent' as const },
  ];

  const handleNavigation = (page: string) => {
    if (page === 'gestion-culte') {
      router.push('/worship-management');
    } else if (page === 'mes-chants') {
      router.push('/my-songs');
    } else if (page === 'notifications') {
      router.push('/notifications');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <ThemedText style={styles.headerTitle}>🎵 Église App</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => handleNavigation('notifications')}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Menu */}
      <View style={styles.navMenu}>
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: primaryColor }]}
          onPress={() => handleNavigation('gestion-culte')}
        >
          <Ionicons name="settings" size={20} color="white" />
          <ThemedText style={styles.navButtonText}>Gestion du Culte</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: primaryColor }]}
          onPress={() => handleNavigation('mes-chants')}
        >
          <Ionicons name="musical-notes" size={20} color="white" />
          <ThemedText style={styles.navButtonText}>Mes Chants</ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Main content area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <ThemedText style={[styles.pageTitle, { color: textColor }]}>
          Accueil
        </ThemedText>
        
        {/* Event card */}
        <EventCard />
        
        {/* Musical repertoire section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Répertoire Musical
          </ThemedText>
          <View style={styles.songsGrid}>
            {songs.map((song) => (
              <SongCard
                key={song.number}
                number={song.number}
                title={song.title}
                keySignature={song.key}
                tempo={song.tempo}
              />
            ))}
          </View>
        </View>
        
        {/* Team section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Équipe du Jour
          </ThemedText>
          <View style={styles.teamList}>
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.name}
                name={member.name}
                role={member.role}
                status={member.status}
              />
            ))}
          </View>
        </View>
        
        {/* Status section */}
        <StatusSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  navMenu: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  songsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  teamList: {
    gap: 8,
  },
});
