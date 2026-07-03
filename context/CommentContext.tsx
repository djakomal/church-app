import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useComments as useCommentsDB } from '@/hooks/useSimpleDatabase';

interface CommentContextType {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  getCommentsByNotificationId: (notificationId: number) => Comment[];
  addComment: (notificationId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  getCommentCount: (notificationId: number) => number;
  canDeleteComment: (comment: Comment) => boolean;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

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

export function CommentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    error,
    getCommentsByNotificationId,
    createComment,
    deleteComment,
    getCommentCount
  } = useCommentsDB();

  const addComment = async (notificationId: number, content: string) => {
    if (!user) return;

    const commentData = {
      notificationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role === 'admin' ? 'Administrateur' : 'Membre',
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await createComment(commentData);
  };

  const adminDeleteComment = async (commentId: number) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent supprimer des commentaires');
    }
    await deleteComment(commentId);
  };

  const canDeleteComment = (comment: Comment) => {
    return user?.role === 'admin' || user?.id === comment.userId;
  };

  return (
    <CommentContext.Provider value={{
      comments: comments as Comment[],
      isLoading,
      error,
      getCommentsByNotificationId: getCommentsByNotificationId as (notificationId: number) => Comment[],
      addComment,
      deleteComment: adminDeleteComment,
      getCommentCount,
      canDeleteComment
    }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}