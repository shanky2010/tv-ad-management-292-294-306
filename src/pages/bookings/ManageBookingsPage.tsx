
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchBookings, updateBookingStatus } from '@/services/mockApi';
import { Booking } from '@/types';
import { toast } from 'sonner';

const ManageBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getBookings = async () => {
      try {
        const fetchedBookings = await fetchBookings();
        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    
    getBookings();
  }, []);
  
  const handleApprove = async (bookingId: string) => {
    try {
      const updatedBooking = await updateBookingStatus(bookingId, 'approved');
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      toast.success('Booking approved successfully');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };
  
  const handleReject = async (bookingId: string) => {
    try {
      const updatedBooking = await updateBookingStatus(bookingId, 'rejected');
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      toast.success('Booking rejected successfully');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };
  
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const approvedBookings = bookings.filter(booking => booking.status === 'approved');
  const rejectedBookings = bookings.filter(booking => booking.status === 'rejected');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Booking Requests</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and manage booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={`/avatars/advertiser.png`} alt="Advertiser" />
                      <AvatarFallback>{booking.advertiserName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.adTitle}</p>
                      <p className="text-sm text-muted-foreground">By {booking.advertiserName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => handleApprove(booking.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => handleReject(booking.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending bookings</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approved Bookings</CardTitle>
            <CardDescription>Bookings that have been approved</CardDescription>
          </CardHeader>
          <CardContent>
            {approvedBookings.length > 0 ? (
              <div className="space-y-4">
                {approvedBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarImage src={`/avatars/advertiser.png`} alt="Advertiser" />
                        <AvatarFallback>{booking.advertiserName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.adTitle}</p>
                        <p className="text-sm text-muted-foreground">By {booking.advertiserName}</p>
                      </div>
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Approved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No approved bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rejected Bookings</CardTitle>
            <CardDescription>Bookings that have been rejected</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectedBookings.length > 0 ? (
              <div className="space-y-4">
                {rejectedBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarImage src={`/avatars/advertiser.png`} alt="Advertiser" />
                        <AvatarFallback>{booking.advertiserName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.adTitle}</p>
                        <p className="text-sm text-muted-foreground">By {booking.advertiserName}</p>
                      </div>
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Rejected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rejected bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageBookingsPage;
