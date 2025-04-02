export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'advertiser';
  avatar?: string;
  company?: string;
  phone?: string;
}

// Add the UserRole type export
export type UserRole = 'admin' | 'advertiser';

export interface AdSlot {
  id: string;
  title: string;
  description: string;
  channelName: string;
  channelId: string;  // Added channelId
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  price: number;
  status: 'available' | 'booked' | 'expired';
  estimatedViewers: number;
  createdAt: Date;
  createdBy: string;
}

export interface Booking {
  id: string;
  slotId: string;
  advertiserId: string;
  advertiserName: string;
  adId: string | null;
  adTitle: string;
  adDescription: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  slotDetails?: {
    channelName: string;
    startTime: Date;
    endTime: Date;
    price: number;
    durationSeconds: number;
    [key: string]: any;
  };
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  fileData: string; // Base64 encoded data instead of fileUrl
  thumbnailData?: string; // For videos, a thumbnail preview in base64
  advertiserId: string;
  advertiserName: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'booking_request' | 'booking_status' | 'system';
  read: boolean;
  createdAt: Date;
  linkTo?: string;
  targetId?: string;
}

// Add missing Channel and PerformanceMetric interfaces
export interface Channel {
  id: string;
  name: string;
  description: string;
  category: string;
  averageViewership: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
