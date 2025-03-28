
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
  Legend
} from 'recharts';
import { mockAdSlots, mockBookings } from '@/data/mockData';

const AnalyticsPage: React.FC = () => {
  // Count statistics
  const totalSlots = mockAdSlots.length;
  const availableSlots = mockAdSlots.filter(slot => slot.status === 'available').length;
  const bookedSlots = mockAdSlots.filter(slot => slot.status === 'booked').length;
  
  // Performance data
  const performanceData = [
    { name: 'Jan', revenue: 25000 },
    { name: 'Feb', revenue: 35000 },
    { name: 'Mar', revenue: 45000 },
    { name: 'Apr', revenue: 30000 },
    { name: 'May', revenue: 50000 },
    { name: 'Jun', revenue: 60000 },
  ];
  
  // Slot status data for pie chart
  const slotStatusData = [
    { name: 'Available', value: availableSlots },
    { name: 'Booked', value: bookedSlots },
  ];
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F'];

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
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
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly booking statistics</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: 'Jan', bookings: 12 },
                  { name: 'Feb', bookings: 19 },
                  { name: 'Mar', bookings: 15 },
                  { name: 'Apr', bookings: 22 },
                  { name: 'May', bookings: 28 },
                  { name: 'Jun', bookings: 24 },
                ]} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Bookings']} />
                <Bar dataKey="bookings" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
