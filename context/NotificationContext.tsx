import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationsDB } from '@/hooks/useSimpleDatabase';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'reminder' | 'success' | 'warning';
  targetAudience: 'all' | 'musicians' | 'leaders' | 'active_members';
  isScheduled: boolean;
  scheduledDate?: string;
  sent_at: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'sent_at' | 'read' | 'created_at' | 'updated_at'>) => Promise<number>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  loadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationsDB();

  const addNotification = async (notificationData: Omit<NotificationItem, 'id' | 'sent_at' | 'read' | 'created_at' | 'updated_at'>) => {
    const dbNotification = {
      ...notificationData,
      sent_at: notificationData.isScheduled && notificationData.scheduledDate 
        ? notificationData.scheduledDate 
        : new Date().toISOString(),
      read: false
    };
    
    return await createNotification(dbNotification);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      error,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}