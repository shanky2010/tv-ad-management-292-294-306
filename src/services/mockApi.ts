
import {
  User,
  AdSlot,
  Ad,
  Booking,
  Notification,
  Channel,
  PerformanceMetric,
  UserRole
} from '@/types';
import { 
  mockUsers, 
  mockAdSlots, 
  mockAds, 
  mockBookings, 
  mockNotifications, 
  mockChannels,
  mockPerformanceMetrics,
  mockLogin as loginMock,
  mockRegister as registerMock
} from '@/data/mockData';

// In-memory storage to mimic database
const db = {
  users: [...mockUsers],
  adSlots: [...mockAdSlots],
  ads: [...mockAds],
  bookings: [...mockBookings],
  notifications: [...mockNotifications],
  channels: [...mockChannels],
  performanceMetrics: [...mockPerformanceMetrics]
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export const login = async (email: string, password: string): Promise<User | null> => {
  await delay(800); // Simulate network delay
  return loginMock(email, password);
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<User> => {
  await delay(1000); // Simulate network delay
  const newUser = registerMock(email, password, name, role);
  db.users.push(newUser);
  return newUser;
};

// Ad Slots
export const fetchAdSlots = async (): Promise<AdSlot[]> => {
  await delay(800);
  return db.adSlots.filter(slot => slot.status === 'available');
};

export const getAdSlot = async (id: string): Promise<AdSlot | null> => {
  await delay(500);
  return db.adSlots.find(slot => slot.id === id) || null;
};

export const bookAdSlot = async (
  slotId: string,
  advertiserId: string,
  adId: string,
  adTitle: string,
  adDescription: string
): Promise<Booking> => {
  await delay(1000);
  
  // Find the user
  const advertiser = db.users.find(user => user.id === advertiserId);
  if (!advertiser) throw new Error('Advertiser not found');
  
  // Find the slot
  const slot = db.adSlots.find(slot => slot.id === slotId);
  if (!slot) throw new Error('Ad slot not found');
  if (slot.status !== 'available') throw new Error('Ad slot is not available');
  
  // Find the ad
  const ad = adId ? db.ads.find(ad => ad.id === adId) : null;
  
  // Create booking
  const booking: Booking = {
    id: `booking-${Date.now()}`,
    slotId,
    advertiserId,
    advertiserName: advertiser.name,
    adId: adId || null,
    adTitle: adTitle || (ad?.title || ''),
    adDescription: adDescription || (ad?.description || ''),
    status: 'pending',
    createdAt: new Date(),
    slotDetails: {
      channelName: slot.channelName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      durationSeconds: slot.durationSeconds
    }
  };
  
  // Update slot status
  const slotIndex = db.adSlots.findIndex(s => s.id === slotId);
  if (slotIndex !== -1) {
    db.adSlots[slotIndex] = { ...slot, status: 'booked' };
  }
  
  // Add booking
  db.bookings.push(booking);
  
  // Create notification for admin
  const adminNotification: Notification = {
    id: `notification-${Date.now()}-admin`,
    userId: db.users.find(u => u.role === 'admin')?.id || '1',
    title: 'New Booking Request',
    message: `${advertiser.name} has requested to book ${slot.title}`,
    type: 'booking_request',
    read: false,
    createdAt: new Date(),
    targetId: booking.id
  };
  
  db.notifications.push(adminNotification);
  
  return booking;
};

// Ads
export const fetchAds = async (advertiserId?: string): Promise<Ad[]> => {
  await delay(800);
  return advertiserId 
    ? db.ads.filter(ad => ad.advertiserId === advertiserId)
    : db.ads;
};

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt'>): Promise<Ad> => {
  await delay(1000);
  const newAd: Ad = {
    ...ad,
    id: `ad-${Date.now()}`,
    createdAt: new Date()
  };
  
  db.ads.push(newAd);
  return newAd;
};

// Bookings
export const fetchBookings = async (advertiserId?: string): Promise<Booking[]> => {
  await delay(800);
  return advertiserId 
    ? db.bookings.filter(booking => booking.advertiserId === advertiserId)
    : db.bookings;
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<Booking> => {
  await delay(800);
  
  const bookingIndex = db.bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) throw new Error('Booking not found');
  
  const booking = db.bookings[bookingIndex];
  const updatedBooking = { ...booking, status };
  db.bookings[bookingIndex] = updatedBooking;
  
  // Create notification for advertiser
  const advertiserNotification: Notification = {
    id: `notification-${Date.now()}-advertiser`,
    userId: booking.advertiserId,
    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your booking for ${booking.adTitle} has been ${status}`,
    type: 'booking_status',
    read: false,
    createdAt: new Date(),
    targetId: booking.id
  };
  
  db.notifications.push(advertiserNotification);
  
  return updatedBooking;
};

// Notifications
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(500);
  return db.notifications.filter(n => n.userId === userId);
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  await delay(300);
  
  const notificationIndex = db.notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex === -1) throw new Error('Notification not found');
  
  const notification = db.notifications[notificationIndex];
  const updatedNotification = { ...notification, read: true };
  db.notifications[notificationIndex] = updatedNotification;
  
  return updatedNotification;
};

// Performance Metrics
export const fetchPerformanceMetrics = async (bookingId?: string): Promise<PerformanceMetric[]> => {
  await delay(800);
  return bookingId 
    ? db.performanceMetrics.filter(metric => metric.bookingId === bookingId)
    : db.performanceMetrics;
};

// Channels
export const fetchChannels = async (): Promise<Channel[]> => {
  await delay(800);
  return db.channels;
};
