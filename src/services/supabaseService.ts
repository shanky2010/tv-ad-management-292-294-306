
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  AdSlot, 
  Ad, 
  Booking, 
  Notification, 
  Channel, 
  PerformanceMetric 
} from '@/types';

// Ad Slots
export const fetchAdSlots = async (): Promise<AdSlot[]> => {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('status', 'available');
    
  if (error) {
    console.error('Error fetching ad slots:', error);
    throw error;
  }
  
  return data as unknown as AdSlot[];
};

export const createAdSlot = async (slotData: Omit<AdSlot, 'id' | 'createdAt' | 'createdBy' | 'status'>): Promise<AdSlot> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to create an ad slot');
  }
  
  const { data, error } = await supabase
    .from('ad_slots')
    .insert({
      title: slotData.title,
      description: slotData.description,
      channel_name: slotData.channelName,
      start_time: slotData.startTime,
      end_time: slotData.endTime,
      duration_seconds: slotData.durationSeconds,
      price: slotData.price,
      estimated_viewers: slotData.estimatedViewers,
      channel_id: slotData.channelId,
      created_by: user.id,
      status: 'available'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating ad slot:', error);
    throw error;
  }
  
  return data as unknown as AdSlot;
};

// Ads
export const fetchAds = async (advertiserId?: string): Promise<Ad[]> => {
  let query = supabase.from('ads').select('*');
  
  if (advertiserId) {
    query = query.eq('advertiser_id', advertiserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
  
  return data as unknown as Ad[];
};

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt' | 'status'>): Promise<Ad> => {
  const { data, error } = await supabase
    .from('ads')
    .insert({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      file_data: ad.fileData,
      thumbnail_data: ad.thumbnailData,
      advertiser_id: ad.advertiserId,
      advertiser_name: ad.advertiserName,
      status: 'active'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
  
  return data as unknown as Ad;
};

// Bookings
export const fetchBookings = async (advertiserId?: string): Promise<Booking[]> => {
  let query = supabase.from('bookings').select(`
    *,
    ad_slots (
      channel_name,
      start_time,
      end_time,
      price,
      duration_seconds
    )
  `);
  
  if (advertiserId) {
    query = query.eq('advertiser_id', advertiserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  return data.map(booking => ({
    ...booking,
    slotDetails: booking.ad_slots
  })) as unknown as Booking[];
};

export const bookAdSlot = async (
  slotId: string,
  advertiserId: string,
  adId: string,
  adTitle: string,
  adDescription: string
): Promise<Booking> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to book an ad slot');
  }
  
  // Start a transaction using RPC
  const { data, error } = await supabase.rpc('book_ad_slot', {
    p_slot_id: slotId,
    p_advertiser_id: advertiserId,
    p_ad_id: adId,
    p_ad_title: adTitle,
    p_ad_description: adDescription
  });
  
  if (error) {
    console.error('Error booking ad slot:', error);
    throw error;
  }
  
  return data as unknown as Booking;
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
  
  return data as unknown as Booking;
};

// Notifications
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
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
    console.error('Error marking notification as read:', error);
    throw error;
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
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
  
  return data as unknown as Notification[];
};

// Channels
export const fetchChannels = async (): Promise<Channel[]> => {
  const { data, error } = await supabase
    .from('channels')
    .select('*');
    
  if (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
  
  return data as unknown as Channel[];
};

// Performance Metrics
export const fetchPerformanceMetrics = async (bookingId?: string): Promise<PerformanceMetric[]> => {
  let query = supabase.from('performance_metrics').select('*');
  
  if (bookingId) {
    query = query.eq('booking_id', bookingId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
  
  return data as unknown as PerformanceMetric[];
};
