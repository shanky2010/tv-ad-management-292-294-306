
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Newspaper, LayoutDashboard, Settings, Film, BookOpen } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  // Base routes for both roles
  const routes = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];

  // Admin-specific routes
  const adminRoutes = [
    {
      path: '/ad-slots/manage',
      name: 'Manage Slots',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/bookings/manage',
      name: 'Booking Requests',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      icon: <Newspaper className="h-5 w-5" />,
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Advertiser-specific routes
  const advertiserRoutes = [
    {
      path: '/ad-slots',
      name: 'Ad Slots',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/my-bookings',
      name: 'My Bookings',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      path: '/my-ads',
      name: 'My Ads',
      icon: <Film className="h-5 w-5" />,
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Add role-specific routes
  const allRoutes = [...routes, ...(user?.role === 'admin' ? adminRoutes : advertiserRoutes)];

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Adversify</h2>
        <p className="text-muted-foreground text-sm">TV Ad Management</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {allRoutes.map((route) => (
            <li key={route.path}>
              <NavLink
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`
                }
              >
                {route.icon}
                <span className="ml-3">{route.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
