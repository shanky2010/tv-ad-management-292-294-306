
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAdSlots } from '@/data/mockData';

const ManageAdSlotsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Ad Slots</h2>
        <Button>
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
            {mockAdSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{slot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAdSlotsPage;
