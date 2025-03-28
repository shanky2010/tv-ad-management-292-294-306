
import React from 'react';
import { Calendar, FileVideo, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAdSlots, mockBookings } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart as ChartComponent, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvertiserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Filter available slots
  const availableSlots = mockAdSlots.filter(slot => slot.status === 'available');
  
  // Filter bookings for this advertiser
  const myBookings = mockBookings.filter(booking => booking.advertiserId === user?.id);
  
  // Mock performance data
  const performanceData = [
    { name: 'Monday', views: 120000 },
    { name: 'Tuesday', views: 150000 },
    { name: 'Wednesday', views: 180000 },
    { name: 'Thursday', views: 160000 },
    { name: 'Friday', views: 210000 },
    { name: 'Saturday', views: 250000 },
    { name: 'Sunday', views: 190000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
        <Link to="/available-slots">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Book a Slot
          </Button>
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSlots.length}</div>
            <p className="text-xs text-muted-foreground">Available for booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBookings.length}</div>
            <p className="text-xs text-muted-foreground">Active ad bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">+14% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
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
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Ad Performance</CardTitle>
            <CardDescription>Viewership stats over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString()} views`, 'Views']}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </ChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest ad slot bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {myBookings.length > 0 ? (
                myBookings.map(booking => (
                  <div key={booking.id} className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={`/channels/${booking.slotId}.jpg`} alt="Channel" />
                      <AvatarFallback>CH</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{booking.adTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{booking.status}</span>
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {booking.totalViews ? `${(booking.totalViews / 1000).toFixed(0)}K views` : 'Pending'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No bookings yet</p>
                  <Link to="/available-slots">
                    <Button variant="outline" className="mt-4">
                      Book Your First Slot
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Ad</CardTitle>
            <CardDescription>Create a new advertisement</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/my-ads">
              <Button>
                <FileVideo className="mr-2 h-4 w-4" />
                Upload New Ad
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Book Ad Slot</CardTitle>
            <CardDescription>Reserve prime time slots</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/available-slots">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                View Available Slots
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Track your ad engagement</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Link to="/performance">
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

export default AdvertiserDashboard;
