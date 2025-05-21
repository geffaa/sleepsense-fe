// src/lib/mqtt-service.ts
import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

// Define data types for sensor readings
export interface FingerSensorData {
  timestamp: string;
  spo2: number;
  bpm: number; // Heart Rate in BPM
  raw_ir?: number;
  raw_red?: number;
}

export interface BeltSensorData {
  timestamp: string;
  ecg: number;
  piezoelectric_voltage: number; // Previously 'thorax'
  radar_amplitude?: number; // Previously 'breathing'
}

export interface CombinedSensorData {
  timestamp: string;
  ecg?: number;
  spo2?: number;
  bpm?: number; // Heart Rate in BPM
  piezoelectric_voltage?: number;
  radar_amplitude?: number;
  raw_ir?: number;
  raw_red?: number;
  battery_level?: number;
}

// Define proper types for MQTT messages
interface MqttMessage {
  timestamp?: string;
  data?: {
    spo2?: number;
    bpm?: number;
    ecg?: number;
    piezoelectric_voltage?: number;
    radar_amplitude?: number;
    raw_ir?: number;
    raw_red?: number;
  };
  // Direct properties that might exist on the message
  spo2?: number;
  bpm?: number;
  ecg?: number;
  piezoelectric_voltage?: number;
  radar_amplitude?: number;
  raw_ir?: number;
  raw_red?: number;
  battery_level?: number;
  status?: 'active' | 'inactive' | 'error';
}

// MQTT Service Hook
export function useMqttConnection(deviceId: string) {
  // Skip the client state since it's causing ESLint warnings
  const [isConnected, setIsConnected] = useState(false);
  const [fingerData, setFingerData] = useState<FingerSensorData[]>([]);
  const [beltData, setBeltData] = useState<BeltSensorData[]>([]);
  const [statusData, setStatusData] = useState<{
    battery_level: number;
    status: 'active' | 'inactive' | 'error';
  }>({
    battery_level: 0,
    status: 'inactive'
  });
  const [error, setError] = useState<string | null>(null);
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastConnectionTime, setLastConnectionTime] = useState<number>(0);
  const [brokerIndex, setBrokerIndex] = useState(0);
  
  // Try multiple broker configurations if one fails
  const brokerConfigs = [
    { protocol: 'ws', host: process.env.NEXT_PUBLIC_MQTT_HOST || 'localhost', port: process.env.NEXT_PUBLIC_MQTT_PORT || '9001' },
    { protocol: 'ws', host: process.env.NEXT_PUBLIC_MQTT_FALLBACK_HOST || 'localhost', port: process.env.NEXT_PUBLIC_MQTT_FALLBACK_PORT || '9001' },
    { protocol: 'wss', host: process.env.NEXT_PUBLIC_MQTT_SECURE_HOST || 'localhost', port: process.env.NEXT_PUBLIC_MQTT_SECURE_PORT || '8084' },
    { protocol: 'mqtt', host: process.env.NEXT_PUBLIC_MQTT_TCP_HOST || 'localhost', port: process.env.NEXT_PUBLIC_MQTT_TCP_PORT || '1883' },
  ];
  
  // Connect to MQTT when component mounts
  useEffect(() => {
    // Check if we've tried connecting recently to avoid rapid reconnection attempts
    const now = Date.now();
    const minInterval = 3000; // 3 seconds minimum between connection attempts
    
    if (now - lastConnectionTime < minInterval && lastConnectionTime !== 0) {
      console.log('Throttling connection attempts...');
      return;
    }
    
    setLastConnectionTime(now);
    
    // Try to connect with the current broker configuration
    const currentConfig = brokerConfigs[brokerIndex % brokerConfigs.length];
    const { protocol, host, port } = currentConfig;
    
    const connectUrl = `${protocol}://${host}:${port}`;
    
    const clientId = `sleepsense_web_${Math.random().toString(16).substring(2, 10)}`;
    
    console.log(`Attempting to connect to MQTT broker at ${connectUrl} (attempt ${connectionAttempts + 1})`);
    
    let client: mqtt.MqttClient | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;
    
    try {
      // Set a timeout to handle connection failures early
      connectionTimeout = setTimeout(() => {
        if (!isConnected && client) {
          console.warn('Connection attempt timed out, trying next broker');
          // Force close and try next broker
          client.end(true);
          setError('Connection timed out. Trying alternative broker...');
          // Try next broker configuration
          setBrokerIndex(prev => (prev + 1) % brokerConfigs.length);
          setConnectionAttempts(prev => prev + 1);
        }
      }, 8000); // Reduced timeout to detect failures faster

      // Configure connection options based on protocol
      const connectOptions: mqtt.IClientOptions = {
        clientId,
        clean: true,
        connectTimeout: 10000, // Reduced from 15s to 10s
        reconnectPeriod: 2000, // Reduced from 5s to 2s for faster recovery
        keepalive: 30, // Reduced from 60s to 30s
      };
      
      // Add WebSocket path for ws/wss protocols
      if (protocol === 'ws' || protocol === 'wss') {
        connectOptions.path = '/mqtt'; // Common WebSocket path for MQTT
      }
      
      // Add additional options for secure connections
      if (protocol === 'wss') {
        connectOptions.rejectUnauthorized = false; // Only for development/testing
      }
      
      client = mqtt.connect(connectUrl, connectOptions);
      
      setMqttClient(client);
      
      client.on('connect', () => {
        console.log('Connected to MQTT broker successfully');
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        setIsConnected(true);
        setError(null);
        setConnectionAttempts(0);
        
        // Subscribe to device topics
        const fingerTopic = `sleepsense/device/${deviceId}/finger`;
        const beltTopic = `sleepsense/device/${deviceId}/belt`;
        const statusTopic = `sleepsense/device/${deviceId}/status`;
        
        client?.subscribe([fingerTopic, beltTopic, statusTopic], (err) => {
          if (err) {
            console.error('Subscription error:', err);
            setError(`Failed to subscribe to topics: ${err.message}`);
          } else {
            console.log(`Subscribed to topics for device ${deviceId}`);
          }
        });
      });
      
      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });
      
      client.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
        setIsConnected(false);
      });
      
      client.on('offline', () => {
        console.log('MQTT client is offline');
        setIsConnected(false);
      });
      
      client.on('reconnect', () => {
        console.log('Attempting to reconnect to MQTT broker');
        
        // If we've tried this broker too many times, switch to the next one
        if (connectionAttempts > 3) {
          console.log('Too many reconnection attempts on current broker, switching to next broker');
          if (client) {
            client.end(true);
          }
          setBrokerIndex(prev => (prev + 1) % brokerConfigs.length);
          setConnectionAttempts(0);
        } else {
          setConnectionAttempts(prev => prev + 1);
        }
      });
      
      client.on('message', (topic, payload) => {
        try {
          const message = JSON.parse(payload.toString()) as MqttMessage;
          
          // Handle different topic types
          if (topic.includes('/finger')) {
            // Handle finger sensor data
            let dataArray: FingerSensorData[] = [];
            
            // Handle different formats
            if (Array.isArray(message)) {
              dataArray = message as FingerSensorData[];
            } else if (message.data && Array.isArray(message.data)) {
              dataArray = message.data as FingerSensorData[];
            } else if (typeof message === 'object' && message !== null) {
              // Try to handle a single data point
              const timestamp = message.timestamp || new Date().toISOString();
              const spo2 = typeof message.spo2 === 'number' ? message.spo2 : 
                          (message.data && typeof message.data.spo2 === 'number') ? message.data.spo2 : 96;
              const bpm = typeof message.bpm === 'number' ? message.bpm : 
                          (message.data && typeof message.data.bpm === 'number') ? message.data.bpm : 75;
              
              dataArray = [{ timestamp, spo2, bpm }];
            } else {
              console.warn('Invalid finger data format:', message);
              return;
            }
            
            // Update finger data state
            setFingerData(prev => {
              const newData = [...prev, ...dataArray];
              // Keep only the latest 100 data points
              return newData.slice(-100);
            });
            
            // Update battery level if present
            if (message.battery_level !== undefined) {
              setStatusData(prev => ({
                ...prev,
                battery_level: message.battery_level ?? 0,
                status: 'active'
              }));
            }
          } else if (topic.includes('/belt')) {
            // Handle belt sensor data
            let dataArray: BeltSensorData[] = [];
            
            // Handle different formats
            if (Array.isArray(message)) {
              dataArray = message as BeltSensorData[];
            } else if (message.data && Array.isArray(message.data)) {
              dataArray = message.data as BeltSensorData[];
            } else if (typeof message === 'object' && message !== null) {
              // Try to handle a single data point
              const timestamp = message.timestamp || new Date().toISOString();
              const ecg = typeof message.ecg === 'number' ? message.ecg : 
                        (message.data && typeof message.data.ecg === 'number') ? message.data.ecg : 0;
              const piezoelectric_voltage = typeof message.piezoelectric_voltage === 'number' ? message.piezoelectric_voltage : 
                                          (message.data && typeof message.data.piezoelectric_voltage === 'number') ? message.data.piezoelectric_voltage : 0;
              
              dataArray = [{ timestamp, ecg, piezoelectric_voltage }];
            } else {
              console.warn('Invalid belt data format:', message);
              return;
            }
            
            // Update belt data state
            setBeltData(prev => {
              const newData = [...prev, ...dataArray];
              // Keep only the latest 100 data points
              return newData.slice(-100);
            });
            
            // Update battery level if present
            if (message.battery_level !== undefined) {
              setStatusData(prev => ({
                ...prev,
                battery_level: message.battery_level ?? 0,
                status: 'active'
              }));
            }
          } else if (topic.includes('/status')) {
            // Handle device status data
            setStatusData({
              battery_level: message.battery_level ?? 0,
              status: message.status ?? 'inactive'
            });
          }
        } catch (err) {
          console.error('Error processing MQTT message:', err);
        }
      });
      
      // Cleanup function
      return () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        if (client) {
          client.end();
        }
      };
    } catch (err) {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      console.error('Failed to connect to MQTT broker:', err);
      setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
      
      // Try next broker configuration on error
      setBrokerIndex(prev => (prev + 1) % brokerConfigs.length);
      setConnectionAttempts(prev => prev + 1);
    }
    
    // Dependencies include brokerIndex to trigger reconnect with different config
  }, [deviceId, brokerIndex, lastConnectionTime, isConnected, connectionAttempts]);
  
  // Function to reconnect with backoff
  const reconnect = () => {
    if (mqttClient) {
      mqttClient.end(true, {}, () => {
        console.log('MQTT client forcefully disconnected for reconnection');
        setIsConnected(false);
        
        // Try next broker configuration
        setBrokerIndex(prev => (prev + 1) % brokerConfigs.length);
        setConnectionAttempts(0);
        
        // Reset error state
        setError(null);
      });
    }
  };

  // Get combined latest data for charts
  const getLatestData = (): CombinedSensorData | null => {
    if (fingerData.length === 0 && beltData.length === 0) {
      return null;
    }
    
    // Get the latest data from both sensors
    const latestFinger = fingerData.length > 0 ? fingerData[fingerData.length - 1] : null;
    const latestBelt = beltData.length > 0 ? beltData[beltData.length - 1] : null;
    
    // Use the most recent timestamp
    const fingerTimestamp = latestFinger ? new Date(latestFinger.timestamp).getTime() : 0;
    const beltTimestamp = latestBelt ? new Date(latestBelt.timestamp).getTime() : 0;
    
    // Determine which data is more recent
    if (fingerTimestamp >= beltTimestamp && latestFinger) {
      return {
        timestamp: latestFinger.timestamp,
        spo2: latestFinger.spo2,
        bpm: latestFinger.bpm,
        raw_ir: latestFinger.raw_ir,
        raw_red: latestFinger.raw_red,
        // Add belt data if available and from similar time (within 1 second)
        ...(latestBelt && Math.abs(fingerTimestamp - beltTimestamp) < 1000 && {
          ecg: latestBelt.ecg,
          piezoelectric_voltage: latestBelt.piezoelectric_voltage,
          radar_amplitude: latestBelt.radar_amplitude
        }),
        battery_level: statusData?.battery_level
      };
    } else if (latestBelt) {
      return {
        timestamp: latestBelt.timestamp,
        ecg: latestBelt.ecg,
        piezoelectric_voltage: latestBelt.piezoelectric_voltage,
        radar_amplitude: latestBelt.radar_amplitude,
        // Add finger data if available and from similar time (within 1 second)
        ...(latestFinger && Math.abs(fingerTimestamp - beltTimestamp) < 1000 && {
          spo2: latestFinger.spo2,
          bpm: latestFinger.bpm,
          raw_ir: latestFinger.raw_ir,
          raw_red: latestFinger.raw_red
        }),
        battery_level: statusData?.battery_level
      };
    }
    
    return null;
  };
  
  // Convert to chart data format (time series)
  const getChartData = () => {
    // Combine both data sources for time-aligned data
    const combinedData = [...fingerData.map(d => ({ 
      type: 'finger' as const, 
      timestamp: d.timestamp, 
      data: d 
    })), ...beltData.map(d => ({ 
      type: 'belt' as const, 
      timestamp: d.timestamp, 
      data: d 
    }))].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Create datasets with consistent time points
    const ecgData = combinedData
      .filter(d => d.type === 'belt' && 'ecg' in d.data)
      .map(d => ({ time: d.timestamp, value: (d.data as BeltSensorData).ecg }));
    
    const spo2Data = combinedData
      .filter(d => d.type === 'finger' && 'spo2' in d.data)
      .map(d => ({ time: d.timestamp, value: (d.data as FingerSensorData).spo2 }));
    
    const bpmData = combinedData
      .filter(d => d.type === 'finger' && 'bpm' in d.data)
      .map(d => ({ time: d.timestamp, value: (d.data as FingerSensorData).bpm }));
    
    const piezoelectricData = combinedData
      .filter(d => d.type === 'belt' && 'piezoelectric_voltage' in d.data)
      .map(d => ({ time: d.timestamp, value: (d.data as BeltSensorData).piezoelectric_voltage }));
    
    return {
      ecg: {
        data: ecgData,
        unit: 'mV'
      },
      spo2: {
        data: spo2Data,
        unit: '%'
      },
      piezoelectric: {
        data: piezoelectricData,
        unit: 'mV'
      },
      bpm: {
        data: bpmData,
        unit: 'bpm'
      }
    };
  };
  
  // Get device status
  const getDeviceStatus = () => {
    return {
      isConnected,
      battery_level: statusData.battery_level,
      status: statusData.status,
      connectionError: error
    };
  };
  
  // Return the MQTT service API
  return {
    isConnected,
    error,
    getLatestData,
    getChartData,
    getDeviceStatus,
    reconnect,
    currentBroker: brokerConfigs[brokerIndex % brokerConfigs.length]
  };
}