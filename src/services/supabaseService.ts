
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

export const getAdSlot = async (id: string): Promise<AdSlot | null> => {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching ad slot:', error);
    throw error;
  }
  
  return data as unknown as AdSlot;
};

export const createAdSlot = async (slotData: Omit<AdSlot, 'id' | 'createdAt' | 'createdBy' | 'status'>): Promise<AdSlot> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to create an ad slot');
  }
  
  const newSlot = {
    status: 'available',
    created_by: user.id,
    title: slotData.title,
    description: slotData.description,
    channel_name: slotData.channelName,
    start_time: slotData.startTime,
    end_time: slotData.endTime,
    duration_seconds: slotData.durationSeconds,
    price: slotData.price,
    estimated_viewers: slotData.estimatedViewers,
    channel_id: slotData.channelId || user.id // Temporary default if channelId not provided
  };
  
  const { data, error } = await supabase
    .from('ad_slots')
    .insert([newSlot])
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
    .insert([{
      title: ad.title,
      description: ad.description,
      type: ad.type,
      file_data: ad.fileData,
      thumbnail_data: ad.thumbnailData,
      advertiser_id: ad.advertiserId,
      advertiser_name: ad.advertiserName,
      status: 'active'
    }])
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
  let query = supabase.from('bookings').select('*');
  
  if (advertiserId) {
    query = query.eq('advertiser_id', advertiserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  return data as unknown as Booking[];
};

export const bookAdSlot = async (
  slotId: string,
  advertiserId: string,
  adId: string,
  adTitle: string,
  adDescription: string
): Promise<Booking> => {
  // First, get the user's name
  const { data: profileData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', advertiserId)
    .single();
    
  const advertiserName = profileData?.name || 'Advertiser';
  
  // Get the slot details
  const { data: slotData } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', slotId)
    .single();
    
  if (!slotData) {
    throw new Error('Ad slot not found');
  }
  
  if (slotData.status !== 'available') {
    throw new Error('Ad slot is not available');
  }
  
  // Start a transaction
  // First update the slot status
  const { error: slotError } = await supabase
    .from('ad_slots')
    .update({ status: 'booked' })
    .eq('id', slotId);
    
  if (slotError) {
    console.error('Error updating slot status:', slotError);
    throw slotError;
  }
  
  // Create the booking
  const newBooking = {
    slot_id: slotId,
    advertiser_id: advertiserId,
    advertiser_name: advertiserName,
    ad_id: adId || null,
    ad_title: adTitle,
    ad_description: adDescription,
    status: 'pending'
  };
  
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert([newBooking])
    .select()
    .single();
    
  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    // Try to revert the slot status change
    await supabase
      .from('ad_slots')
      .update({ status: 'available' })
      .eq('id', slotId);
    throw bookingError;
  }
  
  // Find an admin to notify
  const { data: adminData } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();
    
  if (adminData && bookingData) {
    // Create notification for admin
    const adminNotification = {
      user_id: adminData.id,
      title: 'New Booking Request',
      message: `${advertiserName} has requested to book ${slotData.title}`,
      type: 'booking_request',
      read: false,
      target_id: bookingData.id
    };
    
    await supabase
      .from('notifications')
      .insert([adminNotification]);
  }
  
  return bookingData as unknown as Booking;
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<Booking> => {
  // First get the current booking to access the advertiser_id
  const { data: currentBooking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
    
  if (!currentBooking) {
    throw new Error('Booking not found');
  }
  
  // Update the booking status
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
  
  // Create notification for the advertiser
  const notification = {
    user_id: currentBooking.advertiser_id,
    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your booking for ${currentBooking.ad_title} has been ${status}`,
    type: 'booking_status',
    read: false,
    target_id: bookingId
  };
  
  await supabase
    .from('notifications')
    .insert([notification]);
    
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
