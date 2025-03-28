
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileVideo, 
  BarChart, 
  Users, 
  Settings 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  const adminLinks = [
    { to: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/manage-slots', icon: <Calendar className="h-5 w-5" />, label: 'Manage Slots' },
    { to: '/bookings', icon: <FileVideo className="h-5 w-5" />, label: 'Bookings' },
    { to: '/analytics', icon: <BarChart className="h-5 w-5" />, label: 'Analytics' },
    { to: '/advertisers', icon: <Users className="h-5 w-5" />, label: 'Advertisers' },
    { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];
  
  const advertiserLinks = [
    { to: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/available-slots', icon: <Calendar className="h-5 w-5" />, label: 'Available Slots' },
    { to: '/my-ads', icon: <FileVideo className="h-5 w-5" />, label: 'My Ads' },
    { to: '/my-bookings', icon: <Calendar className="h-5 w-5" />, label: 'My Bookings' },
    { to: '/performance', icon: <BarChart className="h-5 w-5" />, label: 'Performance' },
    { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];
  
  const links = user?.role === 'admin' ? adminLinks : advertiserLinks;

  return (
    <aside className="bg-sidebar text-sidebar-foreground w-64 h-screen flex-shrink-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Adversify</h1>
        <p className="text-sidebar-foreground/60 text-sm">TV Ad Management</p>
      </div>
      
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
