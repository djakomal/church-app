import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export interface Comment {
  id: number;
  notificationId: number;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentSectionProps {
  notificationId: number;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onDeleteComment?: (commentId: number) => void;
}

export function CommentSection({ 
  notificationId, 
  comments, 
  onAddComment, 
  onDeleteComment 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const cardColor = useThemeColor({}, 'cardBackground');

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un commentaire');
      return;
    }

    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleDeleteComment = (commentId: number) => {
    if (!onDeleteComment) return;
    
    Alert.alert(
      'Supprimer le commentaire',
      'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDeleteComment(commentId)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <View style={[styles.container, { borderTopColor: borderColor }]}>
      {/* Header avec compteur de commentaires */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubble-outline" size={16} color={primaryColor} />
          <ThemedText style={[styles.commentCount, { color: textColor }]}>
            {comments.length} commentaire{comments.length > 1 ? 's' : ''}
          </ThemedText>
        </View>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={secondaryColor} 
        />
      </TouchableOpacity>

      {/* Section des commentaires (collapsible) */}
      {isExpanded && (
        <View style={styles.commentsSection}>
          {/* Formulaire d'ajout de commentaire */}
          <View style={[styles.addCommentForm, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.commentInput, { color: textColor, borderColor }]}
                placeholder="Ajouter un commentaire..."
                placeholderTextColor={secondaryColor}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { 
                    backgroundColor: newComment.trim() ? primaryColor : borderColor,
                    opacity: newComment.trim() ? 1 : 0.5
                  }
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.characterCount, { color: secondaryColor }]}>
              {newComment.length}/500
            </ThemedText>
          </View>

          {/* Liste des commentaires */}
          {sortedComments.length > 0 ? (
            <ScrollView style={styles.commentsList} nestedScrollEnabled>
              {sortedComments.map((comment) => (
                <View key={comment.id} style={[styles.commentItem, { backgroundColor: cardColor, borderColor }]}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentUserInfo}>
                      <View style={[styles.userAvatar, { backgroundColor: primaryColor }]}>
                        <ThemedText style={styles.userInitial}>
                          {comment.userName.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={styles.userDetails}>
                        <ThemedText style={[styles.userName, { color: textColor }]}>
                          {comment.userName}
                        </ThemedText>
                        {comment.userRole && (
                          <ThemedText style={[styles.userRole, { color: primaryColor }]}>
                            {comment.userRole}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    <View style={styles.commentActions}>
                      <ThemedText style={[styles.commentDate, { color: secondaryColor }]}>
                        {formatDate(comment.created_at)}
                      </ThemedText>
                      {(user?.id === comment.userId || user?.role === 'admin') && onDeleteComment && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={14} color={secondaryColor} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <ThemedText style={[styles.commentContent, { color: textColor }]}>
                    {comment.content}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble-outline" size={32} color={secondaryColor} />
              <ThemedText style={[styles.noCommentsText, { color: secondaryColor }]}>
                Aucun commentaire pour le moment
              </ThemedText>
              <ThemedText style={[styles.noCommentsSubtext, { color: secondaryColor }]}>
                Soyez le premier à commenter !
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 12,
  },
  addCommentForm: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  noComments: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noCommentsSubtext: {
    fontSize: 14,
  },
});