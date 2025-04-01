import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAdSlots } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockChannels } from '@/data/mockData';
import { toast } from 'sonner';
import { createAdSlot } from '@/services/mockApi';

const ManageAdSlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adSlots, setAdSlots] = useState(mockAdSlots);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelId, setChannelId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('30');
  const [price, setPrice] = useState('');
  const [estimatedViewers, setEstimatedViewers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title || !description || !channelName || !startTime || !endTime || !durationSeconds || !price || !estimatedViewers) {
        toast.error('Please fill in all fields');
        setIsSubmitting(false);
        return;
      }
      
      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(endTime);
      
      if (startTimeDate >= endTimeDate) {
        toast.error('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
      
      // Find channel ID from channel name
      const selectedChannel = mockChannels.find(channel => channel.name === channelName);
      const selectedChannelId = selectedChannel ? selectedChannel.id : '';
      
      const newSlot = await createAdSlot({
        title,
        description,
        channelName,
        channelId: selectedChannelId,
        startTime: startTimeDate,
        endTime: endTimeDate,
        durationSeconds: Number(durationSeconds),
        price: Number(price),
        estimatedViewers: Number(estimatedViewers)
      });
      
      setAdSlots([newSlot, ...adSlots]);
      toast.success('Ad slot created successfully');
      setShowCreateDialog(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setChannelName('');
      setChannelId('');
      setStartTime('');
      setEndTime('');
      setDurationSeconds('30');
      setPrice('');
      setEstimatedViewers('');
    } catch (error) {
      console.error('Error creating ad slot:', error);
      toast.error('Failed to create ad slot');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChannelChange = (value: string) => {
    setChannelName(value);
    const selectedChannel = mockChannels.find(channel => channel.name === value);
    if (selectedChannel) {
      setChannelId(selectedChannel.id);
    }
  };
  
  const handleEditSlot = (slotId: string) => {
    navigate(`/ad-slots/${slotId}/edit`);
  };
  
  const handleDeleteSlot = (slotId: string) => {
    setAdSlots(adSlots.filter(slot => slot.id !== slotId));
    toast.success('Ad slot deleted successfully');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Ad Slots</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Slot
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Ad Slots</CardTitle>
          <CardDescription>View and manage all available ad slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{slot.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditSlot(slot.id)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteSlot(slot.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Create Ad Slot Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ad Slot</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new advertising slot
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSlot} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Prime Time Slot"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={channelName} onValueChange={handleChannelChange} required>
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
                  max="120"
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
              
              <div className="space-y-2">
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
                placeholder="Describe the ad slot"
                required
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Slot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAdSlotsPage;
