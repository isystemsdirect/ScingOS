'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Activity, Zap, Gauge, MapPin, Camera, Thermometer } from 'lucide-react';
import type { DroneStatus, SensorData, DroneConfig, FlightConfig, ComplianceStatus, ActivityLog } from '@/lib/drone-types';

import { SensorDataPane } from './SensorDataPane';
import { FlightControllerConfig } from './FlightControllerConfig';
import { ECUManagement } from './ECUManagement';
import { FAACompliancePanel } from './FAACompliancePanel';
import { LARIAutonomousControl } from './LARIAutonomousControl';

// Mock data subscription
const subscribeToRealtimeData = (droneId: string, callback: (data: any) => void) => {
  console.log(`Subscribing to real-time data for drone: ${droneId}`);
  const interval = setInterval(() => {
    callback({
      connected: Math.random() > 0.1,
      health: 75 + Math.random() * 25,
      status: {
        flightMode: ['STANDBY', 'ARMED', 'TAKING_OFF', 'IN_FLIGHT', 'LANDING'][Math.floor(Math.random() * 5)],
        battery: Math.floor(Math.random() * 100),
        diagnostics: {
          motor_check: Math.random() > 0.1,
          imu_calibration: Math.random() > 0.05,
          gps_signal: Math.random() > 0.15,
        },
        recentActivities: [
          { timestamp: new Date().toISOString(), message: 'System armed' },
          { timestamp: new Date(Date.now() - 5000).toISOString(), message: 'GPS lock acquired' },
        ],
        flightConfig: { currentMode: 'ALTITUDE_HOLD' },
        lariStatus: { autonomous: false, mission: 'None' },
        faaCompliance: { aiCertified: true }
      },
      sensors: {
        altitude: (Math.random() * 100).toFixed(1),
        gps: { satellites: Math.floor(Math.random() * 15) },
        imu: { pitch: (Math.random() * 10 - 5).toFixed(2), roll: (Math.random() * 10 - 5).toFixed(2), yaw: (Math.random() * 360).toFixed(2) },
        barometer: { pressure: (1010 + Math.random() * 10).toFixed(2) },
        camera: { status: 'OK', resolution: '4K', fps: 30 },
        thermal: { temp_min: 15.5, temp_max: 35.2 },
        lidar: { range: (Math.random() * 50).toFixed(1) },
        wind: { speed: (Math.random() * 15).toFixed(1) },
        power: { voltage: (14.8 + Math.random()).toFixed(2), current: (10 + Math.random() * 5).toFixed(2) },
        ecu: { rpm: Math.floor(Math.random() * 5000) + 1000, temp: (80 + Math.random() * 10).toFixed(1) }
      }
    });
  }, 2000);

  return () => {
    console.log(`Unsubscribing from drone: ${droneId}`);
    clearInterval(interval);
  };
};

// Sub-components for Overview Tab
const QuickStatusCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) => (
  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
    <CardContent className="p-4 flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const DroneStatusOverview = ({ droneStatus, sensorData, isConnected }: { droneStatus: DroneStatus | null; sensorData: SensorData; isConnected: boolean }) => (
  <Card className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm border-gray-700">
    <CardHeader><CardTitle className="text-white">Status Overview</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <p>Flight Mode: {droneStatus?.flightMode || 'N/A'}</p>
      <p>Battery: {droneStatus?.battery || 'N/A'}%</p>
      <p>Altitude: {sensorData.altitude || 'N/A'} m</p>
      <p>GPS Satellites: {sensorData.gps?.satellites || 'N/A'}</p>
    </CardContent>
  </Card>
);

const SystemHealthDashboard = ({ health, diagnostics }: { health: number; diagnostics?: Record<string, boolean> }) => (
  <Card className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm border-gray-700">
    <CardHeader><CardTitle className="text-white">System Health</CardTitle></CardHeader>
    <CardContent>
      <Progress value={health} />
      <div className="mt-4 space-y-2">
        {diagnostics && Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
            <span className={value ? 'text-green-400' : 'text-red-400'}>{value ? 'OK' : 'FAIL'}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RecentActivity = ({ activities }: { activities: ActivityLog[] }) => (
  <Card className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm border-gray-700">
    <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
    <CardContent className="space-y-2">
      {activities.slice(0, 5).map((activity, index) => (
        <p key={index} className="text-xs text-gray-400">
          <span className="text-gray-500 mr-2">{new Date(activity.timestamp).toLocaleTimeString()}</span>
          {activity.message}
        </p>
      ))}
    </CardContent>
  </Card>
);


interface DroneBuilderControlPanelProps {
  droneId: string;
  onConfigChange?: (config: DroneConfig) => void;
}

export function DroneBuilderControlPanel({ droneId, onConfigChange }: DroneBuilderControlPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [droneStatus, setDroneStatus] = useState<DroneStatus | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState(85);
  
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeData(droneId, (data) => {
      setDroneStatus(data.status);
      setSensorData(data.sensors);
      setIsConnected(data.connected);
      setSystemHealth(data.health);
    });
    
    return unsubscribe;
  }, [droneId]);

  return (
    <div className="drone-builder-control-panel min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <div className={`absolute inset-0 w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-ping opacity-75`} />
            </div>
            <h1 className="text-3xl font-bold text-white">SCINGULA AI Drone Builder</h1>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'CONNECTED' : 'OFFLINE'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">System Health</p>
              <div className="flex items-center space-x-2">
                <Progress value={systemHealth} className="w-24" />
                <span className="text-white font-semibold">{systemHealth}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <QuickStatusCard 
            icon={<Activity className="w-5 h-5" />}
            title="Flight Status"
            value={droneStatus?.flightMode || 'STANDBY'}
            color="blue"
          />
          <QuickStatusCard 
            icon={<Zap className="w-5 h-5" />}
            title="Battery"
            value={`${droneStatus?.battery || 0}%`}
            color={droneStatus?.battery > 50 ? 'green' : droneStatus?.battery > 20 ? 'yellow' : 'red'}
          />
          <QuickStatusCard 
            icon={<Gauge className="w-5 h-5" />}
            title="Altitude"
            value={`${sensorData.altitude || 0}m`}
            color="purple"
          />
          <QuickStatusCard 
            icon={<MapPin className="w-5 h-5" />}
            title="GPS Lock"
            value={sensorData.gps?.satellites || 0}
            color="indigo"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
          <TabsTrigger value="sensors" className="data-[state=active]:bg-purple-600">Sensors</TabsTrigger>
          <TabsTrigger value="flight" className="data-[state=active]:bg-purple-600">Flight Control</TabsTrigger>
          <TabsTrigger value="ecu" className="data-[state=active]:bg-purple-600">ECU</TabsTrigger>
          <TabsTrigger value="lari" className="data-[state=active]:bg-purple-600">LARI AI</TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-purple-600">FAA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DroneStatusOverview 
              droneStatus={droneStatus}
              sensorData={sensorData}
              isConnected={isConnected}
            />
            <SystemHealthDashboard 
              health={systemHealth}
              diagnostics={droneStatus?.diagnostics}
            />
            <RecentActivity 
              activities={droneStatus?.recentActivities || []}
            />
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="mt-6">
          <SensorDataPane 
            sensorData={sensorData}
            droneId={droneId}
            onSensorToggle={(sensorId, enabled) => {
              console.log(`Toggled sensor ${sensorId} to ${enabled}`);
            }}
          />
        </TabsContent>

        <TabsContent value="flight" className="mt-6">
          <FlightControllerConfig 
            droneId={droneId}
            currentConfig={droneStatus?.flightConfig}
            onConfigUpdate={onConfigChange}
          />
        </TabsContent>

        <TabsContent value="ecu" className="mt-6">
          <ECUManagement 
            droneId={droneId}
            ecuData={sensorData?.ecu}
            onECUCommand={(command) => {
              console.log(`ECU command: ${command}`);
            }}
          />
        </TabsContent>

        <TabsContent value="lari" className="mt-6">
          <LARIAutonomousControl 
            droneId={droneId}
            aiStatus={droneStatus?.lariStatus}
            onAIToggle={(enabled) => {
              console.log(`Toggled LARI AI to ${enabled}`);
            }}
          />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <FAACompliancePanel 
            droneId={droneId}
            complianceStatus={droneStatus?.faaCompliance}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
