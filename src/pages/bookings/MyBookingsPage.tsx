
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Booking, AdSlot } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Tv, DollarSign } from 'lucide-react';

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const q = query(
        collection(db, 'bookings'),
        where('advertiserId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingList: Booking[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        
        // Fetch ad slot details
        const slotDoc = await getDoc(doc(db, 'adSlots', data.slotId));
        const slotDetails = slotDoc.exists() ? slotDoc.data() : null;
        
        bookingList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          adTitle: data.adTitle || 'Untitled Ad',
          adDescription: data.adDescription || '',
          slotId: data.slotId,
          advertiserId: data.advertiserId,
          advertiserName: data.advertiserName || user.name,
          status: data.status || 'pending',
          adId: data.adId || null,
          slotDetails: slotDetails ? {
            ...slotDetails,
            startTime: slotDetails.startTime.toDate(),
            endTime: slotDetails.endTime.toDate(),
          } : null
        });
      }
      
      return bookingList;
    },
    enabled: !!user?.id,
  });
  
  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Bookings</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">
            {statusFilter === 'all' 
              ? "You haven't made any bookings yet."
              : `You don't have any ${statusFilter} bookings.`}
          </p>
          <Button className="mt-4" asChild>
            <a href="/ad-slots">Browse Ad Slots</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle>{booking.adTitle}</CardTitle>
                    <CardDescription>
                      Booked on {format(new Date(booking.createdAt), 'PP')}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`${getStatusColor(booking.status)} mt-2 md:mt-0`}
                    variant="outline"
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Ad Details</h3>
                    <p className="text-sm">{booking.adDescription}</p>
                  </div>
                  
                  {booking.slotDetails && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Slot Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                        <div className="flex items-center">
                          <Tv className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{booking.slotDetails.channelName}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>${booking.slotDetails.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(booking.slotDetails.startTime, 'PP')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(booking.slotDetails.startTime, 'p')} - {format(booking.slotDetails.endTime, 'p')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
