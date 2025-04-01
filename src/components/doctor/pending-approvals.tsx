"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { doctorService } from '@/lib/api';

// Make ahi optional and possibly a string in the interface
interface PendingApproval {
  id: number;
  patient_id: number;
  patient_name: string;
  age?: number;
  gender?: string;
  date: string;
  ahi: number | string | null;
  apnea_events: number;
  hypopnea_events: number;
  severity?: string;
  avg_oxygen?: number;
  lowest_oxygen?: number;
  created_at: string;
}

interface PendingApprovalsProps {
  pendingApprovals?: PendingApproval[];
  onPatientSelect: (patientId: string) => void;
  onApprovalUpdate?: () => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ 
  pendingApprovals = [], 
  onPatientSelect,
  onApprovalUpdate
}) => {
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Format dates consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return 'Invalid date';
    }
  };

  // Get classification badge color
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Handle approval submission
  const handleApprove = async (id: number) => {
    if (!doctorNotes.trim()) {
      setSubmitError('Please add notes before approving');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Call API to approve the analysis
      await doctorService.approveAnalysis(id, doctorNotes);
      
      // Reset form and notify parent component
      setSelectedApprovalId(null);
      setDoctorNotes('');
      if (onApprovalUpdate) {
        onApprovalUpdate();
      }
    } catch (error) {
      console.error('Error approving analysis:', error);
      setSubmitError('Failed to approve analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rejection
  const handleReject = async (id: number) => {
    if (!doctorNotes.trim()) {
      setSubmitError('Please add notes before rejecting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Call API to reject the analysis
      await doctorService.rejectAnalysis(id, doctorNotes);
      
      // Reset form and notify parent component
      setSelectedApprovalId(null);
      setDoctorNotes('');
      if (onApprovalUpdate) {
        onApprovalUpdate();
      }
    } catch (error) {
      console.error('Error rejecting analysis:', error);
      setSubmitError('Failed to reject analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select a patient for detailed view
  const handleViewPatient = (patientId: string) => {
    onPatientSelect(patientId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No pending approvals at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <Accordion 
                key={approval.id} 
                type="single" 
                collapsible
                value={selectedApprovalId === approval.id.toString() ? approval.id.toString() : undefined}
                onValueChange={(value) => setSelectedApprovalId(value.length ? value : null)}
              >
                <AccordionItem value={approval.id.toString()} className="p-1 border rounded-lg">
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium">{approval.patient_name}</h3>
                      <p className="text-sm text-gray-500">
                        {approval.age} years, {approval.gender} • Submitted: {formatDate(approval.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getClassificationColor(approval.severity || '')}>
                        {approval.severity || 'Unknown'}
                      </Badge>
                      <span className="text-sm font-semibold">
                        AHI: {typeof approval.ahi === 'number' ? approval.ahi.toFixed(1) : approval.ahi || 'N/A'}
                      </span>
                      <button 
                        onClick={() => {
                          // Toggle accordion
                          const newValue = selectedApprovalId === approval.id.toString() ? null : approval.id.toString();
                          setSelectedApprovalId(newValue);
                        }}
                        className="flex items-center justify-center w-10 h-10 p-0 rounded-full hover:bg-gray-100"
                      >
                        {selectedApprovalId === approval.id.toString() ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <AccordionContent>
                    <div className="px-2 py-4 mt-2 border-t">
                      <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-500">Apnea Events</p>
                          <p className="text-sm font-medium">{approval.apnea_events}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hypopnea Events</p>
                          <p className="text-sm font-medium">{approval.hypopnea_events}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg. O₂</p>
                          <p className="text-sm font-medium">{approval.avg_oxygen ? `${approval.avg_oxygen}%` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Lowest O₂</p>
                          <p className="text-sm font-medium">{approval.lowest_oxygen ? `${approval.lowest_oxygen}%` : 'N/A'}</p>
                        </div>
                      </div>
                      
                      {submitError && (
                        <div className="p-2 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded">
                          {submitError}
                        </div>
                      )}
                      
                      <Textarea
                        value={selectedApprovalId === approval.id.toString() ? doctorNotes : ''}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Add notes and recommendations for the patient..."
                        className="mb-4 min-h-20"
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="default" 
                          className="flex items-center gap-1" 
                          onClick={() => handleApprove(approval.id)}
                          disabled={isSubmitting}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {isSubmitting ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex items-center gap-1"
                          onClick={() => handleReject(approval.id)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="w-4 h-4" />
                          {isSubmitting ? 'Processing...' : 'Reject'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1 ml-auto"
                          onClick={() => handleViewPatient(approval.patient_id.toString())}
                        >
                          View Full History
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};