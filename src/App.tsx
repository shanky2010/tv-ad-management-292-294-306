
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AppShell } from "@/components/layout/AppShell";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AdSlotsPage from "./pages/ad-slots/AdSlotsPage";
import BookSlotPage from "./pages/ad-slots/BookSlotPage";
import MyBookingsPage from "./pages/bookings/MyBookingsPage";
import MyAdsPage from "./pages/ads/MyAdsPage";
import NotFound from "./pages/NotFound";

// Pages
import SettingsPage from "./pages/settings/SettingsPage";
import ManageAdSlotsPage from "./pages/ad-slots/ManageAdSlotsPage";
import EditAdSlotPage from "./pages/ad-slots/EditAdSlotPage";
import ManageBookingsPage from "./pages/bookings/ManageBookingsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Fix: Created a function component instead of using the problematic expression
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Routes */}
                <Route element={<AppShell />}>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Advertiser Routes */}
                  <Route path="/ad-slots" element={<AdSlotsPage />} />
                  <Route path="/ad-slots/:slotId/book" element={<BookSlotPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/my-ads" element={<MyAdsPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/ad-slots/manage" element={<ManageAdSlotsPage />} />
                  <Route path="/ad-slots/:slotId/edit" element={<EditAdSlotPage />} />
                  <Route path="/bookings/manage" element={<ManageBookingsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
