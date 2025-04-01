// src/components/dashboard/history-card.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Define the structure of sleep history data from API
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

// Define the structure for chart data that includes all needed properties
interface ChartDataItem {
  date: string;
  apneaEvents: number;
  hypopneaEvents: number;
  sleepQuality: number;
  sleepDuration: number;
  ahi?: number | string | null;
  severity?: string;
}

// Updated interface to accept sleep history data
interface HistoryCardProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  sleepHistory?: SleepHistoryItem[];
  loading?: boolean;
  error?: string | null;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ 
  selectedDate, 
  onDateChange,
  sleepHistory = [],
  loading = false,
  error = null
}) => {
  const [dateViewMode, setDateViewMode] = useState<'day' | 'week' | 'month'>('week');
  
  // Mock data as fallback if no API data provided
  const mockWeeklyData: ChartDataItem[] = [
    { date: '2025-03-23', apneaEvents: 5, hypopneaEvents: 3, sleepQuality: 75, sleepDuration: 6.5 },
    { date: '2025-03-24', apneaEvents: 4, hypopneaEvents: 2, sleepQuality: 80, sleepDuration: 7.0 },
    { date: '2025-03-25', apneaEvents: 6, hypopneaEvents: 4, sleepQuality: 65, sleepDuration: 6.0 },
    { date: '2025-03-26', apneaEvents: 3, hypopneaEvents: 2, sleepQuality: 85, sleepDuration: 7.2 },
    { date: '2025-03-27', apneaEvents: 2, hypopneaEvents: 1, sleepQuality: 90, sleepDuration: 7.5 },
    { date: '2025-03-28', apneaEvents: 4, hypopneaEvents: 3, sleepQuality: 82, sleepDuration: 7.1 },
    { date: '2025-03-29', apneaEvents: 3, hypopneaEvents: 2, sleepQuality: 85, sleepDuration: 6.8 },
  ];

  // Prepare data for charts from API data or use mock data as fallback
  const chartData = useMemo(() => {
    if (sleepHistory.length > 0) {
      // Use actual API data
      return sleepHistory.map(item => ({
        date: item.date,
        apneaEvents: item.apnea_events || 0,
        hypopneaEvents: item.hypopnea_events || 0,
        sleepQuality: item.sleep_quality || 0,
        sleepDuration: item.sleep_duration || 0,
        ahi: typeof item.ahi === 'number' ? item.ahi : 
             typeof item.ahi === 'string' ? parseFloat(item.ahi) : 0,
        severity: item.severity || 'Unknown'
      }));
    } else {
      // Use mock data as fallback
      return mockWeeklyData;
    }
  }, [sleepHistory, mockWeeklyData]);

  // Filter data based on selected date and view mode
  const filteredChartData = useMemo(() => {
    if (chartData.length === 0) return [];

    // Filter data berdasarkan mode tampilan dan tanggal yang dipilih
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (dateViewMode === 'day') {
      // Filter untuk satu hari
      return chartData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getDate() === startOfDay.getDate() && 
               itemDate.getMonth() === startOfDay.getMonth() && 
               itemDate.getFullYear() === startOfDay.getFullYear();
      });
    } else if (dateViewMode === 'week') {
      // Filter untuk satu minggu
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Set to start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // End of week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);
      
      return chartData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      });
    } else { // month
      // Filter untuk satu bulan
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
      
      return chartData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startOfMonth && itemDate <= endOfMonth;
      });
    }
  }, [chartData, selectedDate, dateViewMode]);

  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (dateViewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (dateViewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (dateViewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (dateViewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  // Format chart date labels in a consistent way
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    // Use a simple consistent format instead of locale-specific format
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Format dates consistently for both server and client
  const formatDisplayDate = (date: Date) => {
    // Use more precise formatting for the header display (avoiding locale-specific formatting)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                   'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    if (dateViewMode === 'day') {
      return `${month} ${day}, ${year}`;
    } else if (dateViewMode === 'week') {
      return `Week of ${month} ${day}, ${year}`;
    } else {
      return `${month} ${year}`;
    }
  };

  // Format dates for tooltip labels consistently
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Calculate AHI (Apnea-Hypopnea Index) for display in table
  const calculateAHI = (apneaEvents: number, hypopneaEvents: number, sleepDuration: number) => {
    if (!sleepDuration || sleepDuration === 0) return 'N/A';
    return ((apneaEvents + hypopneaEvents) / sleepDuration).toFixed(1);
  };

  // Get severity badge class based on severity level
  const getSeverityClass = (severity?: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800';
    
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get severity based on apnea events if severity is not provided
  const getSeverityFromEvents = (apneaEvents: number): string => {
    if (apneaEvents > 5) return 'Severe';
    if (apneaEvents > 2) return 'Moderate';
    return 'Mild';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Sleep History</CardTitle>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Sleep History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="text-red-800 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Sleep History</CardTitle>
          <div className="flex p-1 border rounded-md">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  dateViewMode === mode
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setDateViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={navigatePrevious}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h3 className="text-lg font-medium text-gray-700">
            {formatDisplayDate(selectedDate)}
          </h3>
          <button 
            onClick={navigateNext}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {chartData.length > 0 ? (
          filteredChartData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Sleep Events Chart */}
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="mb-4 text-sm font-medium text-gray-700">Apnea & Hypopnea Events</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={filteredChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barGap={0}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDateLabel}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                          formatter={(value) => [value, '']}
                          labelFormatter={(label) => `Date: ${formatTooltipDate(label)}`}
                        />
                        <Legend />
                        <Bar dataKey="apneaEvents" name="Apnea Events" fill="#ef4444" />
                        <Bar dataKey="hypopneaEvents" name="Hypopnea Events" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Sleep Quality Chart */}
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="mb-4 text-sm font-medium text-gray-700">Sleep Quality & Duration</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={filteredChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDateLabel}
                        />
                        <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'Sleep Quality') return [`${value}%`, name];
                            return [`${value} hrs`, name];
                          }}
                          labelFormatter={(label) => `Date: ${formatTooltipDate(label)}`}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sleepQuality" name="Sleep Quality" fill="#0ea5e9" />
                        <Bar yAxisId="right" dataKey="sleepDuration" name="Sleep Duration (hrs)" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Detailed History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          AHI
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Sleep Quality
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredChartData.map((day) => (
                        <tr key={day.date}>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatTooltipDate(day.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {day.ahi !== undefined ? (typeof day.ahi === 'number' ? day.ahi.toFixed(1) : 
                                                typeof day.ahi === 'string' ? parseFloat(day.ahi).toFixed(1) : 'N/A') : 
                             calculateAHI(day.apneaEvents, day.hypopneaEvents, day.sleepDuration)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${day.sleepQuality}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">{day.sleepQuality}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {day.sleepDuration} hrs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${day.severity ? getSeverityClass(day.severity) : 
                                getSeverityClass(getSeverityFromEvents(day.apneaEvents))}`}>
                              {day.severity || getSeverityFromEvents(day.apneaEvents)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No sleep data available for the selected {dateViewMode}.
              <p className="mt-2 text-sm">Try selecting a different date or date range.</p>
            </div>
          )
        ) : (
          <div className="py-12 text-center text-gray-500">
            No sleep history data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryCard;