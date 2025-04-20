
import { Notification } from '@/types';
import { supabase, handleError } from './baseService';

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    return handleError(error, 'fetching notifications');
  }
  
  return data as unknown as Notification[];
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    return handleError(error, 'marking notification as read');
  }
  
  return data as unknown as Notification;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .select();
    
  if (error) {
    return handleError(error, 'marking all notifications as read');
  }
  
  return data as unknown as Notification[];
};
