
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { login as loginApi, register as registerApi } from '@/services/mockApi';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Improved user session persistence with better error handling
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Validate that the parsed object has the expected structure
          if (parsedUser && 
              typeof parsedUser === 'object' && 
              'id' in parsedUser && 
              'name' in parsedUser && 
              'email' in parsedUser && 
              'role' in parsedUser) {
            setUser(parsedUser);
            console.log('User loaded from localStorage:', parsedUser);
          } else {
            console.error('Invalid user data structure in localStorage');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await loginApi(email, password);
      if (user) {
        // Ensure we're setting the user in state AND localStorage
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User logged in and stored in localStorage:', user);
        
        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const newUser = await registerApi(email, password, name, role);
      if (newUser) {
        // Ensure we're setting the user in state AND localStorage
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('User registered and stored in localStorage:', newUser);
        
        toast({
          title: "Registration successful!",
          description: `Welcome to Adversify, ${newUser.name}!`,
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
