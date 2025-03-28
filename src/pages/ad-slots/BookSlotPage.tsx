
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdSlot } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const BookSlotPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [selectedAd, setSelectedAd] = useState('');
  const [userAds, setUserAds] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSlotDetails = async () => {
      if (!slotId) return;
      
      try {
        const slotRef = doc(db, 'adSlots', slotId);
        const slotSnap = await getDoc(slotRef);
        
        if (slotSnap.exists()) {
          const slotData = slotSnap.data();
          setAdSlot({
            id: slotSnap.id,
            ...slotData,
            startTime: slotData.startTime.toDate(),
            endTime: slotData.endTime.toDate(),
          } as AdSlot);
        } else {
          toast.error('Ad slot not found');
          navigate('/ad-slots');
        }
      } catch (error) {
        console.error('Error fetching slot:', error);
        toast.error('Failed to load slot details');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUserAds = async () => {
      if (!user?.id) return;
      
      try {
        const q = query(
          collection(db, 'ads'),
          where('advertiserId', '==', user.id)
        );
        
        const querySnapshot = await getDocs(q);
        const ads: any[] = [];
        
        querySnapshot.forEach((doc) => {
          ads.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setUserAds(ads);
      } catch (error) {
        console.error('Error fetching user ads:', error);
      }
    };
    
    fetchSlotDetails();
    fetchUserAds();
  }, [slotId, user?.id, navigate]);
  
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !adSlot) return;
    
    setSubmitting(true);
    
    try {
      const bookingData = {
        slotId: adSlot.id,
        advertiserId: user.id,
        advertiserName: user.name,
        adId: selectedAd || null,
        adTitle,
        adDescription,
        status: 'pending',
        createdAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      toast.success('Booking submitted successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error booking slot:', error);
      toast.error('Failed to book slot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!adSlot) {
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
                  <p>{format(adSlot.startTime, 'PPP p')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p>{format(adSlot.endTime, 'PPP p')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p>{adSlot.durationSeconds} seconds</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estimated Viewers</p>
                  <p>{adSlot.estimatedViewers.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
                      onChange={(e) => setSelectedAd(e.target.value)}
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
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Booking...' : 'Book Slot'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default BookSlotPage;
