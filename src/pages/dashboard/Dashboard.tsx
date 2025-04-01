
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdvertiserDashboard from './AdvertiserDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  // If still loading, show nothing (loading state is handled by AppShell)
  if (isLoading) {
    return null;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      {user?.role === 'admin' ? <AdminDashboard /> : <AdvertiserDashboard />}
    </div>
  );
};

export default Dashboard;
