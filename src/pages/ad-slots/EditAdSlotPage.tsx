
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getAdSlot } from '@/services/mockApi';
import { mockChannels } from '@/data/mockData';
import { format } from 'date-fns';

const formatDateTimeLocal = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

const EditAdSlotPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelName, setChannelName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedViewers, setEstimatedViewers] = useState('');
  
  useEffect(() => {
    const fetchSlotData = async () => {
      if (!slotId) return;
      
      try {
        const slot = await getAdSlot(slotId);
        
        if (slot) {
          setTitle(slot.title);
          setDescription(slot.description);
          setChannelName(slot.channelName);
          setStartTime(formatDateTimeLocal(new Date(slot.startTime)));
          setEndTime(formatDateTimeLocal(new Date(slot.endTime)));
          setDurationSeconds(String(slot.durationSeconds));
          setPrice(String(slot.price));
          setEstimatedViewers(String(slot.estimatedViewers));
        } else {
          toast.error('Ad slot not found');
          navigate('/ad-slots/manage');
        }
      } catch (error) {
        console.error('Error fetching slot:', error);
        toast.error('Failed to load slot details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlotData();
  }, [slotId, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In a real app, we would call an API here to update the slot
      // For now, we'll just simulate success
      
      toast.success('Ad slot updated successfully');
      navigate('/ad-slots/manage');
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error('Failed to update ad slot');
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Ad Slot</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Ad Slot Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={channelName} onValueChange={setChannelName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.name}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    min="5"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="viewers">Estimated Viewers</Label>
                  <Input
                    id="viewers"
                    type="number"
                    value={estimatedViewers}
                    onChange={(e) => setEstimatedViewers(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/ad-slots/manage')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EditAdSlotPage;
