
'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LiDAR3DViewer } from './LiDAR3DViewer';
import { lariCameraLiDARFusion, LiveFusionData, DetectedObject } from '@/lib/lari-camera-lidar-fusion';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Video, 
  Camera, 
  Radar,
  Eye,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Layers,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LiveFusionViewer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fusionData, setFusionData] = useState<LiveFusionData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [liveReport, setLiveReport] = useState<string>('');
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [reportUpdateInterval, setReportUpdateInterval] = useState<number | null>(null);

  // Initialize fusion system
  useEffect(() => {
    // Setup event listeners
    const handleFusionDataUpdated = (data: LiveFusionData) => {
      setFusionData(data);
    };

    const handleCameraInitialized = (data: { videoElement: HTMLVideoElement }) => {
      if (videoRef.current) {
        // Copy video stream to our display element
        videoRef.current.srcObject = data.videoElement.srcObject;
      }
    };

    lariCameraLiDARFusion.on('fusionDataUpdated', handleFusionDataUpdated);
    lariCameraLiDARFusion.on('cameraInitialized', handleCameraInitialized);

    return () => {
      lariCameraLiDARFusion.cleanup();
    };
  }, []);

  // Live reporting
  useEffect(() => {
    if (isActive && !reportUpdateInterval) {
      const interval = window.setInterval(() => {
        const report = lariCameraLiDARFusion.generateLiveReport();
        setLiveReport(report);
      }, 1000); // Update every second

      setReportUpdateInterval(interval);
    } else if (!isActive && reportUpdateInterval) {
      clearInterval(reportUpdateInterval);
      setReportUpdateInterval(null);
    }

    return () => {
      if (reportUpdateInterval) {
        clearInterval(reportUpdateInterval);
      }
    };
  }, [isActive, reportUpdateInterval]);

  const toggleFusion = useCallback(() => {
    if (isActive) {
      lariCameraLiDARFusion.stopLiveFusion();
      setIsActive(false);
      toast.success('Live fusion stopped');
    } else {
      lariCameraLiDARFusion.startLiveFusion();
      setIsActive(true);
      toast.success('Live fusion started');
    }
  }, [isActive]);

  const exportReport = useCallback(() => {
    if (liveReport) {
      const blob = new Blob([liveReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lari-fusion-report-${new Date().toISOString().slice(0, 19)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported');
    }
  }, [liveReport]);

  const getObjectIcon = (type: DetectedObject['type']) => {
    const icons: Record<DetectedObject['type'], JSX.Element> = {
      'building': <Target className="w-4 h-4" />,
      'vehicle': <Zap className="w-4 h-4" />,
      'person': <Eye className="w-4 h-4" />,
      'tree': <Layers className="w-4 h-4" />,
      'pole': <TrendingUp className="w-4 h-4" />,
      'sign': <AlertTriangle className="w-4 h-4" />,
      'unknown': <CheckCircle className="w-4 h-4" />
    };
    return icons[type];
  };

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, JSX.Element> = {
      'critical': <AlertTriangle className="w-4 h-4 text-red-500" />,
      'high': <TrendingUp className="w-4 h-4 text-orange-500" />,
      'medium': <Eye className="w-4 h-4 text-yellow-500" />,
      'low': <CheckCircle className="w-4 h-4 text-green-500" />
    };
    return icons[priority] || <CheckCircle className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              LARI Live Fusion Interface
            </h1>
            <p className="text-gray-300 text-lg">
              Real-time 3D LiDAR-Camera Fusion with Task-Driven AI Learning
            </p>
          </motion.div>
        </div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleFusion}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isActive ? 'Stop Fusion' : 'Start Fusion'}</span>
              </button>

              <div className="flex items-center space-x-2 text-white">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm">
                  {isActive ? 'Live Fusion Active' : 'Fusion Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportReport}
                disabled={!liveReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>

              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showAIInsights
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Insights</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Visualization */}
          <div className="xl:col-span-2 space-y-6">
            {/* Camera Feed with 3D Overlay */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Video className="w-6 h-6 mr-2" />
                  Live Camera Feed with 3D Mesh Overlay
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">LIVE</span>
                </div>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-[400px] object-cover"
                />
                
                {/* 3D Overlay Canvas */}
                <div className="absolute inset-0">
                  <LiDAR3DViewer
                    scanId={fusionData?.timestamp.toString()}
                    height={400}
                    showControls={false}
                    autoRotate={false}
                    colorMode="elevation"
                  />
                </div>

                {/* Object Overlays */}
                {fusionData?.detectedObjects.map((obj, index) => (
                  <div
                    key={obj.id}
                    className="absolute bg-black/70 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-black/90 transition-colors"
                    style={{
                      left: `${20 + (index % 3) * 120}px`,
                      top: `${20 + Math.floor(index / 3) * 30}px`
                    }}
                    onClick={() => setSelectedObject(obj)}
                  >
                    <div className="flex items-center space-x-1">
                      {getObjectIcon(obj.type)}
                      <span>{obj.type}</span>
                      <span className="text-green-400">{(obj.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}

                {!isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium">Camera Feed Inactive</p>
                      <p className="text-gray-300">Start fusion to enable live feed</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 3D Point Cloud Viewer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Radar className="w-6 h-6 mr-2" />
                  Live 3D Point Cloud
                </h3>
                {fusionData && (
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>{fusionData.lidarPoints.length.toLocaleString()} points</span>
                    <span>{fusionData.detectedObjects.length} objects</span>
                  </div>
                )}
              </div>

              <LiDAR3DViewer
                scanId={fusionData?.timestamp.toString()}
                height={400}
                showControls={true}
                autoRotate={false}
                colorMode="elevation"
              />
            </motion.div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Real-time Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Live Metrics
              </h3>

              {fusionData ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Point Count:</span>
                    <span className="text-white font-mono">
                      {fusionData.environmentMetrics.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Scan Density:</span>
                    <span className="text-white font-mono">
                      {fusionData.environmentMetrics.scanDensity.toFixed(1)} pts/m³
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Coverage Area:</span>
                    <span className="text-white font-mono">
                      {fusionData.environmentMetrics.coverageArea.toFixed(1)} m²
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Objects Detected:</span>
                    <span className="text-white font-mono">
                      {fusionData.detectedObjects.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Visibility:</span>
                    <span className="text-white font-mono">
                      {(fusionData.environmentMetrics.visibility * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Motion Detected:</span>
                    <span className={`font-mono ${fusionData.environmentMetrics.motionDetected ? 'text-red-400' : 'text-green-400'}`}>
                      {fusionData.environmentMetrics.motionDetected ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Waiting for fusion data...</p>
                </div>
              )}
            </motion.div>

            {/* Detected Objects */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Detected Objects
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fusionData?.detectedObjects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedObject(obj)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedObject?.id === obj.id
                        ? 'bg-blue-600/50 border border-blue-400'
                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getObjectIcon(obj.type)}
                        <span className="text-white font-medium capitalize">{obj.type}</span>
                      </div>
                      <span className="text-green-400 text-sm font-mono">
                        {(obj.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-300">
                      <p>Points: {obj.pointCount.toLocaleString()}</p>
                      <p>Size: {obj.boundingBox3D.dimensions.map(d => d.toFixed(1)).join(' × ')}m</p>
                      {obj.velocity && (
                        <p>Speed: {Math.sqrt(obj.velocity[0]**2 + obj.velocity[1]**2 + obj.velocity[2]**2).toFixed(1)} m/s</p>
                      )}
                    </div>
                  </div>
                ))}

                {(!fusionData?.detectedObjects || fusionData.detectedObjects.length === 0) && (
                  <div className="text-center text-gray-400 py-8">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No objects detected</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Insights */}
            <AnimatePresence>
              {showAIInsights && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Insights
                  </h3>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {fusionData?.aiInsights.map((insight) => (
                      <div key={insight.id} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(insight.priority)}
                            <span className="text-white font-medium text-sm">{insight.title}</span>
                          </div>
                          <span className="text-xs text-gray-400 capitalize">{insight.type}</span>
                        </div>
                        <p className="text-gray-300 text-xs mb-2">{insight.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-gray-400">
                            {insight.learnedFrom}
                          </span>
                        </div>
                        {insight.suggestedActions && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Suggested Actions:</p>
                            <div className="flex flex-wrap gap-1">
                              {insight.suggestedActions.map((action, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded">
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {(!fusionData?.aiInsights || fusionData.aiInsights.length === 0) && (
                      <div className="text-center text-gray-400 py-8">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>AI is learning...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Report Modal */}
        <AnimatePresence>
          {selectedObject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedObject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    {getObjectIcon(selectedObject.type)}
                    <span className="ml-2 capitalize">{selectedObject.type} Details</span>
                  </h3>
                  <button
                    onClick={() => setSelectedObject(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    &#x2715;
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Confidence</p>
                      <p className="text-white font-mono">{(selectedObject.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Point Count</p>
                      <p className="text-white font-mono">{selectedObject.pointCount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400">Position (x, y, z)</p>
                    <p className="text-white font-mono">
                      ({selectedObject.boundingBox3D.center.map(v => v.toFixed(2)).join(', ')})
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Dimensions (L × W × H)</p>
                    <p className="text-white font-mono">
                      {selectedObject.boundingBox3D.dimensions.map(v => v.toFixed(2)).join(' × ')} m
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Classification</p>
                    <p className="text-white">{selectedObject.classification}</p>
                  </div>

                  {selectedObject.velocity && (
                    <div>
                      <p className="text-gray-400">Velocity (x, y, z)</p>
                      <p className="text-white font-mono">
                        ({selectedObject.velocity.map(v => v.toFixed(2)).join(', ')}) m/s
                      </p>
                      <p className="text-blue-400 text-xs">
                        Speed: {Math.sqrt(selectedObject.velocity[0]**2 + selectedObject.velocity[1]**2 + selectedObject.velocity[2]**2).toFixed(2)} m/s
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
