import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ChurchHeader } from '@/components/ChurchHeader';
import { ChurchSidebar } from '@/components/ChurchSidebar';
import { WorshipDetailsForm } from '@/components/WorshipDetailsForm';
import { ManagedSongCard } from '@/components/ManagedSongCard';
import { ManagedTeamMemberCard } from '@/components/ManagedTeamMemberCard';
import { QuickCommunication } from '@/components/QuickCommunication';
import { ChurchFooter } from '@/components/ChurchFooter';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function WorshipManagementScreen() {
  const [currentPage, setCurrentPage] = useState('gestion-culte');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  const [songs, setSongs] = useState([
    { id: 1, title: 'Mon Rocher, Mon Salut', artist: 'Hillsong Worship', key: 'C', tempo: 'Medium' },
    { id: 2, title: 'Au Pied de la Croix', artist: 'Matt Redman', key: 'G', tempo: 'Slow' },
    { id: 3, title: 'Glorious Day', artist: 'Casting Crowns', key: 'D', tempo: 'Fast' },
    { id: 4, title: 'Saint Esprit', artist: 'Jesus Culture', key: 'A', tempo: 'Medium' },
  ]);

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Jean Dupont', role: 'Vocaliste', status: 'confirmed' as const },
    { id: 2, name: 'Sophie Martin', role: 'Pianiste', status: 'absent' as const },
    { id: 3, name: 'Marc Lefevre', role: 'Guitariste', status: 'confirmed' as const },
    { id: 4, name: 'Clara Dubois', role: 'Batteur', status: 'confirmed' as const },
  ]);

  const handleEditSong = (id: number) => {
    // Handle song editing
    console.log('Edit song:', id);
  };

  const handleDeleteSong = (id: number) => {
    setSongs(songs.filter(song => song.id !== id));
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ChurchHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <View style={styles.mainContent}>
        {/* Sidebar */}
        <ChurchSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        {/* Main content area */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Page title */}
            <ThemedText style={[styles.pageTitle, { color: useThemeColor({}, 'text') }]}>
              Gestion du Culte
            </ThemedText>
            
            {/* Worship details form */}
            <WorshipDetailsForm />
            
            {/* Musical repertoire section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: useThemeColor({}, 'text') }]}>
                  Répertoire Musical
                </ThemedText>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
                  <Ionicons name="add" size={16} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Ajouter un Chant
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.songsList}>
                {songs.map((song) => (
                  <ManagedSongCard
                    key={song.id}
                    title={song.title}
                    artist={song.artist}
                    keySignature={song.key}
                    tempo={song.tempo}
                    onEdit={() => handleEditSong(song.id)}
                    onDelete={() => handleDeleteSong(song.id)}
                  />
                ))}
              </View>
            </View>
            
            {/* Team management section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: useThemeColor({}, 'text') }]}>
                  Attributions & Confirmations Musiciens
                </ThemedText>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
                  <Ionicons name="people" size={16} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Gérer l'équipe
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.teamList}>
                {teamMembers.map((member) => (
                  <ManagedTeamMemberCard
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    status={member.status}
                    onRoleChange={(newRole) => handleRoleChange(member.id, newRole)}
                  />
                ))}
              </View>
            </View>
            
            {/* Quick communication section */}
            <QuickCommunication />
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
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  songsList: {
    gap: 8,
  },
  teamList: {
    gap: 8,
  },
});
