
import React from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';

const RegisterPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 hidden lg:block bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground/20 opacity-90"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-primary-foreground p-10">
          <h1 className="text-4xl font-bold mb-2">Adversify</h1>
          <p className="text-xl mb-6">Join our TV Ad Management Platform</p>
          <div className="max-w-md">
            <p className="mb-4">
              Create an account to access the full suite of TV ad management tools.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>For advertisers: Book slots & track performance</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>For TV admins: Manage slots & approve bookings</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Real-time analytics and reporting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
