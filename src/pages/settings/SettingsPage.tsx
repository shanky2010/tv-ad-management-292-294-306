
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-muted-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="font-medium">Role</p>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
