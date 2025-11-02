'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Radar, 
  Camera, 
  Thermometer,
  Zap,
  CheckCircle,
  AlertCircle,
  Mic,
  Brain,
  Settings,
  Play,
  Layers,
  Eye,
  Target
} from 'lucide-react';
import { lariLiDARController, LiDARDevice } from '@/lib/lari-lidar-controller';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import toast from 'react-hot-toast';
import { DeviceSelectionStep } from './wizard-steps/DeviceSelectionStep';
import { CaptureSettingsStep } from './wizard-steps/CaptureSettingsStep';
import { SessionMetadataStep } from './wizard-steps/SessionMetadataStep';
import { LaunchInterfaceStep } from './wizard-steps/LaunchInterfaceStep';

interface NewCaptureWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface WizardStepProps {
  captureSession: CaptureSession;
  setCaptureSession: (session: CaptureSession) => void;
  onNext: () => void;
  onBack: () => void;
  isScingActive: boolean;
  currentAIGuidance: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  validation?: () => boolean;
  aiGuidance: string;
}

export interface CaptureSession {
  sessionId: string;
  deviceType: 'lidar' | 'camera' | 'thermal' | 'spectrometer' | 'multi_sensor';
  selectedDevices: string[];
  captureSettings: {
    resolution: string;
    duration?: number;
    autoStart: boolean;
    realTimeProcessing: boolean;
    aiAnalysis: boolean;
  };
  metadata: {
    projectName: string;
    location: string;
    operator: string;
    notes: string;
  };
}

