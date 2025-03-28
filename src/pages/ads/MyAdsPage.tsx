
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash, Edit, Play, Clock, Calendar, Film } from 'lucide-react';

const MyAdsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for the new ad form
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adType, setAdType] = useState<'image' | 'video'>('image');
  const [adFile, setAdFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for edit form
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [editAdTitle, setEditAdTitle] = useState('');
  const [editAdDescription, setEditAdDescription] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Query to fetch ads
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const q = query(
        collection(db, 'ads'),
        where('advertiserId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const adsList: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        adsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      return adsList;
    },
    enabled: !!user?.id,
  });
  
  // Mutation to create a new ad
  const createAdMutation = useMutation({
    mutationFn: async (newAd: any) => {
      return await addDoc(collection(db, 'ads'), newAd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', user?.id] });
      setAdTitle('');
      setAdDescription('');
      setAdFile(null);
      setAdType('image');
      toast.success('Ad created successfully!');
    },
    onError: () => {
      toast.error('Failed to create ad. Please try again.');
    },
  });
  
  // Mutation to update an ad
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const adRef = doc(db, 'ads', id);
      return await updateDoc(adRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', user?.id] });
      setShowEditDialog(false);
      toast.success('Ad updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update ad. Please try again.');
    },
  });
  
  // Mutation to delete an ad
  const deleteAdMutation = useMutation({
    mutationFn: async (adId: string) => {
      const adRef = doc(db, 'ads', adId);
      const adData = (await queryClient.getQueryData(['ads', user?.id]) as any[])
        .find(ad => ad.id === adId);
      
      // Delete file from storage if it exists
      if (adData?.fileUrl) {
        const fileRef = ref(storage, adData.fileUrl);
        await deleteObject(fileRef);
      }
      
      return await deleteDoc(adRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', user?.id] });
      toast.success('Ad deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete ad. Please try again.');
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file type matches selected ad type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if ((adType === 'image' && !isImage) || (adType === 'video' && !isVideo)) {
        toast.error(`Please select a ${adType} file.`);
        return;
      }
      
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      
      setAdFile(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!adFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to storage
      const storageRef = ref(storage, `ads/${user.id}/${Date.now()}-${adFile.name}`);
      const snapshot = await uploadBytes(storageRef, adFile);
      const fileUrl = await getDownloadURL(snapshot.ref);
      
      // Create ad document
      const newAd = {
        title: adTitle,
        description: adDescription,
        type: adType,
        fileUrl,
        advertiserId: user.id,
        advertiserName: user.name,
        createdAt: Timestamp.now(),
        status: 'active'
      };
      
      createAdMutation.mutate(newAd);
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleEditAd = (ad: any) => {
    setEditAdId(ad.id);
    setEditAdTitle(ad.title);
    setEditAdDescription(ad.description);
    setShowEditDialog(true);
  };
  
  const handleUpdateAd = () => {
    if (!editAdId) return;
    
    updateAdMutation.mutate({
      id: editAdId,
      data: {
        title: editAdTitle,
        description: editAdDescription,
        updatedAt: Timestamp.now(),
      }
    });
  };
  
  const handleDeleteAd = (adId: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      deleteAdMutation.mutate(adId);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Ads</h1>
      
      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="ads">Ad Library</TabsTrigger>
          <TabsTrigger value="create">Create New Ad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ads">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No ads created yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first ad to use in your bookings.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Ad
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <Card key={ad.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                        <CardDescription>
                          Created on {format(new Date(ad.createdAt), 'PP')}
                        </CardDescription>
                      </div>
                      <Badge>{ad.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ad.type === 'image' ? (
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img 
                          src={ad.fileUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <video 
                          src={ad.fileUrl} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {ad.description}
                    </p>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleEditAd(ad)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteAd(ad.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Ad</CardTitle>
              <CardDescription>
                Upload your ad content to use in your bookings
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
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
                  <Label htmlFor="adDescription">Description</Label>
                  <Textarea
                    id="adDescription"
                    value={adDescription}
                    onChange={(e) => setAdDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Ad Type</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="adType"
                        value="image"
                        checked={adType === 'image'}
                        onChange={() => setAdType('image')}
                        className="w-4 h-4"
                      />
                      <span>Image</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="adType"
                        value="video"
                        checked={adType === 'video'}
                        onChange={() => setAdType('video')}
                        className="w-4 h-4"
                      />
                      <span>Video</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adFile">Upload {adType === 'image' ? 'Image' : 'Video'}</Label>
                  <Input
                    id="adFile"
                    type="file"
                    accept={adType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {adType === 'image' 
                      ? 'Accepted formats: JPG, PNG, GIF. Max size: 50MB.'
                      : 'Accepted formats: MP4, MOV, WebM. Max size: 50MB.'}
                  </p>
                </div>
                
                {adFile && (
                  <div className="p-4 border rounded-md">
                    <p className="font-medium">Selected file:</p>
                    <p>{adFile.name} ({(adFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? 'Uploading...' : 'Create Ad'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
            <DialogDescription>
              Make changes to your ad information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Ad Title</Label>
              <Input
                id="editTitle"
                value={editAdTitle}
                onChange={(e) => setEditAdTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editAdDescription}
                onChange={(e) => setEditAdDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAd}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAdsPage;
