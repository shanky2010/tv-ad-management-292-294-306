
// Instead of re-exporting everything from both services which causes name conflicts,
// we'll selectively re-export to avoid ambiguity
import { fetchBookings as fetchBookingsFromBookingService, bookAdSlot as bookAdSlotFromBookingService, updateBookingStatus as updateBookingStatusFromBookingService } from './bookingService';
import { 
  fetchAdSlots, getAdSlot, createAdSlot,
  fetchAds, createAd,
  fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead,
  fetchChannels,
  fetchPerformanceMetrics
} from './supabaseService';

// Export booking functions from bookingService (our primary implementation)
export const fetchBookings = fetchBookingsFromBookingService;
export const bookAdSlot = bookAdSlotFromBookingService;
export const updateBookingStatus = updateBookingStatusFromBookingService;

// Export other functions from supabaseService
export {
  fetchAdSlots, getAdSlot, createAdSlot,
  fetchAds, createAd,
  fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead,
  fetchChannels,
  fetchPerformanceMetrics
};
