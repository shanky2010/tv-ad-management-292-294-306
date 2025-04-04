import { Booking, Notification, User } from '@/types';
import { db, delay } from './mockDb';

export const fetchBookings = async (advertiserId?: string): Promise<Booking[]> => {
  await delay(800);
  console.log(`Fetching bookings for advertiserId: ${advertiserId || 'all'}`);
  const filteredBookings = advertiserId 
    ? db.bookings.filter(booking => booking.advertiserId === advertiserId)
    : db.bookings;
  console.log(`Found ${filteredBookings.length} bookings`);
  return filteredBookings;
};

export const bookAdSlot = async (
  slotId: string,
  advertiserId: string,
  adId: string,
  adTitle: string,
  adDescription: string
): Promise<Booking> => {
  await delay(1000);
  
  console.log(`Attempting to book slot ${slotId} for advertiser ${advertiserId}`);
  console.log('Current users in DB:', db.users.map(u => ({ id: u.id, name: u.name })));
  
  // Find the user
  const advertiser = db.users.find(user => user.id === advertiserId);
  if (!advertiser) {
    console.error(`Advertiser with ID ${advertiserId} not found`);
    
    // If we can't find the user in the db array, we'll create a fallback user
    // This is a workaround for the issue where localStorage has a user that isn't in our mock DB
    const fallbackUser: User = {
      id: advertiserId,
      name: "Advertiser",
      email: "advertiser@example.com",
      role: "advertiser",
      avatar: "/avatars/advertiser.png"
    };
    
    // Add to DB for future use
    db.users.push(fallbackUser);
    console.log('Added fallback user to DB:', fallbackUser);
    
    // Find the slot
    const slot = db.adSlots.find(slot => slot.id === slotId);
    if (!slot) throw new Error('Ad slot not found');
    
    // Verify that the slot is still available
    if (slot.status !== 'available') {
      console.error(`Attempt to book unavailable slot: ${slotId}, current status: ${slot.status}`);
      throw new Error('Ad slot is not available');
    }
    
    // Create booking with fallback user
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      slotId,
      advertiserId,
      advertiserName: fallbackUser.name,
      adId: adId || null,
      adTitle: adTitle || '',
      adDescription: adDescription || '',
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
    
    console.log('Creating new booking with fallback user:', booking);
    
    // Update slot status
    const slotIndex = db.adSlots.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      db.adSlots[slotIndex] = { ...slot, status: 'booked' };
    }
    
    // Add booking
    db.bookings.push(booking);
    console.log('Total bookings after creation:', db.bookings.length);
    
    // Create notification for admin
    const adminNotification: Notification = {
      id: `notification-${Date.now()}-admin`,
      userId: db.users.find(u => u.role === 'admin')?.id || '1',
      title: 'New Booking Request',
      message: `${fallbackUser.name} has requested to book ${slot.title}`,
      type: 'booking_request',
      read: false,
      createdAt: new Date(),
      targetId: booking.id
    };
    
    db.notifications.push(adminNotification);
    
    return booking;
  }
  
  // Original logic if advertiser is found (keeping the rest the same)
  // Find the slot
  const slot = db.adSlots.find(slot => slot.id === slotId);
  if (!slot) throw new Error('Ad slot not found');
  
  // Verify that the slot is still available (important double-check)
  if (slot.status !== 'available') {
    console.error(`Attempt to book unavailable slot: ${slotId}, current status: ${slot.status}`);
    throw new Error('Ad slot is not available');
  }
  
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
  
  console.log('Creating new booking:', booking);
  
  // Update slot status
  const slotIndex = db.adSlots.findIndex(s => s.id === slotId);
  if (slotIndex !== -1) {
    db.adSlots[slotIndex] = { ...slot, status: 'booked' };
  }
  
  // Add booking
  db.bookings.push(booking);
  console.log('Total bookings after creation:', db.bookings.length);
  
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
  
  console.log(`Updated booking ${bookingId} status to ${status}`);
  
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
