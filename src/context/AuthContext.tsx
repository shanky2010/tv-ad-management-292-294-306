import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; errorMessage?: string }>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Setup auth state listener and session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          // Fetch user profile from our profiles table
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (profile) {
              const userData: User = {
                id: currentSession.user.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,
                avatar: profile.avatar || undefined,
                company: profile.company || undefined, 
                phone: profile.phone || undefined
              };
              
              setUser(userData);
              console.log('User profile loaded:', userData);
            } else {
              setUser(null);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Fetch user profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              setUser(null);
              setIsLoading(false);
              return;
            }
            
            if (profile) {
              const userData: User = {
                id: currentSession.user.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,
                avatar: profile.avatar || undefined,
                company: profile.company || undefined,
                phone: profile.phone || undefined
              };
              
              setUser(userData);
              console.log('Initial user profile loaded:', userData);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, errorMessage: error.message };
      }
      
      if (data.user) {
        toast({
          title: "Login successful!",
          description: `Welcome back!`,
        });
        return { success: true };
      }
      
      return { success: false, errorMessage: "Unknown error occurred" };
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, errorMessage: "An unexpected error occurred" };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error.message);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Registration successful!",
          description: `Welcome to Adversify!`,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error.message);
      toast({
        title: "Logout error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
