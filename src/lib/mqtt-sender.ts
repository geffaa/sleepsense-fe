// src/lib/mqtt-sender.ts
import mqtt from 'mqtt';

/**
 * Utility for sending test data to the MQTT broker.
 * This is a development/testing tool not meant for production use.
 */
export class MqttSender {
  private client: mqtt.MqttClient | null = null;
  private deviceId: string;
  
  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }
  
  /**
   * Connect to the MQTT broker
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Get MQTT connection details from environment variables
        const host = process.env.NEXT_PUBLIC_MQTT_HOST || '192.168.46.200';
        const port = process.env.NEXT_PUBLIC_MQTT_PORT || '1883';
        const connectUrl = `mqtt://${host}:${port}`;
        
        console.log(`Connecting to MQTT broker at ${connectUrl}`);
        
        // Create a random client ID for this sender
        const clientId = `sleepsense_sender_${Math.random().toString(16).substring(2, 8)}`;
        
        // Connect to the broker
        this.client = mqtt.connect(connectUrl, {
          clientId,
          clean: true,
          connectTimeout: 4000,
          reconnectPeriod: 1000,
        });
        
        this.client.on('connect', () => {
          console.log(`MQTT Sender connected to broker for device ${this.deviceId}`);
          resolve();
        });
        
        this.client.on('error', (err) => {
          console.error('MQTT Sender connection error:', err);
          reject(err);
        });
      } catch (error) {
        console.error('Failed to connect MQTT Sender:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Send finger sensor data (SpO2 and Heart Rate)
   */
  async sendFingerData(data: Array<{
    timestamp: Date | string; 
    spo2: number; 
    bpm: number;
  }>, batteryLevel = 100): Promise<void> {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }
    
    // Format data for sending
    const formattedData = data.map(item => ({
      timestamp: typeof item.timestamp === 'string' ? item.timestamp : item.timestamp.toISOString(),
      spo2: item.spo2,
      bpm: item.bpm
    }));
    
    // Create the topic
    const topic = `sleepsense/device/${this.deviceId}/finger`;
    
    // Create the payload
    const payload = JSON.stringify({
      data: formattedData,
      battery_level: batteryLevel,
      timestamp: new Date().toISOString()
    });
    
    // Publish to the topic
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('Error publishing finger data:', err);
          reject(err);
        } else {
          console.log(`Sent ${formattedData.length} finger data points`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Send belt sensor data (ECG and piezoelectric)
   */
  async sendBeltData(data: Array<{
    timestamp: Date | string;
    ecg: number;
    piezoelectric_voltage: number;
  }>, batteryLevel = 100): Promise<void> {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }
    
    // Format data for sending
    const formattedData = data.map(item => ({
      timestamp: typeof item.timestamp === 'string' ? item.timestamp : item.timestamp.toISOString(),
      ecg: item.ecg,
      piezoelectric_voltage: item.piezoelectric_voltage
    }));
    
    // Create the topic
    const topic = `sleepsense/device/${this.deviceId}/belt`;
    
    // Create the payload
    const payload = JSON.stringify({
      data: formattedData,
      battery_level: batteryLevel,
      timestamp: new Date().toISOString()
    });
    
    // Publish to the topic
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('Error publishing belt data:', err);
          reject(err);
        } else {
          console.log(`Sent ${formattedData.length} belt data points`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Send device status update
   */
  async sendDeviceStatus(status: 'active' | 'inactive' | 'error', batteryLevel = 100): Promise<void> {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }
    
    // Create the topic
    const topic = `sleepsense/device/${this.deviceId}/status`;
    
    // Create the payload
    const payload = JSON.stringify({
      status,
      battery_level: batteryLevel,
      timestamp: new Date().toISOString()
    });
    
    // Publish to the topic
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('Error publishing status:', err);
          reject(err);
        } else {
          console.log(`Sent device status: ${status}, battery: ${batteryLevel}%`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Generate and send simulated sensor data continuously
   */
  async startSimulation(intervalMs = 5000, duration = 60000): Promise<void> {
    const endTime = Date.now() + duration; // Changed to const
    let heartRate = 70 + Math.floor(Math.random() * 10); // Base heart rate between 70-80
    let spo2 = 97 + Math.floor(Math.random() * 3); // Base SpO2 between 97-99
    
    const intervalId = setInterval(async () => {
      try {
        const now = new Date();
        
        // Update values with slight random changes to simulate real readings
        heartRate += Math.floor(Math.random() * 5) - 2; // -2 to +2 change
        heartRate = Math.max(60, Math.min(110, heartRate)); // Keep within 60-110 range
        
        spo2 += Math.floor(Math.random() * 3) - 1; // -1 to +1 change
        spo2 = Math.max(90, Math.min(100, spo2)); // Keep within 90-100 range
        
        // Generate 5 data points with timestamps close together
        const fingerData = [];
        const beltData = [];
        
        for (let i = 0; i < 5; i++) {
          const timestamp = new Date(now.getTime() - (4 - i) * 1000); // Timestamps 1 second apart
          
          // Finger data
          fingerData.push({
            timestamp,
            spo2: spo2 + (Math.random() - 0.5), // Small random variation
            bpm: heartRate + Math.floor(Math.random() * 3) - 1 // Small random variation
          });
          
          // Belt data
          beltData.push({
            timestamp,
            ecg: (Math.sin(timestamp.getTime() * 0.001) * 0.5) + (Math.random() * 0.2 - 0.1), // Simulated ECG wave
            piezoelectric_voltage: (Math.sin(timestamp.getTime() * 0.0005) * 0.7) + (Math.random() * 0.2 - 0.1) // Simulated respiratory movement
          });
        }
        
        // Send both types of data
        await this.sendFingerData(fingerData);
        await this.sendBeltData(beltData);
        
        // Send device status occasionally
        if (Math.random() > 0.7) {
          const batteryLevel = 70 + Math.floor(Math.random() * 25); // Battery between 70-95%
          await this.sendDeviceStatus('active', batteryLevel);
        }
        
        // Check if simulation duration has elapsed
        if (Date.now() > endTime) {
          clearInterval(intervalId);
          console.log('Simulation completed');
        }
      } catch (error) {
        console.error('Error in simulation:', error);
      }
    }, intervalMs);
    
    // Return a promise that resolves when simulation ends
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(intervalId);
        resolve();
      }, duration);
    });
  }
  
  /**
   * Disconnect from the MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      console.log('MQTT Sender disconnected');
    }
  }
}

// Export a helper function to run a quick test
export async function testMqttSender(deviceId = 'SS-2025-X1-28934', duration = 60000): Promise<void> {
  const sender = new MqttSender(deviceId);
  try {
    await sender.connect();
    console.log('Starting MQTT test data simulation...');
    await sender.startSimulation(5000, duration);
    console.log('Test completed');
  } catch (error) {
    console.error('MQTT test failed:', error);
  } finally {
    sender.disconnect();
  }
}