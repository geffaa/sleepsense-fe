import React from 'react';
import { Metadata } from 'next';
import PatientDashboardWithApi from '@/components/patient-dashboard-with-api';

export const metadata: Metadata = {
  title: 'Patient Dashboard | SleepSense',
  description: 'Monitor your sleep patterns and get real-time analysis',
};

export default function DashboardPage() {
  return <PatientDashboardWithApi />
  // return <SafePatientDashboard />;
}