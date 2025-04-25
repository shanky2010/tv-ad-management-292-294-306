
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { fetchAdSlots, fetchBookings } from '@/services/mockApi';
import { useQuery } from '@tanstack/react-query';
import { getAggregatedPerformanceData } from '@/services/performanceService';
import { format } from 'date-fns';
import { PerformanceMetric } from '@/types';

// Create an interface for the aggregated performance data
interface AggregatedPerformanceData {
  date: Date;
  views: number;
  engagementRate: number;
  timeSlot: string;
  adTitle?: string;
}

// Interface for processed data used in charts
interface MonthlyRevenueData {
  name: string;
  revenue: number;
  views: number;
}

interface DailyPerformanceData {
  date: string;
  views: number;
  engagementRate: number;
}

interface TimeSlotData {
  name: string;
  views: number;
}

const AnalyticsPage: React.FC = () => {
  // Fetch ad slots and bookings data
  const { data: adSlots = [] } = useQuery({
    queryKey: ['adSlots'],
    queryFn: async () => {
      return await fetchAdSlots();
    }
  });
  
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return await fetchBookings();
    }
  });

  // Fetch actual performance data
  const { data: performanceData = [], isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['performanceData'],
    queryFn: async () => {
      return await getAggregatedPerformanceData();
    }
  });
  
  // Count statistics
  const totalSlots = adSlots.length;
  const availableSlots = adSlots.filter(slot => slot.status === 'available').length;
  const bookedSlots = totalSlots - availableSlots;

  // Process performance data for visualization
  const processedRevenueData = React.useMemo(() => {
    if (!performanceData.length) return [];

    // Group by month and calculate revenue
    const monthData = performanceData.reduce((acc, item) => {
      const monthKey = format(new Date(item.date), 'MMM');
      if (!acc[monthKey]) {
        acc[monthKey] = { name: monthKey, revenue: 0, views: 0 };
      }
      // Estimate revenue based on views (this is just an example)
      acc[monthKey].revenue += item.views * 0.5; // assuming $0.50 per view
      acc[monthKey].views += item.views;
      return acc;
    }, {} as Record<string, MonthlyRevenueData>);

    return Object.values(monthData);
  }, [performanceData]);
  
  // Create daily performance data for line chart
  const dailyPerformanceData = React.useMemo(() => {
    if (!performanceData.length) return [];

    // Group by day
    const dailyData = performanceData.reduce((acc: Record<string, { 
      date: string; 
      views: number; 
      engagementRate: number;
      engagementCount: number 
    }>, item: AggregatedPerformanceData) => {
      const dayKey = format(new Date(item.date), 'yyyy-MM-dd');
      if (!acc[dayKey]) {
        acc[dayKey] = { 
          date: dayKey, 
          views: 0, 
          engagementRate: 0,
          engagementCount: 0 
        };
      }
      acc[dayKey].views += item.views;
      acc[dayKey].engagementRate += item.engagementRate;
      acc[dayKey].engagementCount += 1;
      return acc;
    }, {});

    // Calculate average engagement rate and format for display
    return Object.values(dailyData).map(day => ({
      date: format(new Date(day.date), 'MMM d'),
      views: day.views,
      engagementRate: day.engagementCount > 0 
        ? +(day.engagementRate / day.engagementCount).toFixed(2)
        : 0
    }));
  }, [performanceData]);

  // Slot status data for pie chart
  const slotStatusData = [
    { name: 'Available', value: availableSlots },
    { name: 'Booked', value: bookedSlots },
  ];
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F'];

  // Get top performing time slots
  const topTimeSlots = React.useMemo(() => {
    if (!performanceData.length) return [];

    const timeSlotData = performanceData.reduce((acc: Record<string, TimeSlotData>, item: AggregatedPerformanceData) => {
      if (!acc[item.timeSlot]) {
        acc[item.timeSlot] = { name: item.timeSlot, views: 0 };
      }
      acc[item.timeSlot].views += item.views;
      return acc;
    }, {});

    return Object.values(timeSlotData)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [performanceData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue from ad bookings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingPerformance ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : processedRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Slot Status</CardTitle>
            <CardDescription>Overview of ad slot inventory</CardDescription>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Top Performance by Time Slot</CardTitle>
            <CardDescription>Views by time slot</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingPerformance ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : topTimeSlots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topTimeSlots} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Views']} />
                  <Bar dataKey="views" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No time slot data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Daily Performance Trends</CardTitle>
          <CardDescription>Views and engagement rate over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoadingPerformance ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : dailyPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="engagementRate" 
                  stroke="hsl(var(--secondary))" 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No daily performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
