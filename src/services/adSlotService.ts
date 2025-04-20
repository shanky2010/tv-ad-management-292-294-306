
import { AdSlot } from '@/types';
import { db, delay } from './mockDb';

export const fetchAdSlots = async (): Promise<AdSlot[]> => {
  await delay(800);
  console.log('Fetching ad slots, total available:', db.adSlots.filter(slot => slot.status === 'available').length);
  return db.adSlots.filter(slot => slot.status === 'available');
};

export const getAdSlot = async (id: string): Promise<AdSlot | null> => {
  await delay(500);
  return db.adSlots.find(slot => slot.id === id) || null;
};

export const createAdSlot = async (slotData: Omit<AdSlot, 'id' | 'createdAt' | 'createdBy' | 'status'>): Promise<AdSlot> => {
  await delay(1000);
  
  const newSlot: AdSlot = {
    ...slotData,
    id: `slot-${Date.now()}`,
    createdAt: new Date(),
    createdBy: '1', // Admin ID
    status: 'available'
  };
  
  console.log('Creating new ad slot:', newSlot);
  db.adSlots.push(newSlot);
  console.log('Total ad slots after creation:', db.adSlots.length);
  return newSlot;
};
