
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Ad } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format } from 'date-fns';
import { Plus, Trash2, FilePlus, Film, Image } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  duration: z.number().min(5, { message: "Duration must be at least 5 seconds" }).max(60, { message: "Duration cannot exceed 60 seconds" }),
});

const fetchAds = async (userId: string) => {
  const q = query(
    collection(db, 'ads'),
    where('advertiserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
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

const MyAdsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['myAds', user?.id],
    queryFn: () => fetchAds(user?.id as string),
    enabled: !!user?.id,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 30,
    },
  });
  
  const createAdMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user || !mediaFile) throw new Error("User or media file missing");
      
      // Upload media to Firebase Storage
      const storageRef = ref(storage, `ads/${user.id}/${Date.now()}-${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      const mediaUrl = await getDownloadURL(storageRef);
      
      // Determine media type
      const mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
      
      // Create new ad in Firestore
      await addDoc(collection(db, 'ads'), {
        title: values.title,
        description: values.description,
        mediaUrl,
        mediaType,
        duration: values.duration,
        advertiserId: user.id,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAds', user?.id] });
      toast({
        title: "Ad created successfully",
        description: "Your new ad has been added to your library",
      });
      setIsDialogOpen(false);
      form.reset();
      setMediaFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create ad",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const deleteAdMutation = useMutation({
    mutationFn: async (ad: Ad) => {
      // Delete from Firestore
      await deleteDoc(doc(db, 'ads', ad.id));
      
      // Delete media from Storage if URL exists
      if (ad.mediaUrl) {
        try {
          const storageRef = ref(storage, ad.mediaUrl);
          await deleteObject(storageRef);
        } catch (error) {
          console.error("Error deleting media file:", error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAds', user?.id] });
      toast({
        title: "Ad deleted",
        description: "The ad has been removed from your library",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete ad",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!mediaFile) {
      toast({
        title: "Missing media file",
        description: "Please upload an image or video for your ad",
        variant: "destructive",
      });
      return;
    }
    
    createAdMutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center text-red-500">Error loading your ads</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Ads</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ad</DialogTitle>
              <DialogDescription>
                Upload a new advertisement to use in your bookings
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
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
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={5}
                          max={60}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Length of your ad in seconds (5-60)
                      </FormDescription>
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
                    Upload an image or video file for your ad
                  </FormDescription>
                </FormItem>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createAdMutation.isPending}
                  >
                    {createAdMutation.isPending ? "Creating..." : "Create Ad"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {ads.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <FilePlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No ads yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first ad to use in your bookings
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {ad.mediaType === 'image' ? (
                  <img 
                    src={ad.mediaUrl} 
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <video
                      src={ad.mediaUrl}
                      controls
                      className="max-h-full max-w-full"
                    />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    {ad.mediaType === 'image' ? (
                      <Image className="mr-1 h-3 w-3" />
                    ) : (
                      <Film className="mr-1 h-3 w-3" />
                    )}
                    {ad.mediaType}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{ad.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {ad.description}
                </p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{ad.duration} seconds</span>
                  <span>Created {format(new Date(ad.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteAdMutation.mutate(ad)}
                  disabled={deleteAdMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAdsPage;
