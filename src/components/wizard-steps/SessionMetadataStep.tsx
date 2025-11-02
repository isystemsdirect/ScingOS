'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, FileText, Calendar, Hash } from 'lucide-react';
import { CaptureSession } from '../NewCaptureWizard';
import toast from 'react-hot-toast';

interface SessionMetadataStepProps {
  captureSession: CaptureSession;
  setCaptureSession: (session: CaptureSession) => void;
  isScingActive: boolean;
}

export const SessionMetadataStep: React.FC<SessionMetadataStepProps> = ({
  captureSession,
  setCaptureSession,
}) => {
  const updateMetadata = (key: keyof CaptureSession['metadata'], value: string) => {
    setCaptureSession({
      ...captureSession,
      metadata: {
        ...captureSession.metadata,
        [key]: value
      }
    });
  };

  const generateAutoProjectName = () => {
    const deviceType = captureSession.deviceType.replace('_', '-').toUpperCase();
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    const autoName = `${deviceType}_CAPTURE_${timestamp}`;
    
    updateMetadata('projectName', autoName);
    toast.success('Auto-generated project name!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">Session Information</h3>
        <p className="text-gray-300">Add context and metadata for your capture session</p>
      </div>

      {/* Session ID Display */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
            <Hash className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h5 className="text-white font-medium">Session ID</h5>
            <p className="text-gray-300 font-mono text-sm">{captureSession.sessionId}</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Project Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={captureSession.metadata.projectName}
              onChange={(e) => updateMetadata('projectName', e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              onClick={generateAutoProjectName}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs rounded transition-colors"
            >
              Auto
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </label>
          <input
            type="text"
            value={captureSession.metadata.location}
            onChange={(e) => updateMetadata('location', e.target.value)}
            placeholder="Building address or coordinates..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Operator */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Operator
          </label>
          <input
            type="text"
            value={captureSession.metadata.operator}
            onChange={(e) => updateMetadata('operator', e.target.value)}
            placeholder="Inspector or operator name..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Date/Time Display */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Capture Date/Time
          </label>
          <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-white font-medium mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Session Notes
        </label>
        <textarea
          value={captureSession.metadata.notes}
          onChange={(e) => updateMetadata('notes', e.target.value)}
          placeholder="Add any relevant notes about this capture session..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
        />
      </div>

      {/* AI Suggestions */}
      {captureSession.deviceType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-purple-300 mb-2">
            <Brain className="w-5 h-5" />
            <span className="font-medium">AI Metadata Suggestions</span>
          </div>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => updateMetadata('notes', `${captureSession.deviceType.toUpperCase()} capture session for structural analysis and documentation. High-resolution scanning with real-time processing enabled.`)}
              className="text-left w-full p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-100 transition-colors"
            >
              💡 Auto-generate technical notes
            </button>
            <button
              onClick={() => updateMetadata('location', 'GPS coordinates will be auto-detected during capture')}
              className="text-left w-full p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-100 transition-colors"
            >
              📍 Use GPS auto-detection for location
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
