
import { Booking } from '@/types';
import { supabase, handleError } from './baseService';

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
    return handleError(error, 'fetching bookings');
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
  
  // Define the parameters type explicitly to match the SQL function
  type BookAdSlotParams = {
    p_slot_id: string;
    p_advertiser_id: string;
    p_ad_id: string;
    p_ad_title: string;
    p_ad_description: string;
  };
  
  // Call the RPC function with properly typed parameters
  const { data, error } = await supabase.rpc<Booking>('book_ad_slot', {
    p_slot_id: slotId,
    p_advertiser_id: advertiserId,
    p_ad_id: adId,
    p_ad_title: adTitle,
    p_ad_description: adDescription
  } as BookAdSlotParams);
  
  if (error) {
    return handleError(error, 'booking ad slot');
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
    return handleError(error, 'updating booking status');
  }
  
  return data as unknown as Booking;
};
