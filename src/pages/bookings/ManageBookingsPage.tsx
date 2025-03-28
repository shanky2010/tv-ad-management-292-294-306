
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockBookings } from '@/data/mockData';

const ManageBookingsPage: React.FC = () => {
  const pendingBookings = mockBookings.filter(booking => booking.status === 'pending');
  
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
                      <AvatarImage src={`/channels/${booking.slotId}.jpg`} alt="Channel" />
                      <AvatarFallback>CH</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.adTitle}</p>
                      <p className="text-sm text-muted-foreground">By {booking.advertiserName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
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
    </div>
  );
};

export default ManageBookingsPage;
