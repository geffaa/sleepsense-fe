"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { mockSleepData, getRealtimeSensorUpdate } from '@/lib/mock-data';

// Define the structure with updated field names
interface SleepData {
  ecg: {
    data: { time: string; value: number }[];
    unit: string;
  };
  spo2: {  // Updated from 'oxygen'
    data: { time: string; value: number }[];
    unit: string;
  };
  piezoelectric: {  // Updated from 'thoracic'
    data: { time: string; value: number }[];
    unit: string;
  };
  breathing: {
    data: { time: string; value: number }[];
    unit: string;
  };
}

interface MonitoringSectionProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

const MonitoringSection: React.FC<MonitoringSectionProps> = ({ 
  timeRange, 
  onTimeRangeChange 
}) => {
  // Renamed 'oxygen' to 'spo2', 'thoracic' to 'piezoelectric'
  // while maintaining compatibility for visualization
  const [sleepData, setSleepData] = useState<SleepData>(() => {
    const data = mockSleepData(timeRange);
    return {
      ecg: data.ecg,
      spo2: {  // handle the rename
        data: data.oxygen?.data || [],
        unit: data.oxygen?.unit || '%'
      },
      piezoelectric: {  // handle the rename
        data: data.thoracic?.data || [],
        unit: data.thoracic?.unit || 'mV'
      },
      breathing: data.breathing
    };
  });
  
  const [isLive, setIsLive] = useState(true);
  const [hasApneaEvent, setHasApneaEvent] = useState(false);
  const [apneaDuration, setApneaDuration] = useState(0);
  
  // Effect to update data periodically for real-time simulation
  useEffect(() => {
    if (!isLive) return;
    
    const updateInterval = setInterval(() => {
      // Simulate real-time sensor update from IoT device
      const latestData = getRealtimeSensorUpdate();
      
      setSleepData(prevData => {
        // Update ECG data
        const newEcgData = [...prevData.ecg.data.slice(1)];
        newEcgData.push({ time: latestData.timestamp, value: latestData.ecg });
        
        // Update oxygen data (now spo2)
        const newSpo2Data = [...prevData.spo2.data.slice(1)];
        newSpo2Data.push({ time: latestData.timestamp, value: latestData.oxygen });
        
        // Update thoracic data (now piezoelectric)
        const newPiezoelectricData = [...prevData.piezoelectric.data.slice(1)];
        newPiezoelectricData.push({ time: latestData.timestamp, value: latestData.thorax });
        
        // Update breathing data
        const newBreathingData = [...prevData.breathing.data.slice(1)];
        newBreathingData.push({ time: latestData.timestamp, value: latestData.breathing });
        
        return {
          ecg: {
            data: newEcgData,
            unit: prevData.ecg.unit
          },
          spo2: {
            data: newSpo2Data,
            unit: prevData.spo2.unit
          },
          piezoelectric: {
            data: newPiezoelectricData,
            unit: prevData.piezoelectric.unit
          },
          breathing: {
            data: newBreathingData,
            unit: prevData.breathing.unit
          }
        };
      });
      
      // Update apnea event status
      setHasApneaEvent(latestData.hasApneaEvent);
      if (latestData.hasApneaEvent) {
        setApneaDuration(prev => prev + 1);
      } else {
        setApneaDuration(0);
      }
      
    }, 1000); // Update every 1 second
    
    return () => clearInterval(updateInterval);
  }, [isLive]);
  
  // Handle time range change
  useEffect(() => {
    // Get new data when time range changes
    const data = mockSleepData(timeRange);
    setSleepData({
      ecg: data.ecg,
      spo2: {
        data: data.oxygen?.data || [],
        unit: data.oxygen?.unit || '%'
      },
      piezoelectric: {
        data: data.thoracic?.data || [],
        unit: data.thoracic?.unit || 'mV'
      },
      breathing: data.breathing
    });
  }, [timeRange]);
  
  const timeRangeOptions = [
    { value: '10m', label: '10 min' },
    { value: '30m', label: '30 min' },
    { value: '1h', label: '1 hour' },
    { value: '3h', label: '3 hours' },
    { value: '8h', label: '8 hours' },
  ];

  const handleTimeRangeChange = (value: string) => {
    if (value) {
      onTimeRangeChange(value);
      setIsLive(false); // Disable live updates when viewing historical data
    }
  };
  
  // Toggle live monitoring
  const toggleLiveMonitoring = () => {
    setIsLive(!isLive);
    if (!isLive) {
      // If enabling live monitoring, update to the latest data
      const data = mockSleepData('10m');
      setSleepData({
        ecg: data.ecg,
        spo2: {
          data: data.oxygen?.data || [],
          unit: data.oxygen?.unit || '%'
        },
        piezoelectric: {
          data: data.thoracic?.data || [],
          unit: data.thoracic?.unit || 'mV'
        },
        breathing: data.breathing
      });
      onTimeRangeChange('10m');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800">Real-time Monitoring</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span 
              className={`inline-block w-3 h-3 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            ></span>
            <button 
              onClick={toggleLiveMonitoring} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLive ? 'Live' : 'Start Live Monitoring'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Time Range:</span>
            <ToggleGroup type="single" value={timeRange} onValueChange={handleTimeRangeChange}>
              {timeRangeOptions.map((option) => (
                <ToggleGroupItem 
                  key={option.value} 
                  value={option.value} 
                  aria-label={option.label}
                  className="px-3 py-1 text-sm"
                  disabled={isLive && option.value !== '10m'}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Apnea Alert Banner */}
      {hasApneaEvent && (
        <Alert className="text-red-800 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span><strong>Apnea Event Detected</strong> - Duration: {apneaDuration} seconds</span>
              <Badge className="text-red-800 bg-red-100 border-red-200">
                {apneaDuration < 10 ? 'Mild' : apneaDuration < 20 ? 'Moderate' : 'Severe'}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* ECG Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              ECG (Electrocardiogram)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sleepData.ecg.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    }}
                  />
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <Tooltip 
                    formatter={(value) => [`${value} ${sleepData.ecg.unit}`, 'ECG']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `Time: ${date.toLocaleTimeString()}`;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SpO2 Chart (renamed from Oxygen Saturation) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              SpO₂ (Oxygen Saturation)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sleepData.spo2.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    }}
                  />
                  <YAxis domain={[85, 100]} />
                  <ReferenceLine y={92} stroke="#f87171" strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => [`${value} ${sleepData.spo2.unit}`, 'SpO₂']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `Time: ${date.toLocaleTimeString()}`;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#dc2626" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two Charts in a Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Piezoelectric Movement Chart (renamed from Thoracic) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Piezoelectric Movement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sleepData.piezoelectric.data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ${sleepData.piezoelectric.unit}`, 'Piezoelectric']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return `Time: ${date.toLocaleTimeString()}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Breathing Pattern Chart (Radar Amplitude) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Breathing Pattern (Radar)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sleepData.breathing.data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ${sleepData.breathing.unit}`, 'Breathing']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return `Time: ${date.toLocaleTimeString()}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSection;