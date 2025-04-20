
import { PerformanceMetric } from '@/types';
import { supabase, handleError } from './baseService';

export const fetchPerformanceMetrics = async (bookingId?: string): Promise<PerformanceMetric[]> => {
  let query = supabase.from('performance_metrics').select('*');
  
  if (bookingId) {
    query = query.eq('booking_id', bookingId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return handleError(error, 'fetching performance metrics');
  }
  
  return data as unknown as PerformanceMetric[];
};
