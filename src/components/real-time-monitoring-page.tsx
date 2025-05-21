"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonitoringSection from '@/components/updated-monitoring-section';
import DeviceStatusCard from '@/components/dashboard/device-status-card';
import AnalysisResultsCard from '@/components/dashboard/analysis-results-card';
import DoctorApprovalCard from '@/components/dashboard/doctor-approval-card';
import { useMqttConnection } from '@/lib/mqtt-service';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/api';
import { mockAnalysisResults, mockDoctorApproval } from '@/lib/mock-data';

// Define proper device interface
interface Device {
  id: number;
  serial_number: string;
  patient_id?: number;
  firmware_version?: string;
  last_sync?: string;
  battery_level?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

const RealTimeMonitoringPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('10m');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('monitor');
  
  // Use MQTT connection for selected device
  const mqtt = useMqttConnection(selectedDeviceId);
  
  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await patientService.getProfile();
        setDevices(response.devices || []);
        
        // Select the first device by default
        if (response.devices && response.devices.length > 0) {
          setSelectedDeviceId(response.devices[0].serial_number);
        }
        
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load device information. Using default device for testing.');
        setSelectedDeviceId('SS-2025-X1-28934'); // Default device ID for testing
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDevices();
    } else {
      setLoading(false);
      setSelectedDeviceId('SS-2025-X1-28934'); // Default device ID for testing
    }
  }, [user]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };
  
  // Get device status from MQTT
  const deviceStatus = mqtt.getDeviceStatus();
  
  return (
    <DashboardLayout userRole="patient">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Real-time Monitoring</h1>
        <p className="text-gray-600">Monitor your sleep patterns in real-time with MQTT data</p>
      </div>
      
      {error && (
        <Alert className="mb-6 text-amber-800 border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="monitor">Real-time Monitoring</TabsTrigger>
            <TabsTrigger value="test">Test MQTT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitor" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Monitoring Device: {selectedDeviceId}</h2>
              
              {devices.length > 1 && (
                <select 
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  {devices.map(device => (
                    <option key={device.id} value={device.serial_number}>
                      {device.serial_number}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <MonitoringSection 
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              deviceSerialNumber={selectedDeviceId}
            />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnalysisResultsCard results={mockAnalysisResults} />
              <div className="grid grid-cols-1 gap-6">
                <DeviceStatusCard 
                  deviceStatus={{
                    battery: {
                      level: deviceStatus.battery_level,
                      charging: false,
                    },
                    connectivity: {
                      status: deviceStatus.isConnected ? 'connected' : 'disconnected',
                      signal: 85,
                    },
                    sensors: {
                      ecg: true,
                      oxygenSensor: true,
                      thoracicSensor: true,
                      breathingSensor: true,
                    },
                    lastSync: new Date().toISOString(),
                  }}
                />
                <DoctorApprovalCard approval={mockDoctorApproval} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>MQTT Test Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-500">
                  This panel lets you test sending data to the MQTT broker. Use it to simulate device data for development and testing purposes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default RealTimeMonitoringPage;