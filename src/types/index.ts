
export type UserRole = 'admin' | 'advertiser';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface AdSlot {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  price: number;
  status: 'available' | 'booked' | 'completed';
  viewershipEstimate: number;
}

export interface Booking {
  id: string;
  slotId: string;
  advertiserId: string;
  advertiserName: string;
  adId: string;
  adTitle: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  totalViews?: number;
  engagementRate?: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number; // in seconds
  advertiserId: string;
  createdAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  category: string;
  averageViewership: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'booking_request' | 'booking_status' | 'system';
  targetId?: string;
}

export interface PerformanceMetric {
  id: string;
  bookingId: string;
  adId: string;
  date: Date;
  views: number;
  engagementRate: number;
  timeSlot: string;
}
