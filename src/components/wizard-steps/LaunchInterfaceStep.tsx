'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  CheckCircle, 
  Loader2, 
  ExternalLink, 
} from 'lucide-react';
import { CaptureSession } from '../NewCaptureWizard';
import toast from 'react-hot-toast';

interface LaunchInterfaceStepProps {
  captureSession: CaptureSession;
}

export const LaunchInterfaceStep: React.FC<LaunchInterfaceStepProps> = ({
  captureSession,
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchSteps, setLaunchSteps] = useState([
    { name: 'Initializing devices', status: 'pending' },
    { name: 'Configuring capture settings', status: 'pending' },
    { name: 'Starting AI analysis engine', status: 'pending' },
    { name: 'Opening capture interface', status: 'pending' }
  ]);

  useEffect(() => {
    if (isLaunching) {
      simulateLaunch();
    }
  }, [isLaunching]);

  const simulateLaunch = async () => {
    const steps = [...launchSteps];
    
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'processing';
      setLaunchSteps([...steps]);
      setLaunchProgress((i + 0.5) / steps.length);
      
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      steps[i].status = 'completed';
      setLaunchSteps([...steps]);
      setLaunchProgress((i + 1) / steps.length);
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    toast.success('🚀 Launching capture interface...');
  };

  const getInterfaceDescription = () => {
    switch (captureSession.deviceType) {
      case 'lidar':
        return {
          title: 'LARI LiDAR Advanced Interface',
          features: ['Real-time 3D point cloud visualization', 'Live mesh generation', 'AI-driven object detection', 'Professional export formats'],
          url: '/workstation/lidar'
        };
      case 'camera':
        return {
          title: 'Advanced Camera Capture Interface',
          features: ['4K+ resolution capture', 'Real-time preview', 'HDR processing', 'Automated documentation'],
          url: '/workstation/camera'
        };
      case 'thermal':
        return {
          title: 'Thermal Analysis Interface',
          features: ['Temperature mapping', 'Energy efficiency analysis', 'Anomaly detection', 'Report generation'],
          url: '/workstation/thermal'
        };
      case 'spectrometer':
        return {
          title: 'LARI-Prism Spectrometer Interface',
          features: ['Spectral analysis', 'Material identification', 'Quality assessment', 'Chemical detection'],
          url: '/workstation/prism'
        };
      case 'multi_sensor':
        return {
          title: 'Multi-Sensor Fusion Interface',
          features: ['Synchronized data streams', 'Data fusion algorithms', 'Comprehensive analysis', 'AI-enhanced insights'],
          url: '/workstation/fusion'
        };
      default:
        return {
          title: 'Capture Interface',
          features: ['Real-time processing', 'AI analysis', 'Data export'],
          url: '/capture'
        };
    }
  };

  const interfaceInfo = getInterfaceDescription();

  return (
    <div className="space-y-6 text-center">
      {/* Launch Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-semibold text-white mb-2">Ready to Launch</h3>
        <p className="text-gray-300">Your capture session is configured and ready to begin</p>
      </motion.div>

      {/* Interface Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-600/50"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h4 className="text-xl font-semibold text-white mb-3">{interfaceInfo.title}</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {interfaceInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-left">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <p className="text-gray-400 mb-1">Devices</p>
              <p className="text-white font-semibold">{captureSession.selectedDevices.length || 1}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">Resolution</p>
              <p className="text-white font-semibold capitalize">{captureSession.captureSettings.resolution}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">AI Analysis</p>
              <p className="text-green-400 font-semibold">{captureSession.captureSettings.aiAnalysis ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">Auto Start</p>
              <p className="text-blue-400 font-semibold">{captureSession.captureSettings.autoStart ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Launch Process */}
      {isLaunching && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-white mb-4">Launching Interface...</h4>
          
          {/* Progress Steps */}
          <div className="space-y-3">
            {launchSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'processing' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : step.status === 'processing' ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${
                  step.status === 'completed' ? 'text-green-300' :
                  step.status === 'processing' ? 'text-blue-300' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Launch Progress</span>
              <span>{Math.round(launchProgress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${launchProgress * 100}%` }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Launch Button */}
      {!isLaunching && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLaunch}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
        >
          <Rocket className="w-6 h-6" />
          <span className="text-lg">Launch Capture Interface</span>
        </motion.button>
      )}

      {/* Completion Message */}
      {launchProgress === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-600/10 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-center space-x-2 text-green-300 mb-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">Launch Successful!</span>
          </div>
          <p className="text-green-100 text-sm">
            {interfaceInfo.title} is now opening in a new window. Your capture session is ready to begin!
          </p>
        </motion.div>
      )}
    </div>
  );
};
