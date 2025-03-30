
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash, Edit, Film } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAds, createAd } from '@/services/mockApi';
import { Ad } from '@/types';

const MyAdsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State for the ad list
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State for the new ad form
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adType, setAdType] = useState<'image' | 'video'>('image');
  const [adFile, setAdFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for edit form
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [editAdTitle, setEditAdTitle] = useState('');
  const [editAdDescription, setEditAdDescription] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Load ads when component mounts
  useEffect(() => {
    const loadAds = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const adsData = await fetchAds(user.id);
        setAds(adsData);
      } catch (error) {
        console.error('Error fetching ads:', error);
        toast.error('Failed to load ads');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAds();
  }, [user]);
  
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
      
      // Check file size (limit to 5MB for base64)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setAdFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an ad');
      return;
    }
    
    if (!adFile || !previewData) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('Creating new ad:', { title: adTitle, type: adType });
      
      // Create thumbnail for video if needed
      let thumbnailData = null;
      if (adType === 'video') {
        thumbnailData = previewData; // In a real app, you'd generate a thumbnail
      }
      
      // Create ad document with base64 data
      const newAd = await createAd({
        title: adTitle,
        description: adDescription,
        type: adType,
        fileData: previewData,
        thumbnailData: thumbnailData,
        advertiserId: user.id,
        advertiserName: user.name
      });
      
      // Add to the ads list
      setAds(prevAds => [newAd, ...prevAds]);
      
      // Reset form
      setAdTitle('');
      setAdDescription('');
      setAdFile(null);
      setPreviewData(null);
      setAdType('image');
      
      toast.success('Ad created successfully!');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Failed to create ad. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEditAd = (ad: Ad) => {
    setEditAdId(ad.id);
    setEditAdTitle(ad.title);
    setEditAdDescription(ad.description);
    setShowEditDialog(true);
  };
  
  const handleUpdateAd = async () => {
    if (!editAdId) return;
    
    try {
      // Update ad in the local state for now
      setAds(prevAds => 
        prevAds.map(ad => 
          ad.id === editAdId 
            ? { ...ad, title: editAdTitle, description: editAdDescription }
            : ad
        )
      );
      
      toast.success('Ad updated successfully!');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error('Failed to update ad. Please try again.');
    }
  };
  
  const handleDeleteAd = (adId: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        // Remove from local state for now
        setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
        toast.success('Ad deleted successfully!');
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error('Failed to delete ad. Please try again.');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Ads</h2>
      </div>
      
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
                          src={ad.fileData} 
                          alt={ad.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        {ad.fileData ? (
                          <video 
                            src={ad.fileData} 
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p>Video preview not available</p>
                          </div>
                        )}
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
                      ? 'Accepted formats: JPG, PNG, GIF. Max size: 5MB.'
                      : 'Accepted formats: MP4, WebM. Max size: 5MB.'}
                  </p>
                </div>
                
                {previewData && (
                  <div className="p-4 border rounded-md">
                    <p className="font-medium">File preview:</p>
                    {adType === 'image' ? (
                      <img 
                        src={previewData} 
                        alt="Preview" 
                        className="mt-2 max-h-[200px] object-contain"
                      />
                    ) : (
                      <video 
                        src={previewData}
                        controls
                        className="mt-2 max-h-[200px] w-full"
                      />
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Create Ad'}
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
