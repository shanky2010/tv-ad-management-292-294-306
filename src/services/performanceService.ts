
import { PerformanceMetric } from '@/types';
import { db, delay } from './mockDb';
import { supabase } from '@/integrations/supabase/client';

export const fetchPerformanceMetrics = async (bookingId?: string): Promise<PerformanceMetric[]> => {
  try {
    console.log(`Fetching performance metrics for bookingId: ${bookingId || 'all'}`);
    
    if (supabase) {
      // Try to use Supabase first
      let query = supabase.from('performance_metrics').select('*');
      
      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching performance metrics from Supabase:', error);
        // Fall back to mock data if there's an error
      } else if (data && data.length > 0) {
        console.log(`Found ${data.length} performance metrics in Supabase`);
        return data as unknown as PerformanceMetric[];
      } else {
        console.log('No performance metrics found in Supabase, using mock data');
      }
    }
    
    // Fall back to mock data
    await delay(800);
    const metrics = bookingId 
      ? db.performanceMetrics.filter(metric => metric.bookingId === bookingId)
      : db.performanceMetrics;
    
    console.log(`Using ${metrics.length} mock performance metrics`);
    return metrics;
  } catch (error) {
    console.error('Error in fetchPerformanceMetrics:', error);
    // Return mock data as fallback
    await delay(800);
    const metrics = bookingId 
      ? db.performanceMetrics.filter(metric => metric.bookingId === bookingId)
      : db.performanceMetrics;
    return metrics;
  }
};

// New function to create performance metrics
export const createPerformanceMetric = async (metric: Omit<PerformanceMetric, 'id' | 'createdAt'>): Promise<PerformanceMetric> => {
  try {
    console.log('Creating new performance metric:', metric);
    
    if (supabase) {
      // Try to use Supabase first
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert({
          booking_id: metric.bookingId,
          ad_id: metric.adId,
          views: metric.views,
          engagement_rate: metric.engagementRate,
          time_slot: metric.timeSlot
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating performance metric in Supabase:', error);
        // Fall back to mock data if there's an error
      } else if (data) {
        console.log('Successfully created performance metric in Supabase:', data);
        return data as unknown as PerformanceMetric;
      }
    }
    
    // Fall back to mock data
    await delay(1000);
    const newMetric: PerformanceMetric = {
      ...metric,
      id: `metric-${Date.now()}`,
      createdAt: new Date()
    };
    
    db.performanceMetrics.push(newMetric);
    console.log('Successfully created mock performance metric:', newMetric);
    return newMetric;
  } catch (error) {
    console.error('Error in createPerformanceMetric:', error);
    throw error;
  }
};

// Function to get aggregated performance data
export const getAggregatedPerformanceData = async (advertiserId?: string): Promise<any[]> => {
  try {
    console.log(`Getting aggregated performance data for advertiserId: ${advertiserId || 'all'}`);
    
    if (supabase && advertiserId) {
      // Try to use Supabase with a join to get relevant data
      const { data, error } = await supabase
        .from('performance_metrics')
        .select(`
          id, 
          views, 
          engagement_rate, 
          date,
          time_slot,
          bookings!inner(advertiser_id, ad_title)
        `)
        .eq('bookings.advertiser_id', advertiserId);
        
      if (error) {
        console.error('Error fetching aggregated performance data:', error);
      } else if (data && data.length > 0) {
        console.log(`Found ${data.length} aggregated performance records`);
        // Transform the data for visualization
        return data.map(item => ({
          date: new Date(item.date),
          views: item.views,
          engagementRate: item.engagement_rate,
          timeSlot: item.time_slot,
          adTitle: item.bookings?.ad_title || 'Unknown'
        }));
      }
    }
    
    // Fall back to mock data processing
    await delay(800);
    
    // For mock data, we need to join performance metrics with bookings
    const allMetrics = db.performanceMetrics;
    const relevantBookings = advertiserId 
      ? db.bookings.filter(booking => booking.advertiserId === advertiserId)
      : db.bookings;
    
    const bookingMap = new Map(
      relevantBookings.map(booking => [booking.id, booking])
    );
    
    const filteredMetrics = allMetrics.filter(metric => 
      bookingMap.has(metric.bookingId)
    );
    
    const aggregatedData = filteredMetrics.map(metric => {
      const booking = bookingMap.get(metric.bookingId);
      return {
        date: new Date(metric.createdAt),
        views: metric.views,
        engagementRate: metric.engagementRate,
        timeSlot: metric.timeSlot,
        adTitle: booking?.adTitle || 'Unknown'
      };
    });
    
    console.log(`Returning ${aggregatedData.length} aggregated mock performance records`);
    return aggregatedData;
  } catch (error) {
    console.error('Error in getAggregatedPerformanceData:', error);
    return [];
  }
};