export const NewCaptureWizard: React.FC<NewCaptureWizardProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [captureSession, setCaptureSession] = useState<CaptureSession>({
    sessionId: '',
    deviceType: 'lidar',
    selectedDevices: [],
    captureSettings: {
      resolution: 'high',
      autoStart: true,
      realTimeProcessing: true,
      aiAnalysis: true
    },
    metadata: {
      projectName: '',
      location: '',
      operator: '',
      notes: ''
    }
  });

  const [availableDevices, setAvailableDevices] = useState<LiDARDevice[]>([]);
  const [isScingActive, setIsScingActive] = useState(false);
  const [currentAIGuidance, setCurrentAIGuidance] = useState('');
  const [wizardProgress, setWizardProgress] = useState(0);

  // Voice interaction hooks
  const { speak, isSpeaking } = useTextToSpeech();
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechRecognition({
    onResult: (transcript, isFinal) => handleVoiceCommand(transcript, isFinal),
    onError: (error) => console.error('Voice error:', error)
  });

  // Wizard steps configuration
  const wizardSteps: WizardStep[] = [
    {
      id: 'device_selection',
      title: 'Device Selection',
      description: 'Choose your capture devices',
      icon: <Radar className="w-6 h-6" />,
      component: DeviceSelectionStep,
      aiGuidance: "Welcome! I'll help you select the perfect devices for your capture session. What type of inspection are you planning?"
    },
    {
      id: 'capture_settings',
      title: 'Capture Settings',
      description: 'Configure capture parameters',
      icon: <Settings className="w-6 h-6" />,
      component: CaptureSettingsStep,
      aiGuidance: "Now let's optimize your capture settings. I'll recommend the best parameters based on your selected devices and intended use."
    },
    {
      id: 'session_metadata',
      title: 'Session Information',
      description: 'Add project details and metadata',
      icon: <Target className="w-6 h-6" />,
      component: SessionMetadataStep,
      aiGuidance: "Finally, let's add some context to your capture session. This helps with organization and future analysis."
    },
    {
      id: 'launch_interface',
      title: 'Launch Capture',
      description: 'Start your capture session',
      icon: <Play className="w-6 h-6" />,
      component: LaunchInterfaceStep,
      aiGuidance: "Perfect! Everything is configured. I'll now launch the appropriate interface for your capture session."
    }
  ];

  // Initialize wizard when opened
  useEffect(() => {
    if (isOpen) {
      // Generate unique session ID
      setCaptureSession(prev => ({
        ...prev,
        sessionId: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Load available devices
      setAvailableDevices(lariLiDARController.getDevices());

      // Activate Scing AI guidance
      setIsScingActive(true);
      provideAIGuidance(wizardSteps[0].aiGuidance);
      
      // Reset progress
      setCurrentStep(0);
      setWizardProgress(0);
    } else {
      // Cleanup when closed
      setIsScingActive(false);
      stopListening();
    }
  }, [isOpen]);

  // Update progress when step changes
  useEffect(() => {
    setWizardProgress((currentStep + 1) / wizardSteps.length);
    
    if (isScingActive && wizardSteps[currentStep]) {
      provideAIGuidance(wizardSteps[currentStep].aiGuidance);
    }
  }, [currentStep, isScingActive]);

  // AI Guidance System
  const provideAIGuidance = useCallback((guidance: string) => {
    setCurrentAIGuidance(guidance);
    
    if (isScingActive) {
      speak(guidance);
      
      // Show guidance notification
      toast((t) => (
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-purple-500" />
          <div>
            <p className="font-medium">Scing AI Guidance</p>
            <p className="text-sm text-gray-600">{guidance}</p>
          </div>
        </div>
      ), { duration: 5000 });
    }
  }, [isScingActive, speak]);

  // Voice command handling
  function handleVoiceCommand(transcript: string, isFinal: boolean): void {
    if (!isFinal) return;

    const command = transcript.toLowerCase().trim();
    console.log('🎤 Voice command:', command);

    // Navigation commands
    if (command.includes('next') || command.includes('continue')) {
      handleNext();
    } else if (command.includes('back') || command.includes('previous')) {
      handleBack();
    } else if (command.includes('cancel') || command.includes('close')) {
      onClose();
    }
    
    // Device selection commands
    else if (command.includes('lidar')) {
      setCaptureSession(prev => ({ ...prev, deviceType: 'lidar' }));
      provideAIGuidance("Great choice! LiDAR will provide precise 3D measurements. Let me show you the available LiDAR devices.");
    } else if (command.includes('camera')) {
      setCaptureSession(prev => ({ ...prev, deviceType: 'camera' }));
      provideAIGuidance("Camera capture selected. This is perfect for visual documentation and photogrammetry.");
    } else if (command.includes('thermal')) {
      setCaptureSession(prev => ({ ...prev, deviceType: 'thermal' }));
      provideAIGuidance("Thermal imaging will help detect temperature variations and energy inefficiencies.");
    }
    
    // Settings commands
    else if (command.includes('high resolution')) {
      setCaptureSession(prev => ({
        ...prev,
        captureSettings: { ...prev.captureSettings, resolution: 'high' }
      }));
      provideAIGuidance("High resolution selected for maximum detail and accuracy.");
    }
    
    // Generic AI response
    else {
      provideAIGuidance(`I heard "${command}". Can you clarify what you'd like to do? Try saying "next" to continue or "select LiDAR" to choose a device.`);
    }
  }

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Launch the appropriate interface
      launchCaptureInterface();
    }
  }, [currentStep, wizardSteps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Launch appropriate interface based on settings
  const launchCaptureInterface = useCallback(() => {
    const { deviceType } = captureSession;
    
    toast.success(`Launching ${deviceType.toUpperCase()} interface...`);
    
    // AI confirmation
    provideAIGuidance(`Perfect! I'm now launching the ${deviceType} interface with your configured settings. The capture session is ready to begin!`);

    // Simulate interface launch (in real app, this would navigate or open interface)
    setTimeout(() => {
      let url = '/capture';
      switch (deviceType) {
        case 'lidar': url = '/workstation/lidar'; break;
        case 'camera': url = '/workstation/camera'; break;
        case 'thermal': url = '/workstation/thermal'; break;
        case 'spectrometer': url = '/workstation/prism'; break;
        case 'multi_sensor': url = '/workstation/fusion'; break;
      }
      
      window.open(url, '_blank', 'width=1400,height=900,resizable,scrollbars');
      onClose();
    }, 2000);
  }, [captureSession, provideAIGuidance, onClose]);

  const toggleScingAI = useCallback(() => {
    setIsScingActive(!isScingActive);
    
    if (!isScingActive) {
      provideAIGuidance("Hello! I'm Scing, your AI assistant. I'll guide you through setting up your capture session. You can talk to me anytime!");
      startListening();
      toast.success('🤖 Scing AI Activated - Voice guidance enabled');
    } else {
      stopListening();
      toast.success('Scing AI Deactivated');
    }
  }, [isScingActive, provideAIGuidance, startListening, stopListening]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">New Capture Wizard</h2>
                  <p className="text-blue-100 text-sm">AI-Guided Device Setup & Configuration</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Scing AI Toggle */}
                <button
                  onClick={toggleScingAI}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isScingActive
                      ? 'bg-green-500/30 text-green-100 border border-green-400/50'
                      : 'bg-gray-500/30 text-gray-200 border border-gray-500/50'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>{isScingActive ? 'Scing ON' : 'Scing OFF'}</span>
                  {isListening && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
                </button>

                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Step {currentStep + 1} of {wizardSteps.length}</span>
                <span>{Math.round(wizardProgress * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${wizardProgress * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-700/50 flex-shrink-0">
            <div className="flex items-center space-x-4">
              {wizardSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600/50 text-blue-100'
                      : index < currentStep
                        ? 'bg-green-600/30 text-green-200'
                        : 'bg-gray-700/30 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden md:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Current Step Component */}
                {React.createElement(wizardSteps[currentStep].component, {
                  captureSession,
                  setCaptureSession,
                  availableDevices,
                  onNext: handleNext,
                  onBack: handleBack,
                  isScingActive,
                  currentAIGuidance
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Scing AI Guidance Panel */}
          <AnimatePresence>
            {isScingActive && currentAIGuidance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-t border-purple-500/30 px-6 py-4 flex-shrink-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-purple-200 font-medium">Scing AI Guidance</h4>
                      <div className="flex items-center space-x-2">
                        {isSpeaking && (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          </div>
                        )}
                        {isListening && (
                          <div className="flex items-center space-x-1 text-purple-300 text-xs">
                            <Mic className="w-3 h-3" />
                            <span>Listening...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-purple-100 text-sm leading-relaxed">
                      {currentAIGuidance}
                    </p>
                    
                    {/* Voice Interaction Hint */}
                    {isScingActive && (
                      <div className="mt-2 text-purple-300 text-xs">
                        💡 Try saying: "next step", "select LiDAR", "high resolution", or ask questions
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-700/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 disabled:bg-gray-700/30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">
                  {wizardSteps[currentStep].description}
                </span>
                
                {/* Session ID Display */}
                {captureSession.sessionId && (
                  <div className="px-3 py-1 bg-gray-700/50 rounded text-xs text-gray-300 font-mono">
                    ID: {captureSession.sessionId.slice(-8)}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <span>{currentStep === wizardSteps.length - 1 ? 'Launch' : 'Next'}</span>
                {currentStep === wizardSteps.length - 1 ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};