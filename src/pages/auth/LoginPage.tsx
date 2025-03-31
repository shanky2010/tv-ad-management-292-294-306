
import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
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
      <div className="flex-1 hidden lg:block relative overflow-hidden bg-gradient-to-br from-primary to-accent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-primary-foreground p-10">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
              <path d="M12 16h3.5a3.5 3.5 0 1 1 0 7H12v-7z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Adversify</h1>
          <p className="text-xl mb-8 text-white/90">TV Ad Management Platform</p>
          <div className="max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="mb-6 text-white/90">
              Streamline your TV advertising with our comprehensive management platform.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mr-2 bg-white/20 p-1 rounded-full flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className="text-white/90">Easily book and manage ad slots across premium TV channels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 bg-white/20 p-1 rounded-full flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className="text-white/90">Upload and track your advertisements with real-time insights</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 bg-white/20 p-1 rounded-full flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className="text-white/90">Advanced analytics and performance tracking to optimize ROI</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-background to-background/70 p-6">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
