import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ChurchHeader } from '@/components/ChurchHeader';
import { ChurchSidebar } from '@/components/ChurchSidebar';
import { WorshipDetailsForm } from '@/components/WorshipDetailsForm';
import { ManagedSongCard } from '@/components/ManagedSongCard';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { QuickCommunication } from '@/components/QuickCommunication';
import { ChurchFooter } from '@/components/ChurchFooter';
import { SongFormModal } from '@/components/SongFormModal';
import { TeamMemberFormModal } from '@/components/TeamMemberFormModal';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSongs, useTeamMembers } from '@/hooks/useSimpleDatabase';
import { Song, TeamMember } from '@/database/simpleDatabase';

export default function WorshipManagementScreen() {
  const [currentPage, setCurrentPage] = useState('gestion-culte');
  
  // Tous les hooks de thème au début
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const secondaryColor = useThemeColor({}, 'secondary');

  // États pour les modals
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  // Hooks pour la base de données
  const {
    songs,
    isLoading: songsLoading,
    error: songsError,
    createSong,
    updateSong,
    deleteSong
  } = useSongs();

  const {
    teamMembers,
    isLoading: membersLoading,
    error: membersError,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useTeamMembers();

  // Fonctions pour gérer les chants
  const handleAddSong = () => {
    setEditingSong(null);
    setShowSongModal(true);
  };

  const handleEditSong = (id: number) => {
    const song = songs.find(s => s.id === id);
    if (song) {
      setEditingSong(song);
      setShowSongModal(true);
    }
  };

  const handleDeleteSong = async (id: number) => {
    try {
      await deleteSong(id);
      Alert.alert('Succès', 'Le chant a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le chant');
    }
  };

  const handleSaveSong = async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSong && editingSong.id) {
        await updateSong(editingSong.id, songData);
        Alert.alert('Succès', 'Le chant a été modifié avec succès');
      } else {
        await createSong(songData);
        Alert.alert('Succès', 'Le chant a été ajouté avec succès');
      }
      setShowSongModal(false);
      setEditingSong(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le chant');
    }
  };

  const handleCloseSongModal = () => {
    setShowSongModal(false);
    setEditingSong(null);
  };

  // Fonctions pour gérer les membres d'équipe
  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setShowTeamMemberModal(true);
  };

  const handleEditTeamMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
      setEditingTeamMember(member);
      setShowTeamMemberModal(true);
    }
  };

  const handleDeleteTeamMember = async (id: number) => {
    try {
      await deleteTeamMember(id);
      Alert.alert('Succès', 'Le membre a été supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le membre');
    }
  };

  const handleSaveTeamMember = async (memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTeamMember && editingTeamMember.id) {
        await updateTeamMember(editingTeamMember.id, memberData);
        Alert.alert('Succès', 'Le membre a été modifié avec succès');
      } else {
        await createTeamMember(memberData);
        Alert.alert('Succès', 'Le membre a été ajouté avec succès');
      }
      setShowTeamMemberModal(false);
      setEditingTeamMember(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le membre');
    }
  };

  const handleCloseTeamMemberModal = () => {
    setShowTeamMemberModal(false);
    setEditingTeamMember(null);
  };

  // Affichage des erreurs
  if (songsError || membersError) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            Erreur de chargement des données
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: secondaryColor }]}>
            {songsError || membersError}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Affichage du chargement
  if (songsLoading || membersLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

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
            <ThemedText style={[styles.pageTitle, { color: textColor }]}>
              Gestion du Culte
            </ThemedText>
            
            {/* Worship details form */}
            <WorshipDetailsForm />
            
            {/* Musical repertoire section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Répertoire Musical
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddSong}
                >
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
                    duration={song.duration}
                    category={song.category}
                    notes={song.notes}
                    lyrics={song.lyrics}
                    onEdit={() => handleEditSong(song.id!)}
                    onDelete={() => handleDeleteSong(song.id!)}
                  />
                ))}
              </View>
            </View>
            
            {/* Team management section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Attribution des Musiciens
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddTeamMember}
                >
                  <Ionicons name="person-add" size={16} color="white" />
                  <ThemedText style={styles.addButtonText}>
                    Ajouter un Membre
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.teamList}>
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    id={member.id!}
                    name={member.name}
                    role={member.role}
                    phone={member.phone}
                    email={member.email}
                    avatarUrl={member.avatar_url}
                    onEdit={() => handleEditTeamMember(member.id!)}
                    onDelete={() => handleDeleteTeamMember(member.id!)}
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

      {/* Modal pour ajouter/modifier un chant */}
      <SongFormModal
        visible={showSongModal}
        song={editingSong}
        onClose={handleCloseSongModal}
        onSave={handleSaveSong}
      />

      {/* Modal pour ajouter/modifier un membre d'équipe */}
      <TeamMemberFormModal
        visible={showTeamMemberModal}
        member={editingTeamMember}
        onClose={handleCloseTeamMemberModal}
        onSave={handleSaveTeamMember}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});