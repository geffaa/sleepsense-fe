// src/lib/mock-data.ts

// Fungsi utilitas untuk menghasilkan data time series (digunakan dalam pengembangan)
// Fungsi ini tidak langsung digunakan dalam aplikasi tetapi disimpan sebagai referensi
// untuk pembuatan data yang lebih kompleks jika diperlukan nanti
/*
function generateTimeSeriesData(minutes: number, interval = 5) {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < (minutes * 60) / interval; i++) {
    const timePoint = new Date(now.getTime() - (minutes * 60 * 1000) + (i * interval * 1000));
    
    // Simulasi beberapa episode apnea untuk ditampilkan dalam grafik
    const isApneaEpisode = 
      (i > 150 && i < 180) || 
      (i > 350 && i < 380) || 
      (i > 550 && i < 590);
    
    // Data ECG dengan variasi realistis selama tidur
    const ecgValue = Math.sin(i * 0.8) * 0.6 + 
                     Math.sin(i * 2.5) * 0.3 +
                     (Math.random() - 0.5) * 0.15;
    
    data.push({
      time: timePoint.toISOString(),
      value: ecgValue,
      isApneaEvent: isApneaEpisode
    });
  }
  
  return data;
}
*/

// Generate mock ECG data with normal sinus rhythm and occasional abnormalities
const generateECGData = (timestamp: number, index: number) => {
  // Base sine wave for normal sinus rhythm (more realistic heart wave pattern)
  const baseValue = 
    Math.sin(index * 0.3) * 0.5 + 
    Math.sin(index * 0.6) * 0.2 * Math.pow(Math.sin(index * 0.3), 2);
  
  // Add some noise
  const noise = (Math.random() - 0.5) * 0.08;
  
  // Occasional abnormalities (such as PVCs or brief arrhythmias)
  let abnormality = 0;
  if (index % 50 === 0) {
    abnormality = (Math.random() - 0.5) * 0.8;
  }
  
  return baseValue + noise + abnormality;
};

// Mock oxygen saturation data that stays mostly within normal range (95-100%)
// but shows realistic drops during apnea events
const generateOxygenData = (timestamp: number, index: number, timeRange: string) => {
  // Determine if this should be an apnea period (create clusters of apnea events)
  const isApneaPeriod = 
    (timeRange === "1h" && (index > 1000 && index < 1200)) || 
    (timeRange === "1h" && (index > 2400 && index < 2550)) ||
    (index % 800 > 650 && index % 800 < 720);
  
  // Base value between 95-98%
  const baseValue = 96 + Math.sin(index * 0.05) * 1.5;
  
  // Add small random fluctuations
  const fluctuation = (Math.random() - 0.5) * 0.4;
  
  // More pronounced dips for apnea events
  let apneaDip = 0;
  if (isApneaPeriod) {
    // More physiologically accurate - slow decline and recovery pattern
    // Calculate relative position in the apnea event cycle
    const cyclePosition = (index % 70) / 70; // Normalized position in apnea cycle
    apneaDip = -Math.pow(Math.sin(cyclePosition * Math.PI), 2) * 5;
  }
  
  return Math.min(100, Math.max(88, baseValue + fluctuation + apneaDip));
};

// More realistic thoracic movement data showing respiratory effort during OSA
const generateThoracicData = (timestamp: number, index: number, timeRange: string) => {
  // Determine if this should be an apnea period
  const isApneaPeriod = 
    (timeRange === "1h" && (index > 1000 && index < 1200)) || 
    (timeRange === "1h" && (index > 2400 && index < 2550)) ||
    (index % 800 > 650 && index % 800 < 720);
  
  // Normal respiratory cycle (typical breathing pattern)
  const breathingFrequency = 0.1; // Represents ~10-12 breaths per minute
  const baseValue = Math.sin(index * breathingFrequency) * 0.7;
  
  // Add normal physiological variations
  const physiologicalVariation = Math.sin(index * 0.02) * 0.15; // Slower variation in breathing depth
  
  // Add noise
  const noise = (Math.random() - 0.5) * 0.1;
  
  // Simulate apnea events with increased effort but reduced movement
  let apneaPattern = 0;
  if (isApneaPeriod) {
    // In OSA, there's often increased respiratory effort but reduced or blocked airflow
    // This simulates the struggling chest movement pattern
    apneaPattern = Math.sin(index * breathingFrequency * 1.5) * 0.3 - 0.3;
  }
  
  return baseValue + physiologicalVariation + noise + (isApneaPeriod ? apneaPattern : 0);
};

// Breathing pattern data showing airflow reduction during apnea
const generateBreathingData = (timestamp: number, index: number, timeRange: string) => {
  // Determine if this should be an apnea period
  const isApneaPeriod = 
    (timeRange === "1h" && (index > 1000 && index < 1200)) || 
    (timeRange === "1h" && (index > 2400 && index < 2550)) ||
    (index % 800 > 650 && index % 800 < 720);
  
  // Normal breathing pattern
  const breathingFrequency = 0.1;
  const baseValue = Math.sin(index * breathingFrequency) * 0.8;
  
  // Add physiological variations
  const physiologicalVariation = Math.sin(index * 0.03) * 0.2;
  
  // Add noise
  const noise = (Math.random() - 0.5) * 0.15;
  
  // During apnea, airflow is reduced or absent despite respiratory effort
  let apneaPattern = 0;
  if (isApneaPeriod) {
    // Almost flat line during apnea events (represents blocked airflow)
    apneaPattern = -baseValue * 0.9;
  }
  
  return baseValue + physiologicalVariation + noise + (isApneaPeriod ? apneaPattern : 0);
};

// Function to create realistic time series data for dashboard charts
const createRealTimeSeriesData = (timeRange: string) => {
  const now = new Date();
  let duration = 0;
  let interval = 0;
  
  // Set duration and sampling interval based on time range
  switch(timeRange) {
    case "10m":
      duration = 10 * 60; // 10 minutes in seconds
      interval = 0.5; // 0.5 second interval (high resolution)
      break;
    case "30m":
      duration = 30 * 60;
      interval = 1;
      break;
    case "1h":
      duration = 60 * 60;
      interval = 2;
      break;
    case "3h":
      duration = 3 * 60 * 60;
      interval = 5;
      break;
    case "8h":
      duration = 8 * 60 * 60;
      interval = 10;
      break;
    default:
      duration = 60 * 60; // Default to 1 hour
      interval = 2;
  }
  
  const totalPoints = duration / interval;
  const ecgData = [];
  const oxygenData = [];
  const thoracicData = [];
  const breathingData = [];
  
  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now.getTime() - (totalPoints - i) * interval * 1000);
    const timeStr = timestamp.toISOString();
    
    // Generate data points
    ecgData.push({
      time: timeStr,
      value: generateECGData(timestamp.getTime(), i)
    });
    
    oxygenData.push({
      time: timeStr,
      value: generateOxygenData(timestamp.getTime(), i, timeRange)
    });
    
    thoracicData.push({
      time: timeStr,
      value: generateThoracicData(timestamp.getTime(), i, timeRange)
    });
    
    breathingData.push({
      time: timeStr,
      value: generateBreathingData(timestamp.getTime(), i, timeRange)
    });
  }
  
  return {
    ecg: {
      data: ecgData,
      unit: 'mV'
    },
    oxygen: {
      data: oxygenData,
      unit: '%'
    },
    thoracic: {
      data: thoracicData,
      unit: 'cm'
    },
    breathing: {
      data: breathingData,
      unit: 'cm'
    }
  };
};

// Generate sleep data based on selected time range
export const mockSleepData = (timeRange = "1h") => {
  return createRealTimeSeriesData(timeRange);
};

// Updated analysis results with more realistic values
export const mockAnalysisResults = {
  summary: {
    totalEvents: 5,
    apneaEvents: 3,
    hypopneaEvents: 2,
    ahi: 3.6, // Apnea-Hypopnea Index (events per hour)
    avgDuration: 18.6,
    avgOxygenDrop: 4.2,
    classification: 'Mild',
  },
  events: [
    {
      id: '1',
      type: 'apnea' as const,
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
      duration: 22,
      oxygenDrop: 5.4,
      severity: 'moderate' as const,
      confidence: 0.87,
    },
    {
      id: '2',
      type: 'hypopnea' as const,
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28 minutes ago
      duration: 15,
      oxygenDrop: 3.2,
      severity: 'mild' as const,
      confidence: 0.92,
    },
    {
      id: '3',
      type: 'apnea' as const,
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 minutes ago
      duration: 24,
      oxygenDrop: 5.8,
      severity: 'moderate' as const,
      confidence: 0.89,
    },
    {
      id: '4',
      type: 'hypopnea' as const,
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 minutes ago
      duration: 14,
      oxygenDrop: 2.8,
      severity: 'mild' as const,
      confidence: 0.85,
    },
    {
      id: '5',
      type: 'apnea' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      duration: 18,
      oxygenDrop: 4.6,
      severity: 'moderate' as const,
      confidence: 0.94,
    },
  ],
};

// Mock device status with more realistic IoT-like information
export const mockDeviceStatus = {
  battery: {
    level: 62,
    charging: false,
    estimatedRuntime: "8h 20m"
  },
  connectivity: {
    status: 'connected' as const,
    signal: 85,
    lastPing: new Date().toISOString(),
    connectionType: "WiFi",
    ipAddress: "192.168.1.120"
  },
  sensors: {
    ecg: true,
    oxygenSensor: true,
    thoracicSensor: true,
    breathingSensor: true,
  },
  lastSync: new Date().toISOString(),
  lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  nextMaintenance: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
  firmwareVersion: "2.3.1",
  serialNumber: "SS-2025-X1-28934",
};

// Mock user profile data
export const mockUserProfile = {
  name: "John Doe",
  age: 42,
  height: 178, // cm
  weight: 86, // kg
  gender: "Male",
  medicalConditions: ["Hypertension", "Allergic Rhinitis"],
  medications: ["Lisinopril 10mg"],
  sleepGoals: {
    targetSleepHours: 7.5,
    targetBedtime: "23:00",
    targetWakeTime: "06:30",
  },
};

// Mock historical sleep data for trends and reports
export const mockHistoricalData = {
  sleepHistory: [
    {
      date: "2025-03-29",
      sleepQuality: 85,
      sleepDuration: 7.2,
      apneaEvents: 3,
      hypopneaEvents: 2,
      ahi: 0.7,
      lowestOxygen: 93,
      averageOxygen: 96.8,
      sleepStages: {
        deep: 120, // minutes
        light: 240,
        rem: 105,
        awake: 15
      }
    },
    {
      date: "2025-03-28",
      sleepQuality: 78,
      sleepDuration: 6.8,
      apneaEvents: 4,
      hypopneaEvents: 3,
      ahi: 1.0,
      lowestOxygen: 92,
      averageOxygen: 96.4,
      sleepStages: {
        deep: 110,
        light: 220,
        rem: 95,
        awake: 25
      }
    },
    {
      date: "2025-03-27",
      sleepQuality: 90,
      sleepDuration: 7.6,
      apneaEvents: 2,
      hypopneaEvents: 1,
      ahi: 0.4,
      lowestOxygen: 94,
      averageOxygen: 97.2,
      sleepStages: {
        deep: 135,
        light: 250,
        rem: 115,
        awake: 10
      }
    },
    {
      date: "2025-03-26",
      sleepQuality: 82,
      sleepDuration: 7.0,
      apneaEvents: 4,
      hypopneaEvents: 2,
      ahi: 0.9,
      lowestOxygen: 93,
      averageOxygen: 96.6,
      sleepStages: {
        deep: 115,
        light: 230,
        rem: 100,
        awake: 20
      }
    },
    {
      date: "2025-03-25",
      sleepQuality: 72,
      sleepDuration: 6.5,
      apneaEvents: 6,
      hypopneaEvents: 4,
      ahi: 1.5,
      lowestOxygen: 91,
      averageOxygen: 95.8,
      sleepStages: {
        deep: 95,
        light: 210,
        rem: 85,
        awake: 30
      }
    },
    {
      date: "2025-03-24",
      sleepQuality: 80,
      sleepDuration: 7.0,
      apneaEvents: 4,
      hypopneaEvents: 2,
      ahi: 0.9,
      lowestOxygen: 92.5,
      averageOxygen: 96.3,
      sleepStages: {
        deep: 120,
        light: 235,
        rem: 100,
        awake: 15
      }
    },
    {
      date: "2025-03-23",
      sleepQuality: 75,
      sleepDuration: 6.5,
      apneaEvents: 5,
      hypopneaEvents: 3,
      ahi: 1.2,
      lowestOxygen: 92,
      averageOxygen: 96.1,
      sleepStages: {
        deep: 105,
        light: 215,
        rem: 90,
        awake: 25
      }
    }
  ],
  weeklyReports: [
    {
      weekOf: "2025-03-23",
      averageSleepQuality: 82,
      averageSleepDuration: 7.0,
      totalApneaEvents: 28,
      totalHypopneaEvents: 17,
      averageAHI: 0.9,
      lowestOxygen: 91,
      averageOxygen: 96.5,
      sleepPatternConsistency: "Medium",
      recommendation: "Your sleep patterns show moderate variability. Consider maintaining a more consistent sleep schedule."
    },
    {
      weekOf: "2025-03-16",
      averageSleepQuality: 77,
      averageSleepDuration: 6.8,
      totalApneaEvents: 32,
      totalHypopneaEvents: 21,
      averageAHI: 1.1,
      lowestOxygen: 90,
      averageOxygen: 96.2,
      sleepPatternConsistency: "Low",
      recommendation: "Your sleep duration varies significantly throughout the week. Aim for 7-8 hours consistently."
    }
  ]
};

// Mock doctor approval data
export const mockDoctorApproval = {
  status: 'Pending' as const,
  doctorName: 'Dr. Sarah Johnson',
  timestamp: null,
  notes: '',
  estimatedResponseTime: "24-48 hours"
};

// Utility function to simulate real-time data updates
// This could be called at intervals to simulate streaming data from the IoT device
export const getRealtimeSensorUpdate = () => {
  const now = new Date();
  
  // Simulate apnea event based on time
  const hasApneaEvent = now.getSeconds() % 60 >= 40 && now.getSeconds() % 60 <= 50;
  
  // Generate ECG value with cardiac rhythm variations
  const ecgValue = Math.sin(now.getSeconds() * 0.8) * 0.6 + 
                  Math.sin(now.getSeconds() * 2.5) * 0.3 +
                  (Math.random() - 0.5) * 0.15;
  
  // Generate oxygen value with dips during apnea
  let oxygenValue = 97 + Math.sin(now.getSeconds() * 0.1) * 0.7 + (Math.random() - 0.5) * 0.4;
  if (hasApneaEvent) {
    oxygenValue = Math.max(91, oxygenValue - 5 * Math.sin((now.getSeconds() % 10) * 0.5));
  }
  
  // Generate thoracic movement
  const thoraxValue = Math.sin(now.getSeconds() * 0.3) * 0.8 + (Math.random() - 0.5) * 0.2;
  
  // Generate breathing pattern
  let breathingValue;
  if (hasApneaEvent) {
    breathingValue = thoraxValue * 0.2 + (Math.random() - 0.5) * 0.1;
  } else {
    breathingValue = thoraxValue * 1.1 + (Math.random() - 0.5) * 0.15;
  }
  
  return {
    timestamp: now.toISOString(),
    ecg: ecgValue,
    oxygen: oxygenValue,
    thorax: thoraxValue,
    breathing: breathingValue,
    hasApneaEvent,
    heartRate: 60 + Math.round(Math.sin(now.getMinutes() * 0.1) * 5 + (Math.random() - 0.5) * 3)
  };
};