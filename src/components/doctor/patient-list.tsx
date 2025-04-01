// src/components/doctor/patient-list.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define patient interface
interface Patient {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  medical_conditions?: string[];
  medications?: string[];
  last_analysis_date?: string;
  last_ahi?: number | string | null;
  severity?: string;
}

interface PatientListProps {
  patients?: Patient[];
  onPatientSelect: (patientId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients = [], 
  onPatientSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Format date consistently
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return 'Invalid date';
    }
  };
  
  // Sort and filter patients
  const filteredPatients = useMemo(() => {
    // First filter by search term
    const filtered = patients.filter(patient =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.severity && patient.severity.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Then sort by selected field
    return [...filtered].sort((a, b) => {
      // Handle different field types
      if (sortField === 'last_analysis_date') {
        const dateA = a.last_analysis_date ? new Date(a.last_analysis_date).getTime() : 0;
        const dateB = b.last_analysis_date ? new Date(b.last_analysis_date).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // For numeric fields
      if (sortField === 'age' || sortField === 'last_ahi') {
        const valA = a[sortField as keyof typeof a] || 0;
        const valB = b[sortField as keyof typeof b] || 0;
        return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      
      // For string fields (default)
      const valA = a[sortField as keyof typeof a] || '';
      const valB = b[sortField as keyof typeof b] || '';
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      return 0;
    });
  }, [patients, searchTerm, sortField, sortDirection]);
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get severity badge color
  const getSeverityBadge = (severity?: string) => {
    if (!severity) return <Badge variant="outline">Unknown</Badge>;
    
    switch (severity) {
      case 'Severe':
        return <Badge variant="outline" className="text-red-800 bg-red-100 border-red-200">Severe</Badge>;
      case 'Moderate':
        return <Badge variant="outline" className="text-orange-800 bg-orange-100 border-orange-200">Moderate</Badge>;
      case 'Mild':
        return <Badge variant="outline" className="text-yellow-800 bg-yellow-100 border-yellow-200">Mild</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  // Get status badge color based on severity
  const getStatusBadge = (severity?: string) => {
    if (!severity) return <Badge>Unknown</Badge>;
    
    switch (severity) {
      case 'Severe':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'Moderate':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'Mild':
        return <Badge className="bg-green-500">Stable</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Patient List</CardTitle>
          <div className="flex items-center mt-2 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patients..."
                className="w-full pl-8 pr-4"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('full_name')}>
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('age')}>
                  <div className="flex items-center">
                    Age/Gender
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('last_analysis_date')}>
                  <div className="flex items-center">
                    Last Analysis
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('last_ahi')}>
                  <div className="flex items-center">
                    AHI
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('severity')}>
                  <div className="flex items-center">
                    Severity
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('severity')}>
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    No patients found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>{patient.age || '—'} / {patient.gender || '—'}</TableCell>
                    <TableCell>{formatDate(patient.last_analysis_date)}</TableCell>
                    <TableCell className="font-medium">{
                      typeof patient.last_ahi === 'number' 
                        ? patient.last_ahi.toFixed(1) 
                        : (patient.last_ahi || '—')
                    }</TableCell>
                    <TableCell>{getSeverityBadge(patient.severity)}</TableCell>
                    <TableCell>
                      {/* This field isn't in the API, we're using a placeholder or could derive from other data */}
                      {getComplianceBadge(deriveCompliance(patient))}
                    </TableCell>
                    <TableCell>{getStatusBadge(patient.severity)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-8 h-8 p-0"
                        onClick={() => onPatientSelect(patient.id.toString())}
                      >
                        <span className="sr-only">View details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to derive compliance (since it's not in the API response)
function deriveCompliance(patient: Patient): string {
  // This is just a placeholder - in a real app, you'd have compliance data from the API
  // or derive it based on actual usage patterns
  if (!patient.severity) return 'Unknown';
  
  // Simple mock logic: set compliance based on severity as an example
  if (patient.severity === 'Severe') return 'Poor';
  if (patient.severity === 'Moderate') return 'Moderate';
  return 'Good';
}

// Helper function to generate compliance badge
function getComplianceBadge(compliance: string) {
  switch (compliance) {
    case 'Excellent':
      return <Badge variant="outline" className="text-green-800 bg-green-100 border-green-200">Excellent</Badge>;
    case 'Good':
      return <Badge variant="outline" className="text-blue-800 bg-blue-100 border-blue-200">Good</Badge>;
    case 'Moderate':
      return <Badge variant="outline" className="text-yellow-800 bg-yellow-100 border-yellow-200">Moderate</Badge>;
    case 'Poor':
      return <Badge variant="outline" className="text-red-800 bg-red-100 border-red-200">Poor</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default PatientList;