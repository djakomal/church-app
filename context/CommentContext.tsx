import React, { createContext, useContext, ReactNode } from 'react';
import { Comment } from '@/components/CommentSection';
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
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

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
      userRole: user.role === 'admin' ? 'Administrateur' : 
                user.role === 'leader' ? 'Responsable' : 
                'Membre',
      content
    };

    await createComment(commentData);
  };

  return (
    <CommentContext.Provider value={{
      comments,
      isLoading,
      error,
      getCommentsByNotificationId,
      addComment,
      deleteComment,
      getCommentCount
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