
import { Notification } from '@/types';
import { db, delay } from './mockDb';

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(500);
  return db.notifications.filter(n => n.userId === userId);
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  await delay(300);
  
  const notificationIndex = db.notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex === -1) throw new Error('Notification not found');
  
  const notification = db.notifications[notificationIndex];
  const updatedNotification = { ...notification, read: true };
  db.notifications[notificationIndex] = updatedNotification;
  
  return updatedNotification;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<Notification[]> => {
  await delay(500);
  
  const userNotifications = db.notifications.filter(n => n.userId === userId);
  
  userNotifications.forEach(notification => {
    const index = db.notifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      db.notifications[index] = { ...notification, read: true };
    }
  });
  
  return db.notifications.filter(n => n.userId === userId);
};
