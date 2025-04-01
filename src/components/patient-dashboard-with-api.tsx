"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MonitoringSection from '@/components/dashboard/monitoring-section';
import AnalysisResultsCard from '@/components/dashboard/analysis-results-card';
import DeviceStatusCard from '@/components/dashboard/device-status-card';
import DoctorApprovalCard from '@/components/dashboard/doctor-approval-card';
import HistoryCard from '@/components/dashboard/history-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfoCard from '@/components/dashboard/info-card';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import mock data functions for the real-time portions that aren't from API
import { 
  getRealtimeSensorUpdate 
} from '@/lib/mock-data';

// Define some types to match the API response structure
// Define interfaces to match the API response types
interface PatientProfile {
  id: number;
  user_id?: number; // Made optional since it might be missing in response
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  medical_conditions?: string[];
  medications?: string[];
  doctor_id?: number;
  created_at: string;
  updated_at: string;
}

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

interface SleepHistoryItem {
  id: number;
  date: string;
  sleep_duration?: number;
  sleep_quality?: number;
  ahi?: number;
  apnea_events?: number;
  hypopnea_events?: number;
  lowest_oxygen?: number;
  avg_oxygen?: number;
  severity?: string;
  analysis_status?: string;
  doctor_notes?: string;
  reviewed_at?: string;
  total_events?: number;
}

