"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface DeviceStatus {
  battery: {
    level: number;
    charging: boolean;
  };
  connectivity: {
    status: 'connected' | 'disconnected' | 'poor';
    signal: number;
  };
  sensors: {
    ecg: boolean;
    oxygenSensor: boolean;
    thoracicSensor: boolean;
    breathingSensor: boolean;
  };
  lastSync: string;
}

interface DeviceStatusCardProps {
  deviceStatus: DeviceStatus;
}

const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ deviceStatus }) => {
  const getBatteryIcon = () => {
    const { level, charging } = deviceStatus.battery;
    let color = 'text-green-500';
    
    if (level < 20) {
      color = 'text-red-500';
    } else if (level < 50) {
      color = 'text-yellow-500';
    }
    
    return (
      <div className="flex items-center">
        <Battery className={`h-5 w-5 ${color}`} />
        <span className="ml-1 text-sm">{level}%</span>
        {charging && (
          <svg className="w-3 h-3 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>
    );
  };

  const getConnectivityIcon = () => {
    const { status } = deviceStatus.connectivity;
    
    let color;
    if (status === 'connected') {
      color = 'text-green-500';
    } else if (status === 'poor') {
      color = 'text-yellow-500';
    } else {
      color = 'text-red-500';
    }
    
    return (
      <div className="flex items-center">
        <Wifi className={`h-5 w-5 ${color}`} />
        <span className="ml-1 text-sm">
          {status === 'connected' ? 'Connected' : status === 'poor' ? 'Poor Signal' : 'Disconnected'}
        </span>
      </div>
    );
  };

  const getSensorStatus = (isWorking: boolean, name: string) => {
    return (
      <div className="flex items-center">
        {isWorking ? (
          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
        )}
        <span className={`text-sm ${isWorking ? 'text-gray-700' : 'text-red-600'}`}>
          {name} {isWorking ? 'OK' : 'Error'}
        </span>
      </div>
    );
  };

  // Format date consistently for both server and client
  const formatDate = (dateString: string) => {
    try {
      // Use a consistent format that won't change between server and client
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Device Status</CardTitle>
        <CardDescription>SleepSense monitoring device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Battery</p>
            {getBatteryIcon()}
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-500">Connectivity</p>
            {getConnectivityIcon()}
          </div>
        </div>
        
        <div>
          <p className="mb-2 text-sm text-gray-500">Sensors</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {getSensorStatus(deviceStatus.sensors.ecg, 'ECG')}
            {getSensorStatus(deviceStatus.sensors.oxygenSensor, 'Oxygen')}
            {getSensorStatus(deviceStatus.sensors.thoracicSensor, 'Thoracic')}
            {getSensorStatus(deviceStatus.sensors.breathingSensor, 'Breathing')}
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            Last synchronized: {formatDate(deviceStatus.lastSync)}
          </p>
          <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
            Reconnect device
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusCard;