import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="doctor">
      {children}
    </ProtectedRoute>
  );
}