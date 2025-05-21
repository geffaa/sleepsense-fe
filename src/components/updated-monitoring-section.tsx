"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { useMqttConnection } from '@/lib/mqtt-service';
import { mockSleepData, getRealtimeSensorUpdate } from '@/lib/mock-data';

interface MonitoringSectionProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  deviceSerialNumber?: string;
}

const MonitoringSection: React.FC<MonitoringSectionProps> = ({ 
  timeRange, 
  onTimeRangeChange,
  deviceSerialNumber = 'SS-2025-X1-28934' // Default device ID if not provided
}) => {
  // Connect to MQTT using our custom hook
  const mqtt = useMqttConnection(deviceSerialNumber);
  
  // State for time series data
  const [sleepData, setSleepData] = useState(() => {
    const data = mockSleepData(timeRange);
    return {
      ecg: data.ecg,
      spo2: {
        data: data.oxygen?.data || [],
        unit: data.oxygen?.unit || '%'
      },
      piezoelectric: {
        data: data.thoracic?.data || [],
        unit: data.thoracic?.unit || 'mV'
      },
      // Replace breathing with bpm data 
      bpm: {
        data: [] as { time: string; value: number }[],
        unit: 'bpm'
      }
    };
  });
  
  const [isLive, setIsLive] = useState(true);
  const [hasApneaEvent, setHasApneaEvent] = useState(false);
  const [apneaDuration, setApneaDuration] = useState(0);
  
  // Function to update charts with MQTT data
  const updateChartsWithMqttData = useCallback(() => {
    if (!isLive) return;
    
    // Get chart data from MQTT service
    const mqttChartData = mqtt.getChartData();
    
    // If we have MQTT data, use it; otherwise, fall back to mock data
    if (mqttChartData.ecg.data.length > 0 || 
        mqttChartData.spo2.data.length > 0 || 
        mqttChartData.piezoelectric.data.length > 0 ||
        mqttChartData.bpm.data.length > 0) {
      setSleepData({
        ecg: mqttChartData.ecg,
        spo2: mqttChartData.spo2,
        piezoelectric: mqttChartData.piezoelectric,
        bpm: mqttChartData.bpm
      });
      
      // Check for apnea events based on SpO2 drops
      // This is a simple detection algorithm that can be refined
      if (mqttChartData.spo2.data.length > 5) {
        const recentValues = mqttChartData.spo2.data.slice(-5);
        const latest = recentValues[recentValues.length - 1].value;
        const prev = recentValues[0].value;
        
        // If SpO2 drops by more than 4% rapidly, consider it a possible apnea event
        if (prev - latest > 4) {
          setHasApneaEvent(true);
          setApneaDuration(prev => prev + 1);
        } else {
          setHasApneaEvent(false);
          setApneaDuration(0);
        }
      }
    } else if (isLive) {
      // If no MQTT data but live mode is on, use mock data generator
      const latestData = getRealtimeSensorUpdate();
      
      setSleepData(prevData => {
        // Update ECG data
        const newEcgData = [...prevData.ecg.data.slice(1)];
        newEcgData.push({ time: latestData.timestamp, value: latestData.ecg });
        
        // Update SpO2 data
        const newSpo2Data = [...prevData.spo2.data.slice(1)];
        newSpo2Data.push({ time: latestData.timestamp, value: latestData.oxygen });
        
        // Update piezoelectric data
        const newPiezoelectricData = [...prevData.piezoelectric.data.slice(1)];
        newPiezoelectricData.push({ time: latestData.timestamp, value: latestData.thorax });
        
        // Update BPM data (heart rate) - replacing breathing data
        const newBpmData = [...prevData.bpm.data.slice(1)] as { time: string; value: number }[];
        newBpmData.push({ time: latestData.timestamp, value: latestData.heart_rate || 0 });
        
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
          bpm: {
            data: newBpmData,
            unit: 'bpm'
          }
        };
      });
      
      // Update apnea event status from mock data
      setHasApneaEvent(latestData.hasApneaEvent);
      if (latestData.hasApneaEvent) {
        setApneaDuration(prev => prev + 1);
      } else {
        setApneaDuration(0);
      }
    }
  }, [isLive, mqtt]);
  
  // Effect to update data periodically
  useEffect(() => {
    if (!isLive) return;
    
    // Update charts every second
    const updateInterval = setInterval(() => {
      updateChartsWithMqttData();
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [isLive, updateChartsWithMqttData]);
  
  // Handle time range change
  useEffect(() => {
    // Get new data when time range changes
    if (!isLive) {
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
        bpm: {
          data: [], // We'll populate this with heart rate data
          unit: 'bpm'
        }
      });
    }
  }, [timeRange, isLive]);
  
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
      onTimeRangeChange('10m');
      // Reset charts with initial data
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
        bpm: {
          data: [], // We'll populate this with heart rate data
          unit: 'bpm'
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800">Real-time Monitoring</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span 
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isLive 
                  ? mqtt.isConnected 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-orange-500 animate-pulse'
                  : 'bg-gray-400'
              }`}
            ></span>
            <button 
              onClick={toggleLiveMonitoring} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLive 
                ? mqtt.isConnected 
                  ? 'Live (MQTT)' 
                  : 'Live (Simulated)'
                : 'Start Live Monitoring'
              }
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

      {/* MQTT Connection Error */}
      {isLive && mqtt.error && (
        <Alert className="text-amber-800 border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription>
            {mqtt.error} - Using simulated data instead.
          </AlertDescription>
        </Alert>
      )}

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

        {/* SpO2 Chart */}
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
          {/* Piezoelectric Movement Chart */}
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

          {/* Heart Rate (BPM) Chart - Replacing Breathing Pattern Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Heart Rate (BPM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sleepData.bpm.data}
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
                    <YAxis domain={[40, 120]} />
                    <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" />
                    <ReferenceLine y={100} stroke="#f87171" strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(value) => [`${value} ${sleepData.bpm.unit}`, 'Heart Rate']}
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