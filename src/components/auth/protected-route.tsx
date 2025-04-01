"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is logged in, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
    
    // If a specific role is required and user doesn't have it, redirect
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      if (user.role === 'patient') {
        router.push('/dashboard');
      } else {
        router.push('/doctor');
      }
    }
  }, [user, loading, router, requiredRole]);

  // Show nothing while loading or redirecting
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If a specific role is required and user doesn't have it, show nothing (redirecting)
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If user is logged in and has the required role (or no specific role is required), show children
  return <>{children}</>;
};

export default ProtectedRoute;