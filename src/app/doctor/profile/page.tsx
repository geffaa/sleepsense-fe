import React from 'react';
import { Metadata } from 'next';
import DoctorProfileContent from '@/components/profile/doctor-profile';

export const metadata: Metadata = {
  title: 'Edit Profile | SleepSense',
  description: 'Manage your SleepSense doctor account and professional information',
};

export default function DoctorProfilePage() {
  return <DoctorProfileContent />;
}