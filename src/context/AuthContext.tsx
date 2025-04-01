"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';

type User = {
  id: number;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor';
  profileId: number | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; fullName: string; role: string }) => Promise<void>;
};

// Create auth context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            const { user } = await authService.getMe();
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { token, user } = await authService.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setUser(user);
      
      // Redirect based on user role
      if (user.role === 'patient') {
        router.push('/dashboard');
      } else {
        router.push('/doctor');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    
    // Show loading indicator during logout
    setLoading(true);
    
    // Add a small delay to show loading effect
    setTimeout(() => {
      router.push('/login');
      setLoading(false);
    }, 500);
  };

  const register = async (userData: { email: string; password: string; fullName: string; role: string }) => {
    try {
      setLoading(true);
      await authService.register(userData);
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // The context value that will be provided to consumers
  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};