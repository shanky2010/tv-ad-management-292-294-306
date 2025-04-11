
import React, { useState } from 'react';
import { Calendar, FileVideo, BarChart, Users, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchAdSlots, fetchBookings, updateBookingStatus } from '@/services/supabaseService';
import { Booking, AdSlot } from '@/types';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart as ChartComponent, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch ad slots and bookings
  const { 
    data: adSlots = [], 
    isLoading: slotsLoading 
  } = useQuery({
    queryKey: ['adSlots'],
    queryFn: fetchAdSlots
  });
  
  const { 
    data: bookings = [], 
    isLoading: bookingsLoading 
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchBookings()
  });
  
  // Handle booking approval
  const approveMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, 'approved'),
    onSuccess: () => {
      toast.success('Booking approved successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['adSlots'] });
    },
    onError: (error) => {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  });
  
  // Handle booking rejection
  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, 'rejected'),
    onSuccess: () => {
      toast.success('Booking rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['adSlots'] });
    },
    onError: (error) => {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  });
  
  const handleApprove = (bookingId: string) => {
    approveMutation.mutate(bookingId);
  };
  
  const handleReject = (bookingId: string) => {
    rejectMutation.mutate(bookingId);
  };
  
  // Count statistics
  const totalSlots = adSlots.length;
  const availableSlots = adSlots.filter(slot => slot.status === 'available').length;
  const bookedSlots = adSlots.filter(slot => slot.status === 'booked').length;
  const pendingApprovals = bookings.filter(booking => booking.status === 'pending').length;
  
  // Calculate total revenue (from approved bookings)
  const totalRevenue = bookings
    .filter(booking => booking.status === 'approved')
    .reduce((sum, booking) => {
      return sum + (booking.slotDetails?.price || 0);
    }, 0);
  
  // Calculate monthly revenue for chart
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const month = new Date().getMonth() - 5 + i;
    const adjustedMonth = month < 0 ? month + 12 : month;
    const monthName = new Date(currentYear, adjustedMonth, 1).toLocaleString('default', { month: 'short' });
    
    // Filter bookings for this month
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === adjustedMonth && 
             booking.status === 'approved';
    });
    
    // Calculate revenue
    const revenue = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.slotDetails?.price || 0);
    }, 0);
    
    return { name: monthName, revenue };
  });
  
  // Slot status data for pie chart
  const slotStatusData = [
    { name: 'Available', value: availableSlots },
    { name: 'Booked', value: bookedSlots },
  ];
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F'];

  if (slotsLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <Link to="/ad-slots/manage">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Manage Slots
          </Button>
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Slots</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSlots}</div>
            <p className="text-xs text-muted-foreground">{availableSlots} available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">{pendingApprovals} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertisers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 new this month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance & Status */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue from ad bookings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </ChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Slot Status</CardTitle>
            <CardDescription>Overview of your ad slot inventory</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slotStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {slotStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Slots']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Ad booking requests that need your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals > 0 ? (
            <div className="space-y-4">
              {bookings
                .filter(booking => booking.status === 'pending')
                .map(booking => (
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
              <p>No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Ad Slots</CardTitle>
            <CardDescription>Create and modify time slots</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/ad-slots/manage">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Manage Slots
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review Bookings</CardTitle>
            <CardDescription>Approve or reject ad bookings</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/bookings/manage">
              <Button>
                <FileVideo className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Reports</CardTitle>
            <CardDescription>View performance data and insights</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/analytics">
              <Button>
                <BarChart className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
