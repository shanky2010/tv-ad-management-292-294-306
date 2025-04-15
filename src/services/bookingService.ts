import { Booking, Notification, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchBookings = async (advertiserId?: string): Promise<Booking[]> => {
  console.log(`Fetching bookings for advertiserId: ${advertiserId || 'all'}`);
  
  let query = supabase.from('bookings').select(`
    id,
    slot_id,
    advertiser_id,
    advertiser_name,
    ad_id,
    ad_title,
    ad_description,
    status,
    created_at,
    updated_at
  `);
  
  if (advertiserId) {
    query = query.eq('advertiser_id', advertiserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  console.log(`Found ${data?.length || 0} bookings`);
  
  if (!data) {
    return [];
  }
  
  // Transform the data to match our types
  const bookings: Booking[] = data.map(booking => ({
    id: booking.id,
    slotId: booking.slot_id,
    advertiserId: booking.advertiser_id,
    advertiserName: booking.advertiser_name,
    adId: booking.ad_id,
    adTitle: booking.ad_title,
    adDescription: booking.ad_description,
    status: booking.status as 'pending' | 'approved' | 'rejected' | 'completed',
    createdAt: new Date(booking.created_at),
    // Add slot details if needed - we'll fetch these separately later
  }));
  
  // Fetch slot details for each booking
  for (const booking of bookings) {
    try {
      const { data: slotData, error: slotError } = await supabase
        .from('ad_slots')
        .select(`
          channel_name,
          start_time,
          end_time,
          price,
          duration_seconds
        `)
        .eq('id', booking.slotId)
        .maybeSingle(); // Use maybeSingle instead of single to handle missing slots
      
      if (slotData && !slotError) {
        booking.slotDetails = {
          channelName: slotData.channel_name,
          startTime: new Date(slotData.start_time),
          endTime: new Date(slotData.end_time),
          price: slotData.price,
          durationSeconds: slotData.duration_seconds
        };
      }
    } catch (error) {
      console.error(`Error fetching slot details for booking ${booking.id}:`, error);
      // Continue with next booking, don't break the entire process for one failed slot fetch
    }
  }
  
  return bookings;
};

export const bookAdSlot = async (
  slotId: string,
  advertiserId: string,
  adId: string,
  adTitle: string,
  adDescription: string
): Promise<Booking> => {
  console.log(`Attempting to book slot ${slotId} for advertiser ${advertiserId}`);
  
  // Get the advertiser details
  const { data: advertiserData, error: advertiserError } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', advertiserId)
    .single();
    
  if (advertiserError) {
    console.error(`Error finding advertiser with ID ${advertiserId}:`, advertiserError);
    throw new Error('Advertiser not found');
  }
  
  const advertiserName = advertiserData?.name || 'Advertiser';
  
  // Get the slot details
  const { data: slotData, error: slotError } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', slotId)
    .single();
    
  if (slotError || !slotData) {
    console.error('Error fetching ad slot:', slotError);
    throw new Error('Ad slot not found');
  }
  
  // Verify that the slot is still available
  if (slotData.status !== 'available') {
    console.error(`Attempt to book unavailable slot: ${slotId}, current status: ${slotData.status}`);
    throw new Error('Ad slot is not available');
  }
  
  // Update the slot status to booked
  const { error: updateSlotError } = await supabase
    .from('ad_slots')
    .update({ status: 'booked' })
    .eq('id', slotId);
    
  if (updateSlotError) {
    console.error('Error updating slot status:', updateSlotError);
    throw updateSlotError;
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
    
    // Try to restore the slot to available if booking failed
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
    .single();
    
  if (adminData) {
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
  
  // Format and return the new booking
  const booking: Booking = {
    id: bookingData.id,
    slotId: bookingData.slot_id,
    advertiserId: bookingData.advertiser_id,
    advertiserName: bookingData.advertiser_name,
    adId: bookingData.ad_id,
    adTitle: bookingData.ad_title,
    adDescription: bookingData.ad_description,
    status: bookingData.status as 'pending' | 'approved' | 'rejected' | 'completed',
    createdAt: new Date(bookingData.created_at),
    slotDetails: {
      channelName: slotData.channel_name,
      startTime: new Date(slotData.start_time),
      endTime: new Date(slotData.end_time),
      price: slotData.price,
      durationSeconds: slotData.duration_seconds
    }
  };
  
  return booking;
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<Booking> => {
  // First get the current booking to access the slot_id
  const { data: currentBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
    
  if (fetchError || !currentBooking) {
    console.error('Error fetching booking:', fetchError);
    throw new Error('Booking not found');
  }
  
  // Update the booking status
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
    
  if (updateError) {
    console.error('Error updating booking status:', updateError);
    throw updateError;
  }
  
  // If the booking is rejected, set the ad slot back to 'available'
  if (status === 'rejected') {
    const slotId = currentBooking.slot_id;
    
    console.log(`Setting ad slot ${slotId} back to 'available' after booking rejection`);
    
    const { error: slotError } = await supabase
      .from('ad_slots')
      .update({ status: 'available' })
      .eq('id', slotId);
      
    if (slotError) {
      console.error('Error updating slot status:', slotError);
    }
  }
  
  // Create notification for advertiser
  const advertiserNotification = {
    user_id: currentBooking.advertiser_id,
    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your booking for ${currentBooking.ad_title} has been ${status}`,
    type: 'booking_status',
    read: false,
    target_id: bookingId
  };
  
  await supabase
    .from('notifications')
    .insert([advertiserNotification]);
    
  // Fetch slot details for the booking
  const { data: slotData } = await supabase
    .from('ad_slots')
    .select(`
      channel_name,
      start_time,
      end_time,
      price,
      duration_seconds
    `)
    .eq('id', currentBooking.slot_id)
    .single();
    
  // Format and return the updated booking
  const booking: Booking = {
    id: updatedBooking.id,
    slotId: updatedBooking.slot_id,
    advertiserId: updatedBooking.advertiser_id,
    advertiserName: updatedBooking.advertiser_name,
    adId: updatedBooking.ad_id,
    adTitle: updatedBooking.ad_title,
    adDescription: updatedBooking.ad_description,
    status: updatedBooking.status as 'pending' | 'approved' | 'rejected' | 'completed',
    createdAt: new Date(updatedBooking.created_at),
    slotDetails: slotData ? {
      channelName: slotData.channel_name,
      startTime: new Date(slotData.start_time),
      endTime: new Date(slotData.end_time),
      price: slotData.price,
      durationSeconds: slotData.duration_seconds
    } : undefined
  };
  
  return booking;
};
