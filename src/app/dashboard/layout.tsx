import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="patient">
      {children}
    </ProtectedRoute>
  );
}