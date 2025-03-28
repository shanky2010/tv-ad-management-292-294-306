
// Add a slotDetails field to the Booking interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'advertiser';
  avatar?: string;
  company?: string;
  phone?: string;
}

export interface AdSlot {
  id: string;
  title: string;
  description: string;
  channelName: string;
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
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  linkTo?: string;
}
