
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for demo purposes
// In a real app, this would connect to a backend auth system
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for user session
    const savedUser = localStorage.getItem('qr-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('qr-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call - in a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demonstration
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem('qr-user', JSON.stringify(mockUser));
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        name: name || email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem('qr-user', JSON.stringify(mockUser));
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      console.error('Signup failed', error);
      toast({
        title: "Signup failed",
        description: "There was an error creating your account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qr-user');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
