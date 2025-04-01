
import { AdSlot, Ad, Booking, Channel, Notification, PerformanceMetric, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@adversify.com',
    name: 'Admin User',
    role: 'admin',
    avatar: '/avatars/admin.png',
  },
  {
    id: '2',
    email: 'advertiser@company.com',
    name: 'Advertiser Demo',
    role: 'advertiser',
    avatar: '/avatars/advertiser.png',
  }
];

// Mock Channels
export const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Prime Network',
    description: 'Premium entertainment channel with high viewership',
    category: 'Entertainment',
    averageViewership: 1200000,
  },
  {
    id: '2',
    name: 'News 24',
    description: '24/7 news coverage across the nation',
    category: 'News',
    averageViewership: 800000,
  },
  {
    id: '3',
    name: 'Sports Zone',
    description: 'All sports, all the time',
    category: 'Sports',
    averageViewership: 950000,
  },
];

// Helper to generate dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

// Mock Ad Slots
export const mockAdSlots: AdSlot[] = [
  {
    id: '1',
    title: 'Prime Time Slot',
    description: 'Prime time slot for maximum viewership',
    channelName: 'Prime Network',
    channelId: '1', // Added channelId
    startTime: new Date(today.setHours(20, 0, 0, 0)),
    endTime: new Date(today.setHours(20, 0, 30, 0)),
    durationSeconds: 30,
    price: 5000,
    status: 'available',
    estimatedViewers: 1000000,
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '2',
    title: 'Evening News Break',
    description: 'Evening news break with high engagement',
    channelName: 'News 24',
    channelId: '2', // Added channelId
    startTime: new Date(today.setHours(18, 30, 0, 0)),
    endTime: new Date(today.setHours(18, 30, 45, 0)),
    durationSeconds: 45,
    price: 3500,
    status: 'booked',
    estimatedViewers: 750000,
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '3',
    title: 'Morning Show',
    description: 'Morning show slot for early viewers',
    channelName: 'Prime Network',
    channelId: '1', // Added channelId
    startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
    endTime: new Date(tomorrow.setHours(8, 0, 15, 0)),
    durationSeconds: 15,
    price: 2000,
    status: 'available',
    estimatedViewers: 500000,
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '4',
    title: 'Late Night Special',
    description: 'Late night special for dedicated viewers',
    channelName: 'Sports Zone',
    channelId: '3', // Added channelId
    startTime: new Date(tomorrow.setHours(23, 0, 0, 0)),
    endTime: new Date(tomorrow.setHours(23, 0, 60, 0)),
    durationSeconds: 60,
    price: 4000,
    status: 'available',
    estimatedViewers: 300000,
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '5',
    title: 'Weekend Special',
    description: 'Weekend special for family audience',
    channelName: 'Sports Zone',
    channelId: '3', // Added channelId
    startTime: new Date(nextWeek.setHours(16, 0, 0, 0)),
    endTime: new Date(nextWeek.setHours(16, 0, 30, 0)),
    durationSeconds: 30,
    price: 4500,
    status: 'available',
    estimatedViewers: 850000,
    createdAt: new Date(),
    createdBy: '1',
  },
];

// Mock Ads
export const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    description: 'Introducing our new summer fashion line',
    type: 'video',
    fileData: '/ads/summer-collection.mp4', // Using path as base64 for example
    advertiserId: '2',
    advertiserName: 'Advertiser Demo',
    createdAt: new Date(today.setDate(today.getDate() - 10)),
    status: 'active',
  },
  {
    id: '2',
    title: 'Holiday Special Discount',
    description: 'Get 50% off on all products this holiday season',
    type: 'image',
    fileData: '/ads/holiday-special.jpg', // Using path as base64 for example
    advertiserId: '2',
    advertiserName: 'Advertiser Demo',
    createdAt: new Date(today.setDate(today.getDate() - 5)),
    status: 'active',
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    slotId: '2',
    advertiserId: '2',
    advertiserName: 'Advertiser Demo',
    adId: '1',
    adTitle: 'Summer Collection Launch',
    adDescription: 'Introducing our new summer fashion line',
    status: 'approved',
    createdAt: new Date(today.setDate(today.getDate() - 3)),
    slotDetails: {
      channelName: 'News 24',
      startTime: new Date(today.setHours(18, 30, 0, 0)),
      endTime: new Date(today.setHours(18, 30, 45, 0)),
      price: 3500,
      durationSeconds: 45,
    }
  },
  {
    id: '2',
    slotId: '3',
    advertiserId: '2',
    advertiserName: 'Advertiser Demo',
    adId: '2',
    adTitle: 'Holiday Special Discount',
    adDescription: 'Get 50% off on all products this holiday season',
    status: 'pending',
    createdAt: new Date(today.setDate(today.getDate() - 1)),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1', // admin
    title: 'New Booking Request',
    message: 'Advertiser Demo has requested to book Morning Show slot',
    read: false,
    createdAt: new Date(today.setDate(today.getDate() - 1)),
    type: 'info',
    targetId: '2',
  },
  {
    id: '2',
    userId: '2', // advertiser
    title: 'Booking Approved',
    message: 'Your booking for Evening News Break has been approved',
    read: true,
    createdAt: new Date(today.setDate(today.getDate() - 2)),
    type: 'success',
    targetId: '1',
  },
  {
    id: '3',
    userId: '2', // advertiser
    title: 'Ad Performance Update',
    message: 'Your ad "Summer Collection Launch" has reached 720K views',
    read: false,
    createdAt: new Date(today.setHours(today.getHours() - 5)),
    type: 'info',
  },
];

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: '1',
    bookingId: '1',
    adId: '1',
    date: new Date(today.setDate(today.getDate() - 3)),
    views: 250000,
    engagementRate: 0.12,
    timeSlot: '18:30 - 19:15',
  },
  {
    id: '2',
    bookingId: '1',
    adId: '1',
    date: new Date(today.setDate(today.getDate() - 2)),
    views: 280000,
    engagementRate: 0.15,
    timeSlot: '18:30 - 19:15',
  },
  {
    id: '3',
    bookingId: '1',
    adId: '1',
    date: new Date(today.setDate(today.getDate() - 1)),
    views: 190000,
    engagementRate: 0.18,
    timeSlot: '18:30 - 19:15',
  },
];

// Auth Functions
export const mockLogin = (email: string, password: string): User | null => {
  if (email === 'admin@adversify.com' && password === 'password') {
    return mockUsers[0];
  } else if (email === 'advertiser@company.com' && password === 'password') {
    return mockUsers[1];
  }
  return null;
};

export const mockRegister = (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'advertiser'
): User => {
  return {
    id: `user-${new Date().getTime()}`,
    email,
    name,
    role,
    avatar: role === 'admin' ? '/avatars/admin.png' : '/avatars/advertiser.png',
  };
};
