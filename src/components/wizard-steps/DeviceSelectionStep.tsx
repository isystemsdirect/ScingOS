'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, 
  Camera, 
  Thermometer, 
  Zap, 
  Layers, 
  CheckCircle2,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';
import { LiDARDevice } from '@/lib/lari-lidar-controller';
import { CaptureSession } from '../NewCaptureWizard';
import toast from 'react-hot-toast';


interface DeviceSelectionStepProps {
  captureSession: CaptureSession;
  setCaptureSession: (session: CaptureSession) => void;
  availableDevices: LiDARDevice[];
  isScingActive: boolean;
  currentAIGuidance: string;
}

const deviceTypes = [
  {
    type: 'lidar' as const,
    name: 'LiDAR Scanner',
    description: 'Precise 3D point cloud capture with millimeter accuracy',
    icon: <Radar className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-700',
    capabilities: ['3D Point Clouds', 'Precise Measurements', 'Real-time Visualization']
  },
  {
    type: 'camera' as const,
    name: 'High-Resolution Camera',
    description: 'Visual documentation and photogrammetry',
    icon: <Camera className="w-8 h-8" />,
    color: 'from-green-500 to-green-700',
    capabilities: ['4K+ Resolution', 'HDR Capture', 'Photogrammetry']
  },
  {
    type: 'thermal' as const,
    name: 'Thermal Imaging',
    description: 'Temperature analysis and energy efficiency detection',
    icon: <Thermometer className="w-8 h-8" />,
    color: 'from-red-500 to-red-700',
    capabilities: ['Temperature Mapping', 'Energy Analysis', 'Moisture Detection']
  },
  {
    type: 'spectrometer' as const,
    name: 'LARI-Prism Spectrometer',
    description: 'Advanced spectral analysis and material identification',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-700',
    capabilities: ['Material Analysis', 'Chemical Detection', 'Quality Assessment']
  },
  {
    type: 'multi_sensor' as const,
    name: 'Multi-Sensor Fusion',
    description: 'Combined data from multiple devices for comprehensive analysis',
    icon: <Layers className="w-8 h-8" />,
    color: 'from-indigo-500 to-indigo-700',
    capabilities: ['Data Fusion', 'Comprehensive Analysis', 'AI-Enhanced Insights']
  }
];

export const DeviceSelectionStep: React.FC<DeviceSelectionStepProps> = ({
  captureSession,
  setCaptureSession,
  availableDevices,
}) => {
  const handleDeviceTypeSelect = (deviceType: CaptureSession['deviceType']) => {
    setCaptureSession({
      ...captureSession,
      deviceType,
      selectedDevices: [] // Reset device selection when changing type
    });
  };

  const handleDeviceSelect = (deviceId: string) => {
    const isSelected = captureSession.selectedDevices.includes(deviceId);
    
    setCaptureSession({
      ...captureSession,
      selectedDevices: isSelected 
        ? captureSession.selectedDevices.filter(id => id !== deviceId)
        : [...captureSession.selectedDevices, deviceId]
    });
  };

  const getDeviceStatusColor = (status: LiDARDevice['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'scanning': return 'text-blue-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDeviceStatusIcon = (status: LiDARDevice['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'scanning': return <Signal className="w-4 h-4 animate-pulse" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Type Selection */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Choose Device Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deviceTypes.map((device) => (
            <motion.div
              key={device.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDeviceTypeSelect(device.type)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                captureSession.deviceType === device.type
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
              }`}
            >
              {/* Selection Indicator */}
              {captureSession.deviceType === device.type && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Device Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${device.color} rounded-xl flex items-center justify-center text-white mb-3 mx-auto`}>
                {device.icon}
              </div>

              {/* Device Info */}
              <div className="text-center">
                <h4 className="text-white font-semibold mb-2">{device.name}</h4>
                <p className="text-gray-300 text-sm mb-3">{device.description}</p>
                
                {/* Capabilities */}
                <div className="space-y-1">
                  {device.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full" />
                      <span className="text-gray-400 text-xs">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specific Device Selection */}
      {captureSession.deviceType !== 'multi_sensor' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Select {deviceTypes.find(d => d.type === captureSession.deviceType)?.name} Device
          </h3>
          
          {availableDevices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDevices.map((device) => (
                <motion.div
                  key={device.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleDeviceSelect(device.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    captureSession.selectedDevices.includes(device.id)
                      ? 'border-green-500 bg-green-600/20'
                      : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getDeviceStatusColor(device.status)}`}>
                        {getDeviceStatusIcon(device.status)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{device.name}</h4>
                        <p className="text-gray-400 text-sm capitalize">{device.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    {captureSession.selectedDevices.includes(device.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Device Specifications */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-700/50 rounded p-2">
                      <p className="text-gray-400">Max Range</p>
                      <p className="text-white font-mono">{device.capabilities.maxRange}m</p>
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <p className="text-gray-400">Accuracy</p>
                      <p className="text-white font-mono">±{device.capabilities.accuracy}m</p>
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <p className="text-gray-400">Points/sec</p>
                      <p className="text-white font-mono">{(device.capabilities.pointsPerSecond / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <p className="text-gray-400">Connection</p>
                      <p className="text-white font-mono capitalize">{device.connection}</p>
                    </div>
                  </div>

                  {/* Device Status */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-sm capitalize ${getDeviceStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                    
                    {device.status === 'connected' && (
                      <div className="flex items-center space-x-1 text-green-400 text-xs">
                        <Battery className="w-3 h-3" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-gray-300 font-medium mb-2">No Devices Available</h4>
              <p className="text-gray-500 text-sm">
                Please connect your {captureSession.deviceType} devices and refresh.
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Refresh Devices
              </button>
            </div>
          )}
        </div>
      )}

      {/* Multi-sensor Selection */}
      {captureSession.deviceType === 'multi_sensor' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Select Multiple Devices for Fusion</h3>
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-blue-300 mb-2">
              <Layers className="w-5 h-5" />
              <span className="font-medium">Multi-Sensor Fusion Mode</span>
            </div>
            <p className="text-blue-100 text-sm">
              Select multiple devices to capture synchronized data streams. The system will automatically 
              align and fuse data from different sensors for comprehensive analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDevices.map((device) => (
              <motion.div
                key={device.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleDeviceSelect(device.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  captureSession.selectedDevices.includes(device.id)
                    ? 'border-green-500 bg-green-600/20'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                }`}
              >
                {/* Device card content same as above */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getDeviceStatusColor(device.status)}`} />
                    <div>
                      <h4 className="text-white font-semibold">{device.name}</h4>
                      <p className="text-gray-400 text-sm capitalize">{device.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {captureSession.selectedDevices.includes(device.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {captureSession.selectedDevices.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-600/10 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-green-300 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  {captureSession.selectedDevices.length} Devices Selected for Fusion
                </span>
              </div>
              <p className="text-green-100 text-sm">
                Data streams will be automatically synchronized and fused for comprehensive analysis.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      {captureSession.deviceType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-purple-300 mb-2">
            <Brain className="w-5 h-5" />
            <span className="font-medium">Scing AI Recommendation</span>
          </div>
          <p className="text-purple-100 text-sm">
            {captureSession.deviceType === 'lidar' && 
              "LiDAR is excellent for structural analysis. I recommend high resolution for detailed building inspections."}
            {captureSession.deviceType === 'camera' && 
              "Camera capture is perfect for visual documentation. Consider enabling HDR for better dynamic range."}
            {captureSession.deviceType === 'thermal' && 
              "Thermal imaging will reveal energy inefficiencies. Best results in morning or evening hours."}
            {captureSession.deviceType === 'spectrometer' && 
              "LARI-Prism spectrometer provides material identification. Ensure clean sample surfaces for accurate analysis."}
            {captureSession.deviceType === 'multi_sensor' && 
              "Multi-sensor fusion provides the most comprehensive data. I'll automatically handle synchronization and alignment."}
          </p>
        </motion.div>
      )}
    </div>
  );
};
