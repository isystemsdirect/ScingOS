
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWakeWordDetection } from '@/hooks/useWakeWordDetection';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { conversationStore } from '@/lib/conversationStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScingAIProps {
  userId: string;
  accessKey: string; // Picovoice access key
}

export const ScingAI: React.FC<ScingAIProps> = ({ userId, accessKey }) => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);

  // Firebase Functions
  const processMessage = httpsCallable(functions, 'processScingMessage');
  const handleCommand = httpsCallable(functions, 'handleScingularCommand');

  const handleWakeWordDetected = useCallback(async (wakeWordIndex: number) => {
    console.log('🎯 "Hey Scing" detected!');
    toast.success('Hey Scing detected!');
    
    setConversationActive(true);
    
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSessionId = await conversationStore.createSession(userId, {
        wakeWordDetected: true,
        startMethod: 'voice_activation'
      });
      setSessionId(newSessionId);
      currentSessionId = newSessionId;
    }

    const welcomeMessages = [
      "Hi there! How can I help you today?",
      "Hello! What can I do for you?",
      "Hey! I'm here and ready to assist!",
      "Hi! What's on your mind?"
    ];
    
    const welcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    speak(welcome);
    
    if (currentSessionId) {
      await conversationStore.addMessage(currentSessionId, userId, 'assistant', welcome, {
        type: 'wake_word_response',
        wakeWordConfidence: 1.0
      });
    }

    setTimeout(() => {
      if (!isSpeechListening) {
        startSpeechListening();
      }
    }, 2000); 
  }, [userId, sessionId]);

  // Wake word detection
  const { 
    isListening: isWakeWordListening, 
    isLoading: isWakeWordLoading,
    startListening: startWakeWordListening,
    stopListening: stopWakeWordListening,
  } = useWakeWordDetection({
    accessKey,
    wakeWords: ['hey siri'], // Using a common one for testing as 'hey scing' is custom.
    onWakeWordDetected: handleWakeWordDetected,
  });

  const processUserMessage = useCallback(async (message: string) => {
    if (!sessionId) return;

    setIsProcessing(true);
    stopSpeechListening();

    try {
      await conversationStore.addMessage(sessionId, userId, 'user', message, {
        speechRecognitionConfidence: 0.95,
        timestamp: Date.now()
      });

      const isScingularCommand = [
        'inspection', 'report', 'compliance', 'scan', 'drone', 'camera', 
        'sensor', 'device', 'spectrometer', 'analyze', 'lari-prism'
      ].some(keyword => message.toLowerCase().includes(keyword));

      let response: any;
      if (isScingularCommand) {
        const result: any = await handleCommand({ 
          command: message, 
          userId, 
          sessionId 
        });
        response = result.data.response;
      } else {
        const result: any = await processMessage({
          message,
          sessionId,
          userId,
          conversationHistory: conversationHistory.slice(-10) 
        });
        response = result.data.response;
      }

      await conversationStore.addMessage(sessionId, userId, 'assistant', response, {
        responseTime: Date.now(),
        model: 'gpt-4-turbo-preview'
      });

      speak(response);

      setTimeout(() => {
        if (conversationActive && !isSpeechListening) {
          startSpeechListening();
        }
      }, response.length * 50); 

    } catch (error: any) {
      console.error('Error processing message:', error);
      const errorResponse = "I'm having trouble processing that. Could you try again?";
      speak(errorResponse);
      
      setTimeout(() => {
        if (conversationActive) {
          startSpeechListening();
        }
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, userId, conversationHistory, handleCommand, processMessage, conversationActive]);


  const handleSpeechResult = useCallback(async (transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      console.log('👤 User said:', transcript);
      setCurrentTranscript('');
      
      const endKeywords = ['goodbye scing', 'bye scing', 'thanks scing', 'that\'s all', 'stop listening'];
      if (endKeywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
        await endConversation();
        return;
      }

      await processUserMessage(transcript);
    } else {
      setCurrentTranscript(transcript);
    }
  }, [processUserMessage]);


  // Speech recognition
  const {
    isListening: isSpeechListening,
    startListening: startSpeechListening,
    stopListening: stopSpeechListening,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (error) => {
      console.error('Speech recognition error:', error);
      toast.error('Speech recognition error');
    }
  });

  // Text-to-speech
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({
    rate: 1.1,
    pitch: 1.0,
    volume: 0.8
  });

  // End conversation
  const endConversation = async () => {
    setConversationActive(false);
    stopSpeechListening();
    stopSpeaking();

    const goodbye = "Goodbye! Just say 'Hey Scing' if you need me again!";
    speak(goodbye);

    if (sessionId) {
      await conversationStore.addMessage(sessionId, userId, 'assistant', goodbye, {
        type: 'conversation_end'
      });
      await conversationStore.endSession(sessionId);
    }

    setTimeout(() => {
      setSessionId(null);
      setConversationHistory([]);
    }, 3000);
  }

  // Initialize Scing AI
  const initializeScing = useCallback(async () => {
    try {
      if (!isActive) {
        await startWakeWordListening();
        setIsActive(true);
        toast.success('Scing AI activated! Say "Hey Scing" to start.');
      } else {
        await stopWakeWordListening();
        stopSpeechListening();
        stopSpeaking();
        setIsActive(false);
        setConversationActive(false);
        toast.success('Scing AI deactivated.');
      }
    } catch (error: any) {
      toast.error(`Failed to ${isActive ? 'deactivate' : 'activate'} Scing: ${error.message}`);
    }
  }, [isActive, startWakeWordListening, stopWakeWordListening, stopSpeechListening, stopSpeaking]);

  useEffect(() => {
    if (sessionId) {
      const unsubscribe = conversationStore.subscribeToSession(sessionId, (messages) => {
        setConversationHistory(messages);
      });

      return unsubscribe;
    }
  }, [sessionId]);

  useEffect(() => {
    return () => {
      stopWakeWordListening();
      stopSpeechListening();
      stopSpeaking();
    };
  }, [stopWakeWordListening, stopSpeechListening, stopSpeaking]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-full p-6 shadow-2xl"
      >
        <button
          onClick={initializeScing}
          disabled={isWakeWordLoading}
          className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isWakeWordLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isActive ? (
            <Mic className="w-8 h-8" />
          ) : (
            <MicOff className="w-8 h-8" />
          )}
        </button>

        <div className="absolute -top-2 -right-2 flex flex-col gap-1">
          {isWakeWordListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4 bg-green-400 rounded-full"
              title="Listening for 'Hey Scing'"
            />
          )}

          {isSpeechListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-4 h-4 bg-red-400 rounded-full"
              title="Listening to speech"
            />
          )}

          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-4 h-4 bg-yellow-400 rounded-full"
              title="Scing is speaking"
            />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {conversationActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Conversation with Scing</h3>
              <button
                onClick={endConversation}
                className="text-gray-400 hover:text-gray-600"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {conversationHistory.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-xs px-3 py-2 rounded-lg text-sm bg-blue-200 text-blue-800 italic">
                    {currentTranscript}...
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Scing is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 right-20 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm"
        >
          {conversationActive ? (
            isSpeechListening ? '🎤 Listening...' : 
            isSpeaking ? '🗣️ Speaking...' : 
            isProcessing ? '🤔 Thinking...' : '💬 In conversation'
          ) : (
            isWakeWordListening ? '👂 Waiting for "Hey Scing"...' : '⏸️ Standby'
          )}
        </motion.div>
      )}
    </div>
  );
};
