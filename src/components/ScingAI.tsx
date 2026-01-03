
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useWakeWordDetection } from '@/hooks/useWakeWordDetection';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { conversationStore } from '@/lib/conversationStore';
import { autonomousDOMController, DOMAction } from '@/lib/autonomous-dom-controller';
import { autonomousComponentController, ComponentAction } from '@/lib/autonomous-component-controller';
import { getFirebaseFunctions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bot, Mic, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ScingAIAutonomousProps {
  userId: string;
  accessKey: string;
}

export const ScingAI: React.FC<ScingAIAutonomousProps> = ({ 
  userId, 
  accessKey 
}) => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationActive, setConversationActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'listening' | 'processing' | 'executing' | 'idle'>('idle');
  const [guiControlLevel, setGuiControlLevel] = useState<'basic' | 'advanced' | 'full'>('full');

  // Firebase Functions with enhanced capabilities
  const functions = getFirebaseFunctions();
  // const processAdvancedMessage = functions ? httpsCallable(functions, 'processAdvancedScingMessage') : null;

  // Wake word detection
  const {
    isListening: isWakeWordListening,
    startListening: startWakeWordListening,
    stopListening: stopWakeWordListening
  } = useWakeWordDetection({
    accessKey,
    wakeWords: ['hey siri'], // Using a common one as 'hey scing' is custom
    onWakeWordDetected: (index) => handleWakeWordDetected(index)
  });

  // Speech recognition
  const {
    isListening: isSpeechListening,
    startListening: startSpeechListening,
    stopListening: stopSpeechListening
  } = useSpeechRecognition({
    onResult: (transcript, isFinal) => handleSpeechResult(transcript, isFinal),
    onError: (error) => console.error('Speech error:', error)
  });

  // Text-to-speech
  const { speak } = useTextToSpeech();

  // Wake word detected - activate full GUI control
  async function handleWakeWordDetected(wakeWordIndex: number) {
    console.log('🎯 Scing AI Autonomous Mode Activated!');
    
    setConversationActive(true);
    setCurrentMode('processing');

    // Create new session
    if (!sessionId) {
      try {
        const newSessionId = await conversationStore.createSession(userId, {
            wakeWordDetected: true,
            autonomousMode: true,
            guiControlLevel
        });
        setSessionId(newSessionId);
      } catch (e) {
          console.error("Failed to create conversation session", e);
          toast.error("Could not start AI session.");
          setConversationActive(false);
          setCurrentMode('idle');
          return;
      }
    }

    // Show autonomous activation UI
    await showAutonomousActivation();

    // Welcome with GUI demonstration
    const welcomeMessage = "Hello! I'm now in full autonomous mode. I can control every aspect of this interface. Let me show you what I can do!";
    speak(welcomeMessage);

    // Demonstrate GUI control capabilities
    setTimeout(() => {
      demonstrateGUICapabilities();
    }, 3000);

    // Start listening for commands
    setTimeout(() => {
      setCurrentMode('listening');
      startSpeechListening();
    }, 5000);
  }

  // Show autonomous activation with visual effects
  async function showAutonomousActivation(): Promise<void> {
    // Create activation overlay
    const overlayActions: DOMAction[] = [
      {
        type: 'create',
        target: 'body > div',
        properties: {
          id: 'scing-activation-overlay',
          className: 'fixed inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90 flex items-center justify-center z-50'
        },
        content: `
          <div class="text-center text-white">
            <div class="animate-pulse mb-4">
              <div class="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-3xl font-bold mb-2">Scing AI Autonomous Mode</h1>
            <p class="text-xl opacity-90">Full GUI Control Activated</p>
            <div class="mt-4 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        `
      }
    ];

    autonomousDOMController.queueActions(overlayActions);

    // Remove overlay after 3 seconds
    setTimeout(() => {
      const removeActions: DOMAction[] = [
        {
          type: 'animate',
          target: '#scing-activation-overlay',
          animation: {
            keyframes: [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'scale(0.8)' }
            ],
            options: { duration: 500, easing: 'ease-out' }
          }
        }
      ];
      autonomousDOMController.queueActions(removeActions);
      
      setTimeout(() => {
        autonomousDOMController.queueActions([{
          type: 'delete',
          target: '#scing-activation-overlay'
        }]);
      }, 500);
    }, 3000);
  }

  // Demonstrate GUI capabilities
  async function demonstrateGUICapabilities(): Promise<void> {
    // Show notification
    const notificationActions: ComponentAction[] = [
      {
        type: 'mount',
        componentId: 'demo-notification',
        componentType: 'ScingNotification',
        props: {
          message: '👋 I can create dynamic notifications!',
          type: 'success',
          duration: 3000
        }
      }
    ];
    autonomousComponentController.executeComponentActions(notificationActions);

    // Create floating control panel
    setTimeout(() => {
      const controlPanelActions: DOMAction[] = [
        {
          type: 'create',
          target: 'body > div',
          properties: {
            id: 'scing-control-panel',
            className: 'fixed top-4 left-4 bg-white rounded-lg shadow-2xl p-4 z-40 border-l-4 border-blue-500'
          },
          content: `
            <div class="flex items-center mb-3">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span class="font-semibold text-sm">Scing AI Control Panel</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>DOM Elements:</span>
                <span class="font-mono text-blue-600">${autonomousDOMController.getDOMSnapshot ? Object.keys(autonomousDOMController.getDOMSnapshot()).length : 0}</span>
              </div>
              <div class="flex justify-between">
                <span>Components:</span>
                <span class="font-mono text-green-600">${autonomousComponentController.getMountedComponents().length}</span>
              </div>
              <div class="flex justify-between">
                <span>Mode:</span>
                <span class="font-mono text-purple-600">Autonomous</span>
              </div>
            </div>
          `
        }
      ];
      autonomousDOMController.queueActions(controlPanelActions);
    }, 1500);

    // Animate some existing elements
    setTimeout(() => {
        const h1Element = document.querySelector('h1');
        if (h1Element) {
            const animateActions: DOMAction[] = [
                {
                type: 'animate',
                target: 'h1',
                animation: {
                    keyframes: [
                    { transform: 'scale(1)', color: 'inherit' },
                    { transform: 'scale(1.05)', color: '#3B82F6' },
                    { transform: 'scale(1)', color: 'inherit' }
                    ],
                    options: { duration: 1000, easing: 'ease-in-out' }
                }
                }
            ];
            autonomousDOMController.queueActions(animateActions);
        }
    }, 2500);
  }

  // Handle speech input with GUI control
  async function handleSpeechResult(transcript: string, isFinal: boolean): Promise<void> {
    // if (!isFinal || !transcript.trim() || !processAdvancedMessage) return;
    if (!isFinal || !transcript.trim()) return;


    setCurrentMode('processing');
    console.log('👤 User command:', transcript);

    toast({
        variant: 'destructive',
        title: 'Feature Temporarily Disabled',
        description: 'The AI features are currently unavailable due to dependency issues.',
    });

    try {
      // // Process with enhanced AI that can generate GUI actions
      // const result: any = await processAdvancedMessage({
      //   message: transcript,
      //   sessionId,
      //   userId,
      //   context: {
      //     domSnapshot: autonomousDOMController.getDOMSnapshot(),
      //     mountedComponents: autonomousComponentController.getMountedComponents(),
      //     guiControlLevel,
      //     currentMode
      //   }
      // });

      // const { response, guiActions } = result.data;

      // // Execute GUI actions if provided
      // if (guiActions) {
      //   setCurrentMode('executing');
      //   console.log('🎮 Executing GUI actions:', guiActions);
        
      //   if (guiActions.domActions) {
      //     autonomousDOMController.queueActions(guiActions.domActions);
      //   }
        
      //   if (guiActions.componentActions) {
      //     await autonomousComponentController.executeComponentActions(guiActions.componentActions);
      //   }
        
      //   await new Promise(resolve => setTimeout(resolve, 1000));
      // }

      // // Speak response
      // speak(response);
      
      // // Update control panel
      // updateControlPanel();
      
      // setCurrentMode('listening');
      
      // // Continue listening
      // setTimeout(() => {
      //   if (conversationActive && !isSpeechListening) {
      //     startSpeechListening();
      //   }
      // }, response.length * 50);

    } catch (error) {
      console.error('Error processing autonomous command:', error);
      speak("I encountered an issue while processing that command. Please try again.");
      setCurrentMode('listening');
      
      setTimeout(() => {
        if (conversationActive) {
          startSpeechListening();
        }
      }, 2000);
    }
  }

  // Update control panel with current stats
  function updateControlPanel(): void {
    const updateActions: DOMAction[] = [
      {
        type: 'modify',
        target: '#scing-control-panel',
        content: `
          <div class="flex items-center mb-3">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span class="font-semibold text-sm">Scing AI Control Panel</span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>DOM Elements:</span>
              <span class="font-mono text-blue-600">${autonomousDOMController.getDOMSnapshot ? Object.keys(autonomousDOMController.getDOMSnapshot()).length : 0}</span>
            </div>
            <div class="flex justify-between">
              <span>Components:</span>
              <span class="font-mono text-green-600">${autonomousComponentController.getMountedComponents().length}</span>
            </div>
            <div class="flex justify-between">
              <span>Mode:</span>
              <span class="font-mono text-purple-600">${currentMode}</span>
            </div>
            <div class="flex justify-between">
              <span>Control Level:</span>
              <span class="font-mono text-orange-600">${guiControlLevel}</span>
            </div>
          </div>
        `
      }
    ];
    autonomousDOMController.queueActions(updateActions);
  }

  // Initialize autonomous mode
  const initializeAutonomous = useCallback(async () => {
    try {
      if (!isActive) {
        if (!functions) {
            toast.error("AI Functions not available. Cannot start autonomous mode.");
            return;
        }
        await startWakeWordListening();
        setIsActive(true);
        toast.success('🤖 Scing AI Autonomous Mode Ready! Say "Hey Scing" to activate full GUI control.');
      } else {
        await stopWakeWordListening();
        stopSpeechListening();
        setIsActive(false);
        setConversationActive(false);
        
        // Cleanup autonomous elements
        autonomousDOMController.queueActions([
          { type: 'delete', target: '#scing-control-panel' }
        ]);
        
        toast.success('Scing AI Autonomous Mode Deactivated.');
      }
    } catch (error: any) {
      toast.error(`Failed to ${isActive ? 'deactivate' : 'activate'} autonomous mode: ${error.message}`);
    }
  }, [isActive, startWakeWordListening, stopWakeWordListening, stopSpeechListening, functions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autonomousDOMController.cleanup();
      autonomousComponentController.cleanup();
    };
  }, []);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={initializeAutonomous}
        className={cn(
          "rounded-full h-8 w-8 transition-colors",
          isActive && "bg-primary/20 text-primary",
          currentMode === 'listening' && 'animate-pulse'
        )}
      >
        {currentMode === 'processing' || currentMode === 'executing' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Scing AI Automaton</span>
      </Button>
    </div>
  );
};
