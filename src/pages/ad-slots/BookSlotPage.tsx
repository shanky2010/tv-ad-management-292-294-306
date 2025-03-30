
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdSlot, Ad } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getAdSlot, fetchAds, bookAdSlot } from '@/services/mockApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BookSlotPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [selectedAd, setSelectedAd] = useState('');
  const [slotUnavailable, setSlotUnavailable] = useState(false);
  
  // Fetch ad slot details
  const { 
    data: adSlot,
    isLoading: slotLoading,
    error: slotError 
  } = useQuery({
    queryKey: ['adSlot', slotId],
    queryFn: () => slotId ? getAdSlot(slotId) : null,
    enabled: !!slotId,
    refetchInterval: 5000, // Refetch every 5 seconds to check availability
  });
  
  // Check if slot is available
  useEffect(() => {
    if (adSlot && adSlot.status !== 'available') {
      setSlotUnavailable(true);
    } else {
      setSlotUnavailable(false);
    }
  }, [adSlot]);
  
  // Fetch user's ads
  const { 
    data: userAds = [],
    isLoading: adsLoading
  } = useQuery({
    queryKey: ['userAds', user?.id],
    queryFn: () => user?.id ? fetchAds(user.id) : [],
    enabled: !!user?.id
  });
  
  // Book slot mutation
  const bookSlotMutation = useMutation({
    mutationFn: async () => {
      if (!user || !adSlot || !slotId) {
        throw new Error('Missing required data');
      }
      
      // Double check that the slot is still available
      const currentSlot = await getAdSlot(slotId);
      if (currentSlot?.status !== 'available') {
        throw new Error('Ad slot is no longer available');
      }
      
      return bookAdSlot(
        slotId,
        user.id,
        selectedAd,
        adTitle,
        adDescription
      );
    },
    onSuccess: () => {
      toast.success('Booking submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['adSlot', slotId] });
      navigate('/my-bookings');
    },
    onError: (error: Error) => {
      console.error('Error booking slot:', error);
      if (error.message.includes('not available')) {
        setSlotUnavailable(true);
        toast.error('This ad slot is no longer available');
      } else {
        toast.error('Failed to book slot. Please try again.');
      }
    }
  });
  
  // Handle ad selection
  const handleAdSelect = (adId: string) => {
    setSelectedAd(adId);
    if (adId) {
      const selectedAd = userAds.find(ad => ad.id === adId);
      if (selectedAd) {
        setAdTitle(selectedAd.title);
        setAdDescription(selectedAd.description);
      }
    } else {
      setAdTitle('');
      setAdDescription('');
    }
  };
  
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slotUnavailable) {
      toast.error('This ad slot is no longer available');
      return;
    }
    
    if (!adTitle.trim() || !adDescription.trim()) {
      toast.error('Please provide an ad title and description');
      return;
    }
    
    bookSlotMutation.mutate();
  };
  
  if (slotLoading || adsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (slotError || !adSlot) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Slot not found</h2>
          <p className="mt-2 text-muted-foreground">
            The ad slot you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate('/ad-slots')}>
            Browse Available Slots
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Ad Slot</h1>
        
        {slotUnavailable && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Slot no longer available</AlertTitle>
            <AlertDescription>
              This ad slot has already been booked by someone else. Please select another slot.
            </AlertDescription>
            <div className="mt-4">
              <Button onClick={() => navigate('/ad-slots')}>
                Browse Available Slots
              </Button>
            </div>
          </Alert>
        )}
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Slot Details</CardTitle>
            <CardDescription>Details of the ad slot you're booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="text-xl font-semibold">{adSlot.title}</h3>
                <p className="text-muted-foreground">{adSlot.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Channel</p>
                  <p>{adSlot.channelName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p>${adSlot.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p>{format(new Date(adSlot.startTime), 'PPP p')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p>{format(new Date(adSlot.endTime), 'PPP p')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p>{adSlot.durationSeconds} seconds</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estimated Viewers</p>
                  <p>{adSlot.estimatedViewers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className={adSlot.status === 'available' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {adSlot.status.charAt(0).toUpperCase() + adSlot.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {!slotUnavailable && (
          <form onSubmit={handleBookSlot}>
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
                <CardDescription>Provide details for your booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {userAds.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="selectedAd">Select an existing ad</Label>
                      <select
                        id="selectedAd"
                        value={selectedAd}
                        onChange={(e) => handleAdSelect(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">-- Create a new ad --</option>
                        {userAds.map((ad) => (
                          <option key={ad.id} value={ad.id}>{ad.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="adTitle">Ad Title</Label>
                    <Input
                      id="adTitle"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adDescription">Ad Description</Label>
                    <Textarea
                      id="adDescription"
                      value={adDescription}
                      onChange={(e) => setAdDescription(e.target.value)}
                      required
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" type="button" onClick={() => navigate('/ad-slots')} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={bookSlotMutation.isPending || slotUnavailable} 
                  className="w-full sm:w-auto"
                >
                  {bookSlotMutation.isPending ? 'Booking...' : 'Book Slot'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookSlotPage;
