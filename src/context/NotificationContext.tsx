
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Notification } from '@/types';
import { useAuth } from '@/context/AuthContext';

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Subscribe to notifications for the current user
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Notification);
      });
      
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(notification => !notification.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string): Promise<void> => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;
    
    try {
      // Update each unread notification
      const unreads = notifications.filter(n => !n.read);
      const promises = unreads.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
