
import { supabase } from '@/integrations/supabase/client';

// Export supabase client for use in other services
export { supabase };

// Helper functions for common operations
export const handleError = (error: any, operation: string): never => {
  console.error(`Error ${operation}:`, error);
  throw error;
};
