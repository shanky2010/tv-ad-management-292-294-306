
import { Channel } from '@/types';
import { db, delay } from './mockDb';

export const fetchChannels = async (): Promise<Channel[]> => {
  await delay(800);
  return db.channels;
};
