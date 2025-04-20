
import { Channel } from '@/types';
import { supabase, handleError } from './baseService';

export const fetchChannels = async (): Promise<Channel[]> => {
  const { data, error } = await supabase
    .from('channels')
    .select('*');
    
  if (error) {
    return handleError(error, 'fetching channels');
  }
  
  return data as unknown as Channel[];
};
