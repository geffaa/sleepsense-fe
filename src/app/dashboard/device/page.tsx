import React from 'react';
import { Metadata } from 'next';
import DeviceManagementContent from '@/components/device/device-management';

export const metadata: Metadata = {
  title: 'Device Management | SleepSense',
  description: 'Manage your SleepSense monitoring device and sensor settings',
};

export default function DevicePage() {
  return <DeviceManagementContent />;
}