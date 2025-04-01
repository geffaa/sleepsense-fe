"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Import the mock data component as fallback
import PatientDashboard from '@/components/patient-dashboard';

// Dynamically import the API-connected dashboard with no SSR
const PatientDashboardWithApi = dynamic(
  () => import('@/components/patient-dashboard-with-api'),
  { 
    ssr: false,
    loading: () => <Loading />
  }
);

// Loading component
function Loading() {
  return (
    <DashboardLayout userRole="patient">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </DashboardLayout>
  );
}

export default function SafePatientDashboard() {
  const { user } = useAuth();
  const [useApiDashboard, setUseApiDashboard] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we can connect to the API
    const checkApiConnection = async () => {
      try {
        if (process.env.NEXT_PUBLIC_API_URL) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`);
          if (response.ok) {
            setUseApiDashboard(true);
          } else {
            throw new Error('API connection failed');
          }
        } else {
          // No API URL configured, fallback to mock
          throw new Error('No API URL configured');
        }
      } catch (error) {
        console.warn('Using mock data due to API connection issue:', error);
        setApiError('Could not connect to the API server. Using mock data instead.');
        setUseApiDashboard(false);
      }
    };

    checkApiConnection();
  }, []);

  if (!user) {
    return <Loading />;
  }

  // If API connection failed, show mock dashboard with warning
  if (!useApiDashboard) {
    return (
      <>
        {apiError && (
          <div className="fixed top-0 left-0 right-0 z-50 p-4 border-b bg-amber-50 border-amber-200">
            <Alert className="mb-0 text-amber-800 bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          </div>
        )}
        <PatientDashboard />
      </>
    );
  }

  // If API connection succeeded, show the API-connected dashboard
  return <PatientDashboardWithApi />;
}