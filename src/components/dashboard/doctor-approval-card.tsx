"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DoctorApproval {
  status: 'Pending' | 'Approved' | 'Rejected';
  doctorName: string;
  timestamp: string | null;
  notes: string;
}

interface DoctorApprovalCardProps {
  approval: DoctorApproval;
}

const DoctorApprovalCard: React.FC<DoctorApprovalCardProps> = ({ approval }) => {
  // Helper to get status icon and color
  const getStatusInfo = () => {
    switch (approval.status) {
      case 'Approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'Rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'Pending':
      default:
        return {
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
    }
  };

  // Format date consistently for both server and client
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    try {
      // Use a consistent format that won't change between server and client
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return 'Invalid date';
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Medical Review</CardTitle>
        <CardDescription>Doctors assessment of your sleep data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center p-3 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
          {statusInfo.icon}
          <div className="ml-3">
            <p className={`font-medium ${statusInfo.color}`}>
              {approval.status}
            </p>
            <p className="text-sm text-gray-600">
              {approval.status === 'Pending' 
                ? 'Waiting for doctors review' 
                : `Reviewed by ${approval.doctorName}`
              }
            </p>
            {approval.timestamp && (
              <p className="text-xs text-gray-500">
                {formatDate(approval.timestamp)}
              </p>
            )}
          </div>
        </div>

        {(approval.status === 'Approved' || approval.status === 'Rejected') && approval.notes && (
          <div className="pt-3 border-t">
            <p className="mb-2 text-sm font-medium text-gray-700">Doctors Notes:</p>
            <div className="p-3 text-sm text-gray-700 rounded-lg bg-gray-50">
              {approval.notes}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pt-3 border-t sm:flex-row">
          <Button className="flex items-center w-full gap-1 sm:w-auto">
            <MessageSquare className="w-4 h-4" />
            Contact Doctor
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Download Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorApprovalCard;