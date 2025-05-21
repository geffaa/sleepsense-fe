// // src/components/mqtt-test-component.tsx
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Input from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { AlertCircle, Send, Play, Square } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { MqttSender } from '@/lib/mqtt-sender';

// // Creating simple Label component since it's missing
// const Label: React.FC<{
//   htmlFor: string;
//   children: React.ReactNode;
// }> = ({ htmlFor, children }) => (
//   <label 
//     htmlFor={htmlFor} 
//     className="block mb-2 text-sm font-medium text-gray-700"
//   >
//     {children}
//   </label>
// );

// // Creating simple Slider component since it's missing
// const Slider: React.FC<{
//   id: string;
//   min: number;
//   max: number;
//   step: number;
//   value: number[];
//   onValueChange: (value: number[]) => void;
// }> = ({ id, min, max, step, value, onValueChange }) => (
//   <input
//     id={id}
//     type="range"
//     min={min}
//     max={max}
//     step={step}
//     value={value[0]}
//     onChange={(e) => onValueChange([Number(e.target.value)])}
//     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//   />
// );

// // Creating simple Switch component since it's missing
// const Switch: React.FC<{
//   id: string;
//   checked: boolean;
//   onCheckedChange: (checked: boolean) => void;
// }> = ({ id, checked, onCheckedChange }) => (
//   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//     <input
//       id={id}
//       type="checkbox"
//       checked={checked}
//       onChange={(e) => onCheckedChange(e.target.checked)}
//       className="sr-only"
//     />
//     <div className={`block h-6 rounded-full w-12 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
//       <div 
//         className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
//           checked ? 'transform translate-x-6' : ''
//         }`}
//       ></div>
//     </div>
//   </div>
// );

// const MqttTestComponent: React.FC = () => {
//   const [deviceId, setDeviceId] = useState('SS-2025-X1-28934');
//   const [mqttSender, setMqttSender] = useState<MqttSender | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSimulating, setIsSimulating] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [log, setLog] = useState<string[]>([]);
  
//   // Form states
//   const [heartRate, setHeartRate] = useState(75);
//   const [spo2, setSpo2] = useState(97);
//   const [ecgValue, setEcgValue] = useState(0.5);
//   const [piezoValue, setPiezoValue] = useState(0.7);
//   const [batteryLevel, setBatteryLevel] = useState(85);
//   const [includeRandomVariation, setIncludeRandomVariation] = useState(true);
  
// //   // Connect to MQTT broker
// //   const connectMqtt = async () => {
// //     try {
// //       setError(null);
// //       addToLog('Connecting to MQTT broker...');
      
// //       const sender = new MqttSender(deviceId);
// //       await sender.connect();
      
// //       setMqttSender(sender);
// //       setIsConnected(true);
// //       addToLog(`Connected to MQTT broker for device ${deviceId}`);
// //     } catch (err) {
// //       setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
// //       addToLog(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
// //     }
// //   };
  
//   // Disconnect from MQTT broker
//   const disconnectMqtt = () => {
//     if (mqttSender) {
//       mqttSender.disconnect();
//       setMqttSender(null);
//       setIsConnected(false);
//       setIsSimulating(false);
//       addToLog('Disconnected from MQTT broker');
//     }
//   };
  
//   // Start continuous simulation
//   const startSimulation = async () => {
//     if (!mqttSender) return;
    
//     try {
//       setIsSimulating(true);
//       addToLog('Starting data simulation...');
      
//       // Start a continuous simulation loop
//       const simulationLoop = async () => {
//         if (!isSimulating) return;
        
//         try {
//           // Generate data points
//           await sendSingleDataPoint();
          
//           // Schedule next update
//           setTimeout(simulationLoop, 5000);
//         } catch (error) {
//           addToLog(`Simulation error: ${error instanceof Error ? error.message : String(error)}`);
//           setIsSimulating(false);
//         }
//       };
      
//       // Start the loop
//       simulationLoop();
      
//     } catch (err) {
//       setError(`Simulation error: ${err instanceof Error ? err.message : String(err)}`);
//       setIsSimulating(false);
//     }
//   };
  
//   // Stop simulation
//   const stopSimulation = () => {
//     setIsSimulating(false);
//     addToLog('Simulation stopped');
//   };
  
//   // Send a single data point
//   const sendSingleDataPoint = async () => {
//     if (!mqttSender) return;
    
//     try {
//       const now = new Date();
      
//       // Generate data with or without random variation
//       const variation = (value: number, amount: number): number => {
//         return includeRandomVariation ? 
//           value + ((Math.random() * 2 - 1) * amount) : 
//           value;
//       };
      
//       // Generate 3 data points with timestamps close together
//       const fingerData = [];
//       const beltData = [];
      
//       for (let i = 0; i < 3; i++) {
//         const timestamp = new Date(now.getTime() - (2 - i) * 1000);
        
//         // Finger data
//         fingerData.push({
//           timestamp,
//           spo2: variation(spo2, 1),
//           bpm: variation(heartRate, 2)
//         });
        
//         // Belt data
//         beltData.push({
//           timestamp,
//           ecg: variation(ecgValue, 0.1),
//           piezoelectric_voltage: variation(piezoValue, 0.1)
//         });
//       }
      
//       // Send data
//       await mqttSender.sendFingerData(fingerData, batteryLevel);
//       await mqttSender.sendBeltData(beltData, batteryLevel);
      
//       // Send device status
//       await mqttSender.sendDeviceStatus('active', batteryLevel);
      
//       addToLog(`Sent data points - HR: ${heartRate}, SpO2: ${spo2}, Battery: ${batteryLevel}%`);
      
//       // Apply small changes to values for next time if simulating
//       if (isSimulating && includeRandomVariation) {
//         setHeartRate(prev => Math.max(60, Math.min(110, prev + (Math.random() * 6 - 3))));
//         setSpo2(prev => Math.max(90, Math.min(100, prev + (Math.random() * 2 - 1))));
//         setBatteryLevel(prev => Math.max(10, Math.min(100, prev - Math.random() * 0.5)));
//       }
      
//     } catch (err) {
//       setError(`Send error: ${err instanceof Error ? err.message : String(err)}`);
//       addToLog(`Send error: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   };
  
//   // Helper to add to log with timestamp
//   const addToLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLog(prev => [...prev, `[${timestamp}] ${message}`].slice(-20)); // Keep last 20 messages
//   };
  
//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>MQTT Test Panel</CardTitle>
//         <CardDescription>Send test data to MQTT broker for SleepSense</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {error && (
//           <Alert className="mb-4 text-red-800 border-red-200 bg-red-50">
//             <AlertCircle className="w-4 h-4 text-red-600" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         <div className="grid gap-4">
//           <div className="flex items-end gap-4">
//             <div className="flex-1">
//               <Label htmlFor="deviceId">Device ID</Label>
//               <Input
//                 id="deviceId"
//                 value={deviceId}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeviceId(e.target.value)}
//                 placeholder="Enter device serial number"
//                 disabled={isConnected}
//               />
//             </div>
//             {!isConnected ? (
//               <Button onClick={connectMqtt}>Connect</Button>
//             ) : (
//               <Button variant="destructive" onClick={disconnectMqtt}>Disconnect</Button>
//             )}
//           </div>
          
//           {isConnected && (
//             <Tabs defaultValue="manual" className="mt-2">
//               <TabsList>
//                 <TabsTrigger value="manual">Manual Control</TabsTrigger>
//                 <TabsTrigger value="simulation">Simulation</TabsTrigger>
//                 <TabsTrigger value="log">Log</TabsTrigger>
//               </TabsList>
              
//               <TabsContent value="manual">
//                 <div className="grid gap-4 p-4 border rounded-md">
//                   <h3 className="text-sm font-medium">Sensor Values</h3>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
//                         <span className="text-sm font-medium">{Math.round(heartRate)}</span>
//                       </div>
//                       <Slider
//                         id="heartRate"
//                         min={40}
//                         max={120}
//                         step={1}
//                         value={[heartRate]}
//                         onValueChange={(value: number[]) => setHeartRate(value[0])}
//                       />
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="spo2">SpO₂ (%)</Label>
//                         <span className="text-sm font-medium">{Math.round(spo2)}</span>
//                       </div>
//                       <Slider
//                         id="spo2"
//                         min={85}
//                         max={100}
//                         step={1}
//                         value={[spo2]}
//                         onValueChange={(value: number[]) => setSpo2(value[0])}
//                       />
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="ecgValue">ECG Value (mV)</Label>
//                         <span className="text-sm font-medium">{ecgValue.toFixed(2)}</span>
//                       </div>
//                       <Slider
//                         id="ecgValue"
//                         min={-1}
//                         max={1}
//                         step={0.1}
//                         value={[ecgValue]}
//                         onValueChange={(value: number[]) => setEcgValue(value[0])}
//                       />
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="piezoValue">Piezoelectric Value</Label>
//                         <span className="text-sm font-medium">{piezoValue.toFixed(2)}</span>
//                       </div>
//                       <Slider
//                         id="piezoValue"
//                         min={-1}
//                         max={1}
//                         step={0.1}
//                         value={[piezoValue]}
//                         onValueChange={(value: number[]) => setPiezoValue(value[0])}
//                       />
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="batteryLevel">Battery Level (%)</Label>
//                         <span className="text-sm font-medium">{Math.round(batteryLevel)}</span>
//                       </div>
//                       <Slider
//                         id="batteryLevel"
//                         min={0}
//                         max={100}
//                         step={1}
//                         value={[batteryLevel]}
//                         onValueChange={(value: number[]) => setBatteryLevel(value[0])}
//                       />
//                     </div>
                    
//                     <Button 
//                       className="flex items-center w-full gap-2"
//                       onClick={sendSingleDataPoint}
//                     >
//                       <Send className="w-4 h-4" />
//                       Send Data
//                     </Button>
//                   </div>
//                 </div>
//               </TabsContent>
              
//               <TabsContent value="simulation">
//                 <div className="grid gap-4 p-4 border rounded-md">
//                   <h3 className="text-sm font-medium">Simulation Settings</h3>
                  
//                   <div className="space-y-4">
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         id="random-variation"
//                         checked={includeRandomVariation}
//                         onCheckedChange={setIncludeRandomVariation}
//                       />
//                       <Label htmlFor="random-variation">Include random variation</Label>
//                     </div>
                    
//                     <div className="flex justify-center gap-4">
//                       {!isSimulating ? (
//                         <Button 
//                           className="flex items-center gap-2"
//                           onClick={startSimulation}
//                         >
//                           <Play className="w-4 h-4" />
//                           Start Simulation
//                         </Button>
//                       ) : (
//                         <Button 
//                           variant="destructive"
//                           className="flex items-center gap-2"
//                           onClick={stopSimulation}
//                         >
//                           <Square className="w-4 h-4" />
//                           Stop Simulation
//                         </Button>
//                       )}
//                     </div>
                    
//                     <div className="p-2 text-sm text-gray-500 border rounded">
//                       Simulation will send data every 5 seconds with the current settings.
//                       Data values will change slightly over time if random variation is enabled.
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>
              
//               <TabsContent value="log">
//                 <div className="h-64 p-2 overflow-y-auto border rounded">
//                   {log.length === 0 ? (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                       No logs yet. Connect and send data to see activity.
//                     </div>
//                   ) : (
//                     <div className="space-y-1 font-mono text-xs">
//                       {log.map((entry, i) => (
//                         <div key={i} className="py-0.5 border-b border-gray-100">
//                           {entry}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </TabsContent>
//             </Tabs>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default MqttTestComponent;