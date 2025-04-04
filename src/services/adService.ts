
import { Ad } from '@/types';
import { db, delay } from './mockDb';

export const fetchAds = async (advertiserId?: string): Promise<Ad[]> => {
  await delay(800);
  console.log(`Fetching ads for advertiserId: ${advertiserId || 'all'}`);
  const filteredAds = advertiserId 
    ? db.ads.filter(ad => ad.advertiserId === advertiserId)
    : db.ads;
  console.log(`Found ${filteredAds.length} ads`);
  return filteredAds;
};

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt' | 'status'>): Promise<Ad> => {
  await delay(1000);
  const newAd: Ad = {
    ...ad,
    id: `ad-${Date.now()}`,
    createdAt: new Date(),
    status: 'active'
  };
  
  console.log('Creating new ad:', { id: newAd.id, title: newAd.title, type: newAd.type });
  db.ads.push(newAd);
  console.log('Total ads after creation:', db.ads.length);
  return newAd;
};
