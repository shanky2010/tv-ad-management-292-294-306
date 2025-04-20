
import { AdSlot } from '@/types';
import { supabase, handleError } from './baseService';

export const fetchAdSlots = async (): Promise<AdSlot[]> => {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('status', 'available');
    
  if (error) {
    return handleError(error, 'fetching ad slots');
  }
  
  return data as unknown as AdSlot[];
};

export const createAdSlot = async (slotData: Omit<AdSlot, 'id' | 'createdAt' | 'createdBy' | 'status'>): Promise<AdSlot> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to create an ad slot');
  }
  
  // Convert Date objects to ISO strings for Supabase
  const { data, error } = await supabase
    .from('ad_slots')
    .insert({
      title: slotData.title,
      description: slotData.description,
      channel_name: slotData.channelName,
      start_time: slotData.startTime.toISOString(),
      end_time: slotData.endTime.toISOString(),
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
    return handleError(error, 'creating ad slot');
  }
  
  return data as unknown as AdSlot;
};

export const getAdSlot = async (id: string): Promise<AdSlot | null> => {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means "No rows returned by the query"
      return null;
    }
    return handleError(error, 'fetching ad slot');
  }
  
  return data as unknown as AdSlot;
};
