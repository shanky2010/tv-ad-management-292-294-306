
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { AdSlot, Ad } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  adTitle: z.string().min(3, { message: "Ad title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  useExisting: z.enum(["new", "existing"]),
  existingAdId: z.string().optional(),
});

const fetchSlot = async (slotId: string) => {
  const docRef = doc(db, 'adSlots', slotId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("Ad slot not found");
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    startTime: data.startTime.toDate(),
    endTime: data.endTime.toDate(),
  } as AdSlot;
};

const fetchUserAds = async (userId: string) => {
  const adsRef = collection(db, 'ads');
  const q = query(collection(db, 'ads'), where('advertiserId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const ads: Ad[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    ads.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Ad);
  });
  
  return ads;
};

const BookSlotPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: slot, isLoading: slotLoading, error: slotError } = useQuery({
    queryKey: ['adSlot', slotId],
    queryFn: () => fetchSlot(slotId as string),
    enabled: !!slotId,
  });
  
  const { data: userAds = [], isLoading: adsLoading } = useQuery({
    queryKey: ['userAds', user?.id],
    queryFn: () => fetchUserAds(user?.id as string),
    enabled: !!user?.id,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adTitle: '',
      description: '',
      useExisting: "new",
      existingAdId: undefined,
    },
  });
  
  const useExisting = form.watch("useExisting");
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !slot || !slotId) return;
    
    try {
      setIsSubmitting(true);
      
      let adId: string;
      let adTitle: string;
      
      // If using existing ad
      if (values.useExisting === "existing" && values.existingAdId) {
        adId = values.existingAdId;
        const existingAd = userAds.find(ad => ad.id === values.existingAdId);
        adTitle = existingAd?.title || '';
      } 
      // If creating new ad
      else {
        if (!mediaFile) {
          toast({
            title: "Missing media file",
            description: "Please upload an image or video for your ad",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Upload media to Firebase Storage
        const storageRef = ref(storage, `ads/${user.id}/${Date.now()}-${mediaFile.name}`);
        await uploadBytes(storageRef, mediaFile);
        const mediaUrl = await getDownloadURL(storageRef);
        
        // Determine media type
        const mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
        
        // Create new ad in Firestore
        const adDocRef = await addDoc(collection(db, 'ads'), {
          title: values.adTitle,
          description: values.description,
          mediaUrl,
          mediaType,
          duration: slot.duration,
          advertiserId: user.id,
          createdAt: serverTimestamp(),
        });
        
        adId = adDocRef.id;
        adTitle = values.adTitle;
      }
      
      // Create booking in Firestore
      await addDoc(collection(db, 'bookings'), {
        slotId,
        advertiserId: user.id,
        advertiserName: user.name,
        adId,
        adTitle,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      // Create notification for admin
      await addDoc(collection(db, 'notifications'), {
        userId: user.id === '1' ? '2' : '1', // Send to admin
        title: 'New Booking Request',
        message: `${user.name} has requested to book the "${slot.title}" slot`,
        read: false,
        createdAt: serverTimestamp(),
        type: 'booking_request',
        targetId: slotId,
      });
      
      toast({
        title: "Booking submitted",
        description: "Your booking request has been submitted for approval",
      });
      
      // Navigate to bookings page
      navigate('/my-bookings');
    } catch (error: any) {
      console.error('Error booking slot:', error);
      toast({
        title: "Booking failed",
        description: error.message || "An error occurred while booking this slot",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };
  
  if (slotLoading || !slotId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (slotError || !slot) {
    return <div className="text-center text-red-500">Ad slot not found</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Book Ad Slot</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{slot.title}</CardTitle>
              <CardDescription>{slot.channelName}</CardDescription>
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
                <span>{slot.viewershipEstimate.toLocaleString()} estimated viewers</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>Provide details about the ad you want to display</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="useExisting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Selection</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">Create New Ad</SelectItem>
                            <SelectItem value="existing" disabled={userAds.length === 0}>
                              Use Existing Ad
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose whether to create a new ad or use an existing one
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {useExisting === "existing" ? (
                    <FormField
                      control={form.control}
                      name="existingAdId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Ad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an ad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userAds.map(ad => (
                                <SelectItem key={ad.id} value={ad.id}>
                                  {ad.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="adTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter ad title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter a description for your ad" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel>Upload Media</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*,video/*" 
                            onChange={handleFileChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload an image or video for your ad ({slot.duration} seconds max)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Book This Slot"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookSlotPage;
