
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, User, KeyRound, Eye, EyeOff } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsEmailNotConfirmed(false);
    
    try {
      console.log('Attempting login with:', { email });
      const { success, errorMessage } = await login(email, password);
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed');
        if (errorMessage?.includes('Email not confirmed')) {
          setIsEmailNotConfirmed(true);
        } else {
          setError(errorMessage || 'Invalid email or password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error during login submission:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Card className="w-[380px] shadow-xl animate-fade-in bg-white/90 backdrop-blur-sm border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 animate-slide-in">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {isEmailNotConfirmed && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 animate-slide-in">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Email not confirmed</p>
                <p className="mt-1">Please check your inbox and confirm your email before logging in.</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 transition-all focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-9 transition-all focus:ring-2 focus:ring-primary/50"
                required
              />
              <button 
                type="button" 
                onClick={toggleShowPassword}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </span>
            )}
          </Button>
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
