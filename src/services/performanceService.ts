
import { PerformanceMetric } from '@/types';
import { db, delay } from './mockDb';

export const fetchPerformanceMetrics = async (bookingId?: string): Promise<PerformanceMetric[]> => {
  await delay(800);
  return bookingId 
    ? db.performanceMetrics.filter(metric => metric.bookingId === bookingId)
    : db.performanceMetrics;
};
