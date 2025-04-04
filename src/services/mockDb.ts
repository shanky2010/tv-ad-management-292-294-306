
import {
  User,
  AdSlot,
  Ad,
  Booking,
  Notification,
  Channel,
  PerformanceMetric
} from '@/types';
import { 
  mockUsers, 
  mockAdSlots, 
  mockAds, 
  mockBookings, 
  mockNotifications, 
  mockChannels,
  mockPerformanceMetrics
} from '@/data/mockData';

// In-memory storage to mimic database
export const db = {
  users: [...mockUsers],
  adSlots: [...mockAdSlots],
  ads: [...mockAds],
  bookings: [...mockBookings],
  notifications: [...mockNotifications],
  channels: [...mockChannels],
  performanceMetrics: [...mockPerformanceMetrics]
};

// Simulate network delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
