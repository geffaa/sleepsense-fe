import React from 'react';
import { Metadata } from 'next';
import DoctorDashboardWithApi from '@/components/doctor-dashboard-with-api';

export const metadata: Metadata = {
  title: 'Doctor Dashboard | SleepSense',
  description: 'Monitor your patients and manage sleep apnea cases',
};

export default function DoctorPage() {
  return <DoctorDashboardWithApi />;
  // return <DoctorDashboard />;
}