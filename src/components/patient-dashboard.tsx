"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MonitoringSection from '@/components/dashboard/monitoring-section';
import AnalysisResultsCard from '@/components/dashboard/analysis-results-card';
import DeviceStatusCard from '@/components/dashboard/device-status-card';
import DoctorApprovalCard from '@/components/dashboard/doctor-approval-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfoCard from '@/components/dashboard/info-card';
import HistoryCard from '@/components/dashboard/history-card';

// Import data dari mock-data
import { 
  mockAnalysisResults, 
  mockDeviceStatus, 
  mockDoctorApproval, 
  getRealtimeSensorUpdate 
} from '@/lib/mock-data';

export default function PatientDashboard() {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State untuk memperbarui info cards
  const [sleepQuality, setSleepQuality] = useState(85);
  const [apneaEvents, setApneaEvents] = useState(3);
  const [oxygenSaturation, setOxygenSaturation] = useState(96);
  const [apneaEventTrend, setApneaEventTrend] = useState<'up' | 'down' | 'stable'>('down');
  
  // Simulasi pembaruan data real-time untuk kartu info
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Dapatkan data sensor terbaru
      const latestData = getRealtimeSensorUpdate();
      
      // Update saturasi oksigen berdasarkan data terakhir
      setOxygenSaturation(Math.round(latestData.oxygen));
      
      // Simulasi perubahan kualitas tidur berdasarkan oksigen dan apnea
      if (latestData.hasApneaEvent) {
        setSleepQuality(prev => Math.max(70, prev - 1));
        
        // Menambah perhitungan apnea jika terdeteksi
        if (Math.random() > 0.7) {
          setApneaEvents(prev => prev + 1);
          // Update trend berdasarkan pola
          if (apneaEvents > 5) {
            setApneaEventTrend('up');
          }
        }
      } else {
        setSleepQuality(prev => Math.min(95, prev + (Math.random() > 0.7 ? 1 : 0)));
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(updateInterval);
  }, [apneaEvents]);

  return (
    <DashboardLayout userRole="patient">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Sleep Monitoring Dashboard</h1>
        <p className="text-gray-600">Monitor your sleep patterns and get real-time analysis</p>
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
            <AnalysisResultsCard results={mockAnalysisResults} />
            <div className="grid grid-cols-1 gap-6">
              <DeviceStatusCard deviceStatus={mockDeviceStatus} />
              <DoctorApprovalCard approval={mockDoctorApproval} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryCard 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>
        
        <TabsContent value="doctorApproval">
          <Card>
            <CardHeader>
              <CardTitle>Doctors Feedback & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Show all doctor approvals and notes */}
                <DoctorApprovalCard approval={{
                  status: 'Approved',
                  doctorName: 'Dr. Sarah Johnson',
                  timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                  notes: 'Your sleep patterns show improvement with the CPAP therapy. Continue using the device as prescribed. I recommend maintaining a regular sleep schedule and avoiding caffeine after 2 PM. Schedule a follow-up in 3 months.',
                }} />
                
                <DoctorApprovalCard approval={{
                  status: 'Approved',
                  doctorName: 'Dr. Sarah Johnson',
                  timestamp: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
                  notes: 'Initial assessment shows mild to moderate sleep apnea. I recommend starting CPAP therapy at 8cm H2O pressure. Please schedule an in-person consultation to discuss treatment options in detail.',
                }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}