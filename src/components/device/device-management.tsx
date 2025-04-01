"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Battery, Wifi, Bluetooth, RefreshCw, Download, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/api';
import DeviceStatusCard from '@/components/dashboard/device-status-card';
import { Skeleton } from '@/components/ui/skeleton';

// Define device type
interface Device {
  id: number;
  serial_number: string;
  firmware_version?: string;
  last_sync?: string;
  battery_level?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

const DeviceManagementContent: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await patientService.getProfile();
        setDevices(response.devices || []);
        
        if (response.devices && response.devices.length > 0) {
          setActiveDevice(response.devices[0]);
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load device information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user]);

  // Function to refresh device status
  const refreshDeviceStatus = async () => {
    if (!activeDevice) return;
    
    try {
      setRefreshingStatus(true);
      
      const response = await patientService.getDeviceStatus(activeDevice.id);
      
      // Update devices list
      setDevices(prev => 
        prev.map(d => d.id === response.device.id ? response.device : d)
      );
      
      // Update active device
      setActiveDevice(response.device);
      
    } catch (err) {
      console.error('Error refreshing device status:', err);
      setError('Failed to refresh device status. Please try again later.');
    } finally {
      setRefreshingStatus(false);
    }
  };

  // Convert device data to format expected by DeviceStatusCard
  const getDeviceStatusData = (device: Device) => {
    return {
      battery: {
        level: device.battery_level || 0,
        charging: false,
      },
      connectivity: {
        status: device.status === 'active' ? 'connected' as const : 'disconnected' as const,
        signal: 75, // This data might not be available from API
      },
      sensors: {
        ecg: true,
        oxygenSensor: true,
        thoracicSensor: true,
        breathingSensor: true,
      },
      lastSync: device.last_sync || new Date().toISOString(),
    };
  };

  if (loading) {
    return (
      <DashboardLayout userRole="patient">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
          <p className="text-gray-600">Manage your SleepSense monitoring device</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="patient">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        <p className="text-gray-600">Manage your SleepSense monitoring device</p>
      </div>

      {error && (
        <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {devices.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Devices Found</CardTitle>
            <CardDescription>
              You dont have any SleepSense devices registered to your account yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              To get started with sleep monitoring, please contact your healthcare provider 
              to receive a SleepSense device or register your existing device.
            </p>
            <Button>Register New Device</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Device Status Card */}
          <div>
            {activeDevice && (
              <DeviceStatusCard deviceStatus={getDeviceStatusData(activeDevice)} />
            )}
            
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Device Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="flex items-center w-full gap-2"
                  onClick={refreshDeviceStatus}
                  disabled={refreshingStatus}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingStatus ? 'animate-spin' : ''}`} />
                  {refreshingStatus ? 'Refreshing...' : 'Refresh Status'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Update Firmware
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center w-full gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Device Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center w-full gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Troubleshooting
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Device Details and Settings */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="calibration">Calibration</TabsTrigger>
                <TabsTrigger value="usage">Usage Guide</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Information</CardTitle>
                    <CardDescription>Technical details about your SleepSense device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeDevice && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Serial Number</h3>
                            <p className="mt-1 font-mono text-gray-800">{activeDevice.serial_number}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Firmware Version</h3>
                            <p className="mt-1 font-mono text-gray-800">{activeDevice.firmware_version || 'Unknown'}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Last Synced</h3>
                            <p className="mt-1 text-gray-800">
                              {activeDevice.last_sync 
                                ? new Date(activeDevice.last_sync).toLocaleString() 
                                : 'Never synced'}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Status</h3>
                            <p className="mt-1 text-gray-800">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${activeDevice.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'}`}>
                                {activeDevice.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="mb-2 text-sm font-medium text-gray-500">Device Specifications</h3>
                          <ul className="pl-5 space-y-1 text-sm text-gray-600 list-disc">
                            <li>ECG Sensor - 250Hz sampling rate</li>
                            <li>Oxygen Saturation - ±2% accuracy</li>
                            <li>Thoracic Movement - 3-axis accelerometer</li>
                            <li>Breathing Sensor - Airflow and respiration tracking</li>
                            <li>Battery - 12+ hours continuous operation</li>
                            <li>Wireless - Bluetooth 5.0 + Wi-Fi</li>
                          </ul>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="mb-2 text-sm font-medium text-gray-500">Connectivity</h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Wifi className="w-5 h-5 text-blue-500" />
                              <span className="text-sm text-gray-700">Wi-Fi Connected</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bluetooth className="w-5 h-5 text-blue-500" />
                              <span className="text-sm text-gray-700">Bluetooth Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Battery className="w-5 h-5 text-green-500" />
                              <span className="text-sm text-gray-700">{activeDevice.battery_level || 0}% Battery</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Settings</CardTitle>
                    <CardDescription>Configure your SleepSense device settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      This feature will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="calibration">
                <Card>
                  <CardHeader>
                    <CardTitle>Sensor Calibration</CardTitle>
                    <CardDescription>Calibrate your device sensors for optimal performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      This feature will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="usage">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Guide</CardTitle>
                    <CardDescription>How to properly use your SleepSense device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 text-lg font-medium">Getting Started</h3>
                        <p className="text-gray-600">
                          Your SleepSense device is designed to be easy to use while providing
                          precise measurements of your sleep patterns. Follow these simple steps
                          to get started:
                        </p>
                        <ol className="pl-6 mt-2 space-y-2 text-gray-600 list-decimal">
                          <li>Ensure device is fully charged before use</li>
                          <li>Power on device by pressing the power button for 3 seconds</li>
                          <li>Position the device according to the placement guide</li>
                          <li>Use the SleepSense app to start monitoring</li>
                          <li>Sleep as you normally would</li>
                        </ol>
                      </div>
                      
                      <div>
                        <h3 className="mb-2 text-lg font-medium">Proper Placement</h3>
                        <p className="text-gray-600">
                          For best results, place the sensors as follows:
                        </p>
                        <ul className="pl-6 mt-2 space-y-2 text-gray-600 list-disc">
                          <li>ECG sensor: Attach to upper chest</li>
                          <li>Oxygen sensor: Clip to index finger</li>
                          <li>Thoracic sensor: Secure around chest</li>
                          <li>Breathing sensor: Position under nose</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="mb-2 text-lg font-medium">Troubleshooting</h3>
                        <p className="text-gray-600">
                          If you experience any issues with your device:
                        </p>
                        <ul className="pl-6 mt-2 space-y-2 text-gray-600 list-disc">
                          <li>Check battery level and charge if necessary</li>
                          <li>Ensure sensors are properly attached</li>
                          <li>Verify Wi-Fi or Bluetooth connection</li>
                          <li>Restart the device by holding power button for 10 seconds</li>
                          <li>Contact support if problems persist</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeviceManagementContent;