"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfoCard from '@/components/dashboard/info-card';
import PatientList from '@/components/doctor/patient-list';
import PatientAnalysisDetails from '@/components/doctor/patient-analysis-details';
import { PendingApprovals } from '@/components/doctor/pending-approvals';

export default function DoctorDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Mock data for doctor dashboard
  const doctorStats = {
    totalPatients: 28,
    pendingApprovals: 5,
    criticalCases: 3
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  return (
    <DashboardLayout userRole="doctor">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-600">Monitor patients and analyze sleep apnea data</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <InfoCard 
          title="Total Patients" 
          value={doctorStats.totalPatients.toString()}
          description="Patients under your care"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="blue"
        />
        <InfoCard 
          title="Pending Approvals" 
          value={doctorStats.pendingApprovals.toString()}
          description="Reports waiting for your review"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="amber"
        />
        <InfoCard 
          title="Critical Cases" 
          value={doctorStats.criticalCases.toString()}
          description="Patients requiring immediate attention"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="red"
        />
      </div>

      <Tabs defaultValue="pendingApprovals" className="mb-6">
        <TabsList>
          <TabsTrigger value="pendingApprovals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="patients">Patient List</TabsTrigger>
          {selectedPatientId && <TabsTrigger value="patientDetails">Patient Details</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="pendingApprovals">
          <PendingApprovals onPatientSelect={handlePatientSelect} />
        </TabsContent>
        
        <TabsContent value="patients">
          <PatientList onPatientSelect={handlePatientSelect} />
        </TabsContent>
        
        {selectedPatientId && (
          <TabsContent value="patientDetails">
            <PatientAnalysisDetails patientId={selectedPatientId} />
          </TabsContent>
        )}
      </Tabs>
    </DashboardLayout>
  );
}