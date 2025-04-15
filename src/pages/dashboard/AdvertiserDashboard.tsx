import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchBookings, fetchAdSlots } from '@/services/mockApi';
import { Booking, AdSlot } from '@/types';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Film, TrendingUp } from 'lucide-react';
import { 
  AreaChart, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area, 
  Bar,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const AdvertiserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch bookings and available slots
        const bookingsData = await fetchBookings(user.id);
        const slotsData = await fetchAdSlots();
        
        setRecentBookings(bookingsData.slice(0, 3));
        setAvailableSlots(slotsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Performance data (mock data - would be replaced with actual data)
  const performanceData = [
    { date: '2023-05-01', views: 50000 },
    { date: '2023-05-02', views: 55000 },
    { date: '2023-05-03', views: 45000 },
    { date: '2023-05-04', views: 60000 },
    { date: '2023-05-05', views: 75000 },
    { date: '2023-05-06', views: 65000 },
    { date: '2023-05-07', views: 70000 },
  ];
  
  const channelPerformance = [
    { channel: 'Prime Network', views: 120000 },
    { channel: 'News 24', views: 85000 },
    { channel: 'Sports Zone', views: 95000 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Advertiser Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Overview Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">420K</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Overview Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Daily viewership over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={performanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Channel Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Views by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelPerformance}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your latest ad bookings</CardDescription>
            </div>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{booking.adTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {typeof booking.createdAt === 'string' 
                            ? format(new Date(booking.createdAt), 'MMM d, yyyy') 
                            : format(booking.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/my-bookings">View All Bookings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Available Slots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Available Slots</CardTitle>
              <CardDescription>Recently added ad slots</CardDescription>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No available slots</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{slot.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.channelName} - ${slot.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof slot.startTime === 'string'
                          ? format(new Date(slot.startTime), 'MMM d, h:mm a')
                          : format(slot.startTime, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/ad-slots">Browse All Slots</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your TV ad campaigns</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/ad-slots">Book New Ad Slot</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/my-ads">
                  <Film className="mr-2 h-4 w-4" />
                  Manage My Ads
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/my-bookings">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Bookings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
