import React from 'react';
import { Metadata } from 'next';
import PatientProfileContent from '@/components/profile/patient-profile';

export const metadata: Metadata = {
  title: 'Edit Profile | SleepSense',
  description: 'Manage your SleepSense account and personal information',
};

export default function PatientProfilePage() {
  return <PatientProfileContent />;
}