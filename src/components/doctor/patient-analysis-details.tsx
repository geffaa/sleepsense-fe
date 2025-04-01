"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Download, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { doctorService } from '@/lib/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

// Define interfaces for our data
interface SleepHistoryItem {
  id: number;
  date: string;
  sleep_duration?: number;
  sleep_quality?: number;
  ahi?: number | string | null;
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
}

interface PatientDetails {
  patient: Patient;
  sleepHistory: SleepHistoryItem[];
}

interface PatientAnalysisDetailsProps {
  patientId: string;
}

const PatientAnalysisDetails: React.FC<PatientAnalysisDetailsProps> = ({ patientId }) => {
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(0);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load patient details from API
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await doctorService.getPatientDetails(Number(patientId));
        setPatientDetails(response);
        
        // If there's doctor notes in the first analysis, pre-populate the text area
        if (response.sleepHistory && response.sleepHistory.length > 0 && response.sleepHistory[0].doctor_notes) {
          setDoctorNotes(response.sleepHistory[0].doctor_notes);
        }
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);
  
  // Create calculated trends from sleep history
  const generateTrendsFromHistory = (history: SleepHistoryItem[]) => {
    if (!history || history.length === 0) return null;
    
    const trends = {
      ahi: history.map(item => ({
        month: formatShortDate(item.date),
        value: typeof item.ahi === 'number' ? item.ahi : 
               typeof item.ahi === 'string' ? parseFloat(item.ahi) : 0
      })).reverse(),
      
      oxygen: history.map(item => ({
        month: formatShortDate(item.date),
        value: item.avg_oxygen || 95
      })).reverse(),
      
      sleepQuality: history.map(item => ({
        month: formatShortDate(item.date),
        value: item.sleep_quality || 70
      })).reverse(),
      
      apneaEvents: history.map(item => ({
        month: formatShortDate(item.date),
        value: item.apnea_events || 0
      })).reverse()
    };
    
    return trends;
  };
  
  // Format date consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return 'Invalid date';
    }
  };
  
  // Format short date (month only)
  const formatShortDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[date.getMonth()];
    } catch {
      return '';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Approved</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            <span>Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };
  
  // Get severity badge color
  const getSeverityBadge = (severity?: string) => {
    if (!severity) return <Badge variant="outline">Unknown</Badge>;
    
    switch (severity.toLowerCase()) {
      case 'severe':
        return <Badge variant="outline" className="text-red-800 bg-red-100 border-red-200">{severity}</Badge>;
      case 'moderate':
        return <Badge variant="outline" className="text-orange-800 bg-orange-100 border-orange-200">{severity}</Badge>;
      case 'mild':
        return <Badge variant="outline" className="text-yellow-800 bg-yellow-100 border-yellow-200">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  // Handle approval submission
  const handleApprove = async () => {
    if (!patientDetails?.sleepHistory[selectedAnalysisIndex]) return;
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      const analysisId = patientDetails.sleepHistory[selectedAnalysisIndex].id;
      await doctorService.approveAnalysis(analysisId, doctorNotes);
      
      // Update the local state to reflect the change
      const updatedHistory = [...patientDetails.sleepHistory];
      updatedHistory[selectedAnalysisIndex] = {
        ...updatedHistory[selectedAnalysisIndex],
        analysis_status: 'approved',
        doctor_notes: doctorNotes,
        reviewed_at: new Date().toISOString()
      };
      
      setPatientDetails({
        ...patientDetails,
        sleepHistory: updatedHistory
      });
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error approving analysis:', error);
      setError('Failed to approve analysis. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle rejection submission
  const handleReject = async () => {
    if (!patientDetails?.sleepHistory[selectedAnalysisIndex]) return;
    
    // Require notes for rejection
    if (!doctorNotes.trim()) {
      setError('Please provide notes explaining the rejection reason.');
      return;
    }
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      const analysisId = patientDetails.sleepHistory[selectedAnalysisIndex].id;
      await doctorService.rejectAnalysis(analysisId, doctorNotes);
      
      // Update the local state to reflect the change
      const updatedHistory = [...patientDetails.sleepHistory];
      updatedHistory[selectedAnalysisIndex] = {
        ...updatedHistory[selectedAnalysisIndex],
        analysis_status: 'rejected',
        doctor_notes: doctorNotes,
        reviewed_at: new Date().toISOString()
      };
      
      setPatientDetails({
        ...patientDetails,
        sleepHistory: updatedHistory
      });
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error rejecting analysis:', error);
      setError('Failed to reject analysis. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle download report
  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF
    alert('This would download a PDF report in a real application.');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!patientDetails) {
    return <div>No patient data available.</div>;
  }

  const { patient, sleepHistory } = patientDetails;
  const selectedAnalysis = sleepHistory[selectedAnalysisIndex];
  const trends = generateTrendsFromHistory(sleepHistory);
  
  // Calculate BMI if height and weight are available
  const bmi = patient.height && patient.weight 
    ? (patient.weight / ((patient.height / 100) * (patient.height / 100))).toFixed(1) 
    : null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{patient.full_name}</CardTitle>
              <CardDescription>
                {patient.age} years, {patient.gender} • 
                {bmi && ` BMI: ${bmi} •`} 
                {patient.height && ` Height: ${patient.height}cm •`}
                {patient.weight && ` Weight: ${patient.weight}kg`}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-1 mt-2 sm:mt-0"
              onClick={handleDownloadReport}
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Medical Conditions</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {(patient.medical_conditions && patient.medical_conditions.length > 0) ? (
                  patient.medical_conditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">{condition}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">None recorded</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Medications</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {(patient.medications && patient.medications.length > 0) ? (
                  patient.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50">{medication}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">None recorded</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Analysis History</CardTitle>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <select
                className="p-1 text-sm border border-gray-200 rounded-md"
                value={selectedAnalysisIndex}
                onChange={(e) => {
                  setSelectedAnalysisIndex(parseInt(e.target.value));
                  // Update doctor notes when switching analysis
                  const newIndex = parseInt(e.target.value);
                  if (sleepHistory[newIndex]?.doctor_notes) {
                    setDoctorNotes(sleepHistory[newIndex].doctor_notes || '');
                  } else {
                    setDoctorNotes('');
                  }
                }}
              >
                {sleepHistory.map((analysis, index) => (
                  <option key={analysis.id} value={index}>
                    {formatDate(analysis.date)} - AHI: {typeof analysis.ahi === 'number' ? analysis.ahi.toFixed(1) : 
                                                       typeof analysis.ahi === 'string' ? parseFloat(analysis.ahi).toFixed(1) : 'N/A'}
                  </option>
                ))}
              </select>
              {selectedAnalysis && getStatusBadge(selectedAnalysis.analysis_status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Analysis Details</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="approval">Approval & Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {/* Analysis Overview */}
              <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-sm font-medium text-gray-500">AHI Score</h3>
                      <p className="mt-1 text-2xl font-bold">
                        {typeof selectedAnalysis?.ahi === 'number' ? selectedAnalysis.ahi.toFixed(1) : 
                         typeof selectedAnalysis?.ahi === 'string' ? parseFloat(selectedAnalysis.ahi).toFixed(1) : 'N/A'}
                      </p>
                      <div className="mt-1">{getSeverityBadge(selectedAnalysis?.severity)}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-sm font-medium text-gray-500">Sleep Events</h3>
                      <p className="mt-1 text-2xl font-bold">{selectedAnalysis?.total_events || 0}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Apnea: {selectedAnalysis?.apnea_events || 0} • 
                        Hypopnea: {selectedAnalysis?.hypopnea_events || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-sm font-medium text-gray-500">O₂ Saturation</h3>
                      <p className="mt-1 text-2xl font-bold">{selectedAnalysis?.avg_oxygen || 'N/A'}%</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Lowest: {selectedAnalysis?.lowest_oxygen || 'N/A'}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-sm font-medium text-gray-500">Sleep Quality</h3>
                      <p className="mt-1 text-2xl font-bold">{selectedAnalysis?.sleep_quality || 'N/A'}%</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Duration: {selectedAnalysis?.sleep_duration ? `${selectedAnalysis.sleep_duration} hours` : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Analysis Charts */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sleep Events Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Apnea', events: selectedAnalysis?.apnea_events || 0 },
                            { name: 'Hypopnea', events: selectedAnalysis?.hypopnea_events || 0 }
                          ]}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="events" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Oxygen Saturation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: 'Average', value: selectedAnalysis?.avg_oxygen || 95 },
                            { name: 'Lowest', value: selectedAnalysis?.lowest_oxygen || 90 }
                          ]}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[70, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Oxygen']} />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" activeDot={{ r: 8 }} />
                          <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              {trends ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AHI Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trends.ahi}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'AHI']} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Oxygen Saturation Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trends.oxygen}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[85, 100]} />
                            <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Avg. Saturation']} />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" activeDot={{ r: 8 }} />
                            <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sleep Quality Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trends.sleepQuality}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Quality']} />
                            <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Apnea Events Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trends.apneaEvents}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}`, 'Events']} />
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Not enough historical data to display trends.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approval">
              <div className="space-y-6">
                {saveSuccess && (
                  <Alert className="mb-6 text-green-800 border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription>Analysis status updated successfully.</AlertDescription>
                  </Alert>
                )}
                
                {selectedAnalysis?.analysis_status === 'pending' ? (
                  <div>
                    <h3 className="mb-2 font-medium">Provide Diagnosis & Recommendations</h3>
                    <Textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Enter your medical notes, diagnosis, and treatment recommendations..."
                      className="min-h-32"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        variant="default"
                        className="flex items-center gap-1"
                        onClick={handleApprove}
                        disabled={saving}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {saving ? 'Processing...' : 'Approve Report'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={handleReject}
                        disabled={saving || !doctorNotes.trim()}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {saving ? 'Processing...' : 'Mark as Concerning'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-2 font-medium">Doctors Notes</h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {selectedAnalysis?.doctor_notes ? (
                        <p className="whitespace-pre-line">{selectedAnalysis.doctor_notes}</p>
                      ) : (
                        <p className="italic text-gray-500">No notes provided.</p>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setDoctorNotes(selectedAnalysis?.doctor_notes || '');
                        }}
                      >
                        Edit Notes
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h3 className="mb-2 font-medium">Previous Approvals History</h3>
                  <div className="space-y-4">
                    {sleepHistory
                      .filter(item => item.analysis_status === 'approved' && item.id !== selectedAnalysis?.id)
                      .map((item, index) => (
                        <div key={index} className="pb-4 border-b">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{formatDate(item.date)}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              AHI: {typeof item.ahi === 'number' ? item.ahi.toFixed(1) : 
                                    typeof item.ahi === 'string' ? parseFloat(item.ahi).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{item.doctor_notes || 'No notes provided.'}</p>
                        </div>
                      ))}
                    {sleepHistory.filter(item => item.analysis_status === 'approved' && item.id !== selectedAnalysis?.id).length === 0 && (
                      <p className="text-gray-500">No previous approvals found.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
export default PatientAnalysisDetails;