
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdvertiserDashboard from './AdvertiserDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'admin' ? <AdminDashboard /> : <AdvertiserDashboard />}
    </div>
  );
};

export default Dashboard;
