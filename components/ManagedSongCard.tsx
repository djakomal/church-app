import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ManagedSongCardProps {
  title: string;
  artist: string;
  keySignature: string;
  tempo: string;
  duration?: string;
  lyrics?: string;
  notes?: string;
  category?: string;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

export function ManagedSongCard({ 
  title, 
  artist, 
  keySignature, 
  tempo,
  duration = "3:45",
  lyrics = "",
  notes = "",
  category = "Louange",
  onEdit, 
  onDelete,
  onViewDetails
}: ManagedSongCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const iconColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const secondaryColor = useThemeColor({}, 'secondary');

  return (
    <>
      <View style={[styles.card, { backgroundColor, borderColor }]}>
        <TouchableOpacity 
          style={styles.content}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.songInfo}>
            <View style={styles.titleRow}>
              <ThemedText style={[styles.title, { color: textColor }]}>
                {title}
              </ThemedText>
              <View style={[styles.categoryBadge, { backgroundColor: primaryColor }]}>
                <ThemedText style={styles.categoryText}>{category}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.artist, { color: secondaryColor }]}>
              {artist}
            </ThemedText>
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="musical-note" size={14} color={iconColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {keySignature}
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={14} color={iconColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {tempo}
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={14} color={iconColor} />
                <ThemedText style={[styles.detailText, { color: textColor }]}>
                  {duration}
                </ThemedText>
              </View>
            </View>
            
            {isExpanded && (
              <View style={styles.expandedContent}>
                {notes && (
                  <View style={styles.notesSection}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                      Notes:
                    </ThemedText>
                    <ThemedText style={[styles.notesText, { color: secondaryColor }]}>
                      {notes}
                    </ThemedText>
                  </View>
                )}
                
                <View style={styles.expandedActions}>
                  <TouchableOpacity 
                    style={[styles.expandedActionButton, { backgroundColor: successColor }]}
                    onPress={() => setShowDetails(true)}
                  >
                    <Ionicons name="eye" size={16} color="white" />
                    <ThemedText style={styles.actionText}>Voir Détails</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={onEdit}
            >
              <Ionicons name="create" size={16} color="white" />
              <ThemedText style={styles.actionText}>Modifier</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: accentColor }]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={16} color="white" />
              <ThemedText style={styles.actionText}>Supprimer</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal pour les détails complets */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: textColor }]}>
              Détails du Chant
            </ThemedText>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Titre:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{title}</ThemedText>
            </View>
            
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Artiste:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{artist}</ThemedText>
            </View>
            
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Tonalité:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{keySignature}</ThemedText>
            </View>
            
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Tempo:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{tempo}</ThemedText>
            </View>
            
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Durée:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{duration}</ThemedText>
            </View>
            
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textColor }]}>Catégorie:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{category}</ThemedText>
            </View>
            
            {notes && (
              <View style={styles.detailSection}>
                <ThemedText style={[styles.detailLabel, { color: textColor }]}>Notes:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: secondaryColor }]}>{notes}</ThemedText>
              </View>
            )}
            
            {lyrics && (
              <View style={styles.detailSection}>
                <ThemedText style={[styles.detailLabel, { color: textColor }]}>Paroles:</ThemedText>
                <ThemedText style={[styles.lyricsText, { color: secondaryColor }]}>{lyrics}</ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  songInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  expandedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
});
