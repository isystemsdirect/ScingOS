'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, Clock, Brain, Target, Layers } from 'lucide-react';
import { CaptureSession } from '../NewCaptureWizard';
import toast from 'react-hot-toast';

const deviceTypes = [
  { type: 'lidar' as const, name: 'LiDAR Scanner' },
  { type: 'camera' as const, name: 'High-Resolution Camera' },
  { type: 'thermal' as const, name: 'Thermal Imaging' },
  { type: 'spectrometer' as const, name: 'LARI-Prism Spectrometer' },
  { type: 'multi_sensor' as const, name: 'Multi-Sensor Fusion' }
];

interface CaptureSettingsStepProps {
  captureSession: CaptureSession;
  setCaptureSession: (session: CaptureSession) => void;
  isScingActive: boolean;
}

export const CaptureSettingsStep: React.FC<CaptureSettingsStepProps> = ({
  captureSession,
  setCaptureSession,
}) => {
  const updateSettings = (key: keyof CaptureSession['captureSettings'], value: any) => {
    setCaptureSession({
      ...captureSession,
      captureSettings: {
        ...captureSession.captureSettings,
        [key]: value
      }
    });
  };

  const resolutionOptions = [
    { value: 'low', label: 'Low (500K points)', description: 'Fast scanning, basic detail', icon: '🟢' },
    { value: 'medium', label: 'Medium (1M points)', description: 'Balanced speed and detail', icon: '🟡' },
    { value: 'high', label: 'High (5M points)', description: 'High detail, longer scan time', icon: '🟠' },
    { value: 'ultra', label: 'Ultra (10M+ points)', description: 'Maximum detail, professional grade', icon: '🔴' }
  ];

  const getRecommendedSettings = () => {
    switch (captureSession.deviceType) {
      case 'lidar':
        return {
          resolution: 'high',
          realTimeProcessing: true,
          aiAnalysis: true,
          description: 'Recommended for structural inspections with high accuracy requirements'
        };
      case 'camera':
        return {
          resolution: 'ultra',
          realTimeProcessing: false,
          aiAnalysis: true,
          description: 'Recommended for visual documentation and photogrammetry'
        };
      case 'thermal':
        return {
          resolution: 'medium',
          realTimeProcessing: true,
          aiAnalysis: true,
          description: 'Recommended for energy efficiency analysis'
        };
      case 'multi_sensor':
        return {
          resolution: 'high',
          realTimeProcessing: true,
          aiAnalysis: true,
          description: 'Recommended for comprehensive multi-modal analysis'
        };
      default:
        return null;
    }
  };

  const recommended = getRecommendedSettings();

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">Capture Configuration</h3>
        <p className="text-gray-300">
          Optimize settings for {deviceTypes.find(d => d.type === captureSession.deviceType)?.name}
        </p>
      </div>

      {/* AI Recommendations */}
      {recommended && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-purple-300">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Scing AI Recommendations</span>
            </div>
            <button
              onClick={() => {
                updateSettings('resolution', recommended.resolution);
                updateSettings('realTimeProcessing', recommended.realTimeProcessing);
                updateSettings('aiAnalysis', recommended.aiAnalysis);
                toast.success('Applied AI recommendations!');
              }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              Apply All
            </button>
          </div>
          <p className="text-purple-100 text-sm mb-3">{recommended.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-purple-500/20 rounded p-2 text-center">
              <p className="text-purple-200">Resolution</p>
              <p className="text-white font-semibold capitalize">{recommended.resolution}</p>
            </div>
            <div className="bg-purple-500/20 rounded p-2 text-center">
              <p className="text-purple-200">Real-time</p>
              <p className="text-white font-semibold">{recommended.realTimeProcessing ? 'ON' : 'OFF'}</p>
            </div>
            <div className="bg-purple-500/20 rounded p-2 text-center">
              <p className="text-purple-200">AI Analysis</p>
              <p className="text-white font-semibold">{recommended.aiAnalysis ? 'ON' : 'OFF'}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resolution Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Capture Resolution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resolutionOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              onClick={() => updateSettings('resolution', option.value)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                captureSession.captureSettings.resolution === option.value
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h5 className="text-white font-medium">{option.label}</h5>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                </div>
                {captureSession.captureSettings.resolution === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Processing Options
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real-time Processing */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h5 className="text-white font-medium">Real-time Processing</h5>
                  <p className="text-gray-400 text-sm">Process data as it's captured</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={captureSession.captureSettings.realTimeProcessing}
                  onChange={(e) => updateSettings('realTimeProcessing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h5 className="text-white font-medium">AI Analysis</h5>
                  <p className="text-gray-400 text-sm">Intelligent pattern recognition</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={captureSession.captureSettings.aiAnalysis}
                  onChange={(e) => updateSettings('aiAnalysis', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Auto Start */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h5 className="text-white font-medium">Auto Start Capture</h5>
                  <p className="text-gray-400 text-sm">Begin capture immediately</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={captureSession.captureSettings.autoStart}
                  onChange={(e) => updateSettings('autoStart', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Duration Setting */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h5 className="text-white font-medium">Capture Duration</h5>
                <p className="text-gray-400 text-sm">Maximum capture time (optional)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="30"
                max="3600"
                step="30"
                value={captureSession.captureSettings.duration || 300}
                onChange={(e) => updateSettings('duration', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono text-sm w-20">
                {Math.floor((captureSession.captureSettings.duration || 300) / 60)}:{
                  String((captureSession.captureSettings.duration || 300) % 60).padStart(2, '0')
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/30 rounded-lg p-4"
      >
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Configuration Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-700/50 rounded p-3 text-center">
            <p className="text-gray-400 mb-1">Device Type</p>
            <p className="text-white font-semibold capitalize">{captureSession.deviceType.replace('_', ' ')}</p>
          </div>
          <div className="bg-gray-700/50 rounded p-3 text-center">
            <p className="text-gray-400 mb-1">Resolution</p>
            <p className="text-white font-semibold capitalize">{captureSession.captureSettings.resolution}</p>
          </div>
          <div className="bg-gray-700/50 rounded p-3 text-center">
            <p className="text-gray-400 mb-1">Real-time</p>
            <p className="text-white font-semibold">{captureSession.captureSettings.realTimeProcessing ? 'ON' : 'OFF'}</p>
          </div>
          <div className="bg-gray-700/50 rounded p-3 text-center">
            <p className="text-gray-400 mb-1">AI Analysis</p>
            <p className="text-white font-semibold">{captureSession.captureSettings.aiAnalysis ? 'ON' : 'OFF'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
