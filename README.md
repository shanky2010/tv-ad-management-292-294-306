
# TV Ad Management Platform

A comprehensive platform for managing television ad slots, bookings, and performance analytics.

## Features

- User authentication with role-based access (Admin and Advertiser roles)
- Ad slot management for TV channel advertising
- Ad creation and management for advertisers
- Booking system for advertisers to purchase ad slots
- Approval workflow for admins to review and manage bookings
- Performance metrics and analytics
- Real-time notifications

## Tech Stack

- React with TypeScript
- TailwindCSS for styling
- shadcn/ui for UI components
- Supabase for backend (authentication, database, storage)
- React Router for navigation
- TanStack Query for data fetching and state management
- Recharts for data visualization

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`

## Supabase Configuration

This project uses Supabase for authentication, database, and storage. The following tables are used:

- profiles - User profiles with role information
- channels - TV channels
- ad_slots - Available advertising slots
- ads - Advertiser's ad creatives
- bookings - Bookings of ad slots
- performance_metrics - Analytics data for ads
- notifications - System notifications

Row Level Security (RLS) policies are configured to ensure data security.
