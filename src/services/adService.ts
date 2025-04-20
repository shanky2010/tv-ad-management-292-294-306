
import { Ad } from '@/types';
import { supabase, handleError } from './baseService';

export const fetchAds = async (advertiserId?: string): Promise<Ad[]> => {
  let query = supabase.from('ads').select('*');
  
  if (advertiserId) {
    query = query.eq('advertiser_id', advertiserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return handleError(error, 'fetching ads');
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
    return handleError(error, 'creating ad');
  }
  
  return data as unknown as Ad;
};
