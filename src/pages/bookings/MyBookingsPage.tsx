
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Booking, AdSlot } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const fetchBookings = async (userId: string) => {
  const q = query(
    collection(db, 'bookings'),
    where('advertiserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const bookings: Booking[] = [];
  
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    
    // Fetch the associated slot details
    let slotData = null;
    try {
      const slotDoc = await getDoc(doc(db, 'adSlots', data.slotId));
      if (slotDoc.exists()) {
        const slotDocData = slotDoc.data();
        slotData = {
          title: slotDocData.title,
          channelName: slotDocData.channelName,
          startTime: slotDocData.startTime.toDate(),
          endTime: slotDocData.endTime.toDate(),
        };
      }
    } catch (error) {
      console.error("Error fetching slot data:", error);
    }
    
    bookings.push({
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      slotDetails: slotData,
    } as Booking);
  }
  
  return bookings;
};

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

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['myBookings', user?.id],
    queryFn: () => fetchBookings(user?.id as string),
    enabled: !!user?.id,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500">
        <AlertCircle className="mx-auto h-10 w-10 mb-2" />
        <p>Error loading your bookings</p>
      </div>
    );
  }
  
  // Group bookings by status
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const approvedBookings = bookings.filter(booking => booking.status === 'approved');
  const rejectedBookings = bookings.filter(booking => booking.status === 'rejected');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderBookingsList(bookings)}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {renderBookingsList(pendingBookings)}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {renderBookingsList(approvedBookings)}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          {renderBookingsList(rejectedBookings)}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderBookingsList(completedBookings)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderBookingsList = (bookings: Booking[]) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{booking.adTitle}</CardTitle>
                <CardDescription>
                  {booking.slotDetails?.title || 'Ad Slot'}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.slotDetails && (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.slotDetails.startTime), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.slotDetails.startTime), 'h:mm a')} - 
                    {format(new Date(booking.slotDetails.endTime), 'h:mm a')}
                  </span>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            
            {booking.totalViews && booking.engagementRate && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="font-medium">{booking.totalViews.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="font-medium">{(booking.engagementRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyBookingsPage;
