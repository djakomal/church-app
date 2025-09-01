import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChurchHeader } from '@/components/ChurchHeader';
import { DarkSidebar } from '@/components/DarkSidebar';
import { DiscussionsPanel } from '@/components/DiscussionsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { ChurchFooter } from '@/components/ChurchFooter';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function NotificationsScreen() {
  const [currentPage, setCurrentPage] = useState('notifications');
  const [selectedDiscussion, setSelectedDiscussion] = useState('discussion-generale');
  const backgroundColor = useThemeColor({}, 'background');

  const discussionTitles = {
    'discussion-generale': 'Discussion Générale',
    'equipe-louange': 'Équipe Louange',
    'leader-louange': 'Leader Louange',
    'alertes-eglise': 'Alertes Église',
    'rappel-prochain-culte': 'Rappel Prochain Culte',
    'confirmations-equipe': 'Confirmations Équipe',
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'accueil') {
      router.push('/(tabs)');
    } else if (page === 'gestion-culte') {
      router.push('/worship-management');
    } else if (page === 'mes-chants') {
      router.push('/my-songs');
    }
  };

  const handleDiscussionSelect = (discussionId: string) => {
    setSelectedDiscussion(discussionId);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ChurchHeader currentPage={currentPage} onPageChange={handlePageChange} />
      
      <View style={styles.mainContent}>
        {/* Dark Sidebar */}
        <DarkSidebar currentPage={currentPage} onPageChange={handlePageChange} />
        
        {/* Discussions Panel */}
        <DiscussionsPanel 
          selectedDiscussion={selectedDiscussion}
          onDiscussionSelect={handleDiscussionSelect}
        />
        
        {/* Chat Panel */}
        <ChatPanel 
          discussionTitle={discussionTitles[selectedDiscussion as keyof typeof discussionTitles] || 'Discussion'}
        />
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
});