export default function PatientDashboardWithApi() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [sleepHistory, setSleepHistory] = useState<SleepHistoryItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  interface SleepEvent {
    id: string;
    type: 'apnea' | 'hypopnea' | 'normal';
    timestamp: string;
    duration: number;
    oxygenDrop: number;
    severity: 'mild' | 'moderate' | 'severe';
    confidence: number;
  }

  // Define proper types for analysis and doctor approval
  interface AnalysisResults {
    summary: {
      totalEvents: number;
      apneaEvents: number;
      hypopneaEvents: number;
      ahi: number;
      avgDuration: number;
      avgOxygenDrop: number;
      classification: string;
    };
    events: SleepEvent[]; // Now properly typed
  }

  interface DoctorApproval {
    status: 'Pending' | 'Approved' | 'Rejected';
    doctorName: string;
    timestamp: string | null;
    notes: string;
  }

  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResults | null>(null);
  const [doctorApproval, setDoctorApproval] = useState<DoctorApproval>({
    status: 'Pending',
    doctorName: '',
    timestamp: null,
    notes: '',
  });
  
  // State for info cards
  const [sleepQuality, setSleepQuality] = useState(85);
  const [apneaEvents, setApneaEvents] = useState(3);
  const [oxygenSaturation, setOxygenSaturation] = useState(96);
  const [apneaEventTrend, setApneaEventTrend] = useState<'up' | 'down' | 'stable'>('down');
  
  // Fetch patient profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await patientService.getProfile();
        // Create a patient profile with all required fields
        const patientData: PatientProfile = {
          ...response.patient,
          user_id: user?.id || 0 // Use the authenticated user's ID if user_id is missing
        };
        setProfile(patientData);
        setDevices(response.devices || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);
  
  // Fetch sleep history data
  useEffect(() => {
    const fetchSleepHistory = async () => {
      try {
        const response = await patientService.getSleepHistory(30, 0);
        setSleepHistory(response.sleepHistory || []);
        
        // Set latest analysis if available
        if (response.sleepHistory && response.sleepHistory.length > 0) {
          const latest = response.sleepHistory[0];
          
          // Transform the data to match what the AnalysisResultsCard expects
          const analysisData: AnalysisResults = {
            summary: {
              totalEvents: latest.total_events || 0,
              apneaEvents: latest.apnea_events || 0,
              hypopneaEvents: latest.hypopnea_events || 0,
              ahi: latest.ahi || 0,
              avgDuration: 18.6, // This data might not be available from API, using placeholder
              avgOxygenDrop: 4.2, // This data might not be available from API, using placeholder
              classification: latest.severity || 'Mild',
            },
            events: [] // We would need to fetch sleep events separately
          };
          
          setLatestAnalysis(analysisData);
          
          // Set doctor approval data if available
          if (latest.analysis_status) {
            const approvalStatus: 'Pending' | 'Approved' | 'Rejected' = 
              latest.analysis_status === 'approved' ? 'Approved' : 
              latest.analysis_status === 'rejected' ? 'Rejected' : 'Pending';
              
            setDoctorApproval({
              status: approvalStatus,
              doctorName: 'Dr. Sarah Johnson', // This might not be available in API response
              timestamp: latest.reviewed_at || null,
              notes: latest.doctor_notes || '',
            });
          }
          
          // Update the sleep quality based on data
          if (latest.sleep_quality) {
            setSleepQuality(latest.sleep_quality);
          }
          
          // Update apnea events
          if (latest.apnea_events !== undefined) {
            setApneaEvents(latest.apnea_events);
            
            // Update trend based on previous data
            if (response.sleepHistory.length > 1) {
              const previousEvents = response.sleepHistory[1].apnea_events || 0;
              if (latest.apnea_events < previousEvents) {
                setApneaEventTrend('down');
              } else if (latest.apnea_events > previousEvents) {
                setApneaEventTrend('up');
              } else {
                setApneaEventTrend('stable');
              }
            }
          }
          
          // Update oxygen saturation
          if (latest.avg_oxygen) {
            setOxygenSaturation(Math.round(latest.avg_oxygen));
          }
        }
      } catch (error) {
        console.error('Error fetching sleep history:', error);
        setError('Failed to load sleep history. Please try again later.');
      }
    };
    
    if (user) {
      fetchSleepHistory();
    }
  }, [user]);
  
  // Simulate real-time sensor updates
  useEffect(() => {
    // Only start simulating updates if we have a user and if we're not looking at real API data
    // This is where you would replace with WebSocket connection in a real implementation
    const shouldSimulate = !!user && (!devices.length || devices[0].status !== 'active');
    
    if (!shouldSimulate) return;
    
    console.log('Starting simulated sensor updates');
    const updateInterval = setInterval(() => {
      // Get latest sensor data
      const latestData = getRealtimeSensorUpdate();
      
      // Update oxygen saturation
      setOxygenSaturation(Math.round(latestData.oxygen));
      
      // Update sleep quality based on oxygen and apnea events
      if (latestData.hasApneaEvent) {
        setSleepQuality(prev => Math.max(70, prev - 1));
        
        // Increment apnea events occasionally
        if (Math.random() > 0.7) {
          setApneaEvents(prev => prev + 1);
          if (apneaEvents > 5) {
            setApneaEventTrend('up');
          }
        }
      } else {
        setSleepQuality(prev => Math.min(95, prev + (Math.random() > 0.7 ? 1 : 0)));
      }
    }, 5000); // Update every 5 seconds
    
    return () => {
      console.log('Stopping simulated sensor updates');
      clearInterval(updateInterval);
    };
  }, [user, devices, apneaEvents]);

  if (loading) {
    return (
      <DashboardLayout userRole="patient">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="patient">
        <div className="p-8">
          <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <button 
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="patient">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Sleep Monitoring Dashboard</h1>
        <p className="text-gray-600">
          {user ? `Welcome back, ${user.fullName}${profile ? ` (${profile.gender || 'Patient'}, ${profile.age || '--'} years)` : ''}` : 'Monitor your sleep patterns and get real-time analysis'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <InfoCard 
          title="Sleep Quality" 
          value={`${sleepQuality}%`}
          trend="up" 
          description="Last night's sleep quality score"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        />
        <InfoCard 
          title="Apnea Events" 
          value={apneaEvents.toString()}
          trend={apneaEventTrend}
          description={apneaEventTrend === 'down' ? "Detected last night (improved)" : "Detected last night (monitor closely)"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="amber"
        />
        <InfoCard 
          title="Avg. O₂ Saturation" 
          value={`${oxygenSaturation}%`}
          trend={oxygenSaturation >= 95 ? 'stable' : 'down'}
          description={oxygenSaturation >= 95 ? "Within normal range" : "Below optimal level"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          color={oxygenSaturation >= 95 ? "green" : "amber"}
        />
      </div>

      <Tabs defaultValue="realtime" className="mb-6">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="history">Sleep History</TabsTrigger>
          <TabsTrigger value="doctorApproval">Doctor Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="realtime" className="space-y-6">
          <MonitoringSection 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {latestAnalysis && <AnalysisResultsCard results={latestAnalysis} />}
            <div className="grid grid-cols-1 gap-6">
              {devices.length > 0 && (
                <DeviceStatusCard 
                  deviceStatus={{
                    battery: {
                      level: devices[0].battery_level || 62,
                      charging: false,
                    },
                    connectivity: {
                      status: devices[0].status === 'active' ? 'connected' : 'disconnected',
                      signal: 85,
                    },
                    sensors: {
                      ecg: true,
                      oxygenSensor: true,
                      thoracicSensor: true,
                      breathingSensor: true,
                    },
                    lastSync: devices[0].last_sync || new Date().toISOString(),
                  }} 
                />
              )}
              <DoctorApprovalCard approval={doctorApproval} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryCard 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            sleepHistory={sleepHistory}
            loading={loading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="doctorApproval">
          {/* Show doctor feedbacks from sleep history with approved status */}
          {sleepHistory
            .filter(item => item.analysis_status === 'approved')
            .map((item, index) => (
              <DoctorApprovalCard 
                key={index}
                approval={{
                  status: 'Approved',
                  doctorName: 'Dr. Sarah Johnson', // Using a placeholder name since doctor_name doesn't exist
                  timestamp: item.reviewed_at || null, // Add null fallback for undefined
                  notes: item.doctor_notes || 'No notes provided.',
                }} 
              />
            ))}
            
          {sleepHistory.filter(item => item.analysis_status === 'approved').length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No doctor feedback available yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}