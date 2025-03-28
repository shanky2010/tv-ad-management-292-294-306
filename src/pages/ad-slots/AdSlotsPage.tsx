import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AdSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchAdSlots = async () => {
  const q = query(
    collection(db, 'adSlots'),
    where('status', '==', 'available'),
    orderBy('startTime')
  );
  
  const querySnapshot = await getDocs(q);
  const slots: AdSlot[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    slots.push({
      id: doc.id,
      ...data,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
    } as AdSlot);
  });
  
  return slots;
};

const AdSlotsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: adSlots = [], isLoading, error } = useQuery({
    queryKey: ['adSlots'],
    queryFn: fetchAdSlots
  });

  const filteredSlots = adSlots.filter(slot => {
    const matchesSearch = searchTerm === '' || 
      slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.channelName.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'prime-time') {
      const hour = new Date(slot.startTime).getHours();
      return matchesSearch && (hour >= 19 && hour <= 22);
    }
    if (activeTab === 'daytime') {
      const hour = new Date(slot.startTime).getHours();
      return matchesSearch && (hour >= 9 && hour <= 18);
    }
    if (activeTab === 'late-night') {
      const hour = new Date(slot.startTime).getHours();
      return matchesSearch && (hour >= 23 || hour <= 5);
    }
    
    return matchesSearch;
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center text-red-500">Error loading ad slots</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Available Ad Slots</h1>
      
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <Input
          placeholder="Search by title or channel name..."
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Slots</TabsTrigger>
          <TabsTrigger value="prime-time">Prime Time</TabsTrigger>
          <TabsTrigger value="daytime">Daytime</TabsTrigger>
          <TabsTrigger value="late-night">Late Night</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredSlots.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No ad slots found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => (
            <Card key={slot.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{slot.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span>{slot.channelName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(slot.startTime), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${slot.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{slot.estimatedViewers.toLocaleString()} estimated viewers</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/ad-slots/${slot.id}/book`}>Book This Slot</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdSlotsPage;
