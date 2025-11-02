
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PorcupineWorker } from '@picovoice/porcupine-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

interface WakeWordConfig {
  accessKey: string;
  wakeWords: string[];
  onWakeWordDetected: (wakeWordIndex: number) => void;
  sensitivity?: number;
}

export const useWakeWordDetection = ({
  accessKey,
  wakeWords,
  onWakeWordDetected,
  sensitivity = 0.7
}: WakeWordConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const porcupineWorkerRef = useRef<PorcupineWorker | null>(null);
  const webVoiceProcessorRef = useRef<WebVoiceProcessor | null>(null);

  const initializePorcupine = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create Porcupine worker for "Hey Scing" detection
      porcupineWorkerRef.current = await PorcupineWorker.create(
        accessKey,
        wakeWords.map(word => ({
          builtin: word as any,
          sensitivity: sensitivity
        })),
        (wakeWordIndex: number) => {
          console.log(`🎯 Wake word detected: ${wakeWords[wakeWordIndex]}`);
          onWakeWordDetected(wakeWordIndex);
        }
      );

      // Initialize WebVoiceProcessor
      webVoiceProcessorRef.current = await WebVoiceProcessor.init({
        engines: [porcupineWorkerRef.current],
        start: false
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(`Failed to initialize wake word detection: ${err.message}`);
      setIsLoading(false);
    }
  }, [accessKey, wakeWords, onWakeWordDetected, sensitivity]);

  const startListening = useCallback(async () => {
    if (!webVoiceProcessorRef.current) {
      await initializePorcupine();
    }

    try {
      await webVoiceProcessorRef.current?.start();
      setIsListening(true);
      console.log('🎤 Scing is now listening for "Hey Scing"...');
    } catch (err: any) {
      setError(`Failed to start listening: ${err.message}`);
    }
  }, [initializePorcupine]);

  const stopListening = useCallback(async () => {
    try {
      await webVoiceProcessorRef.current?.stop();
      setIsListening(false);
      console.log('🔇 Wake word detection stopped.');
    } catch (err: any) {
      setError(`Failed to stop listening: ${err.message}`);
    }
  }, []);

  const cleanup = useCallback(async () => {
    await stopListening();
    
    if (porcupineWorkerRef.current) {
      await porcupineWorkerRef.current.terminate();
      porcupineWorkerRef.current = null;
    }
    
    if (webVoiceProcessorRef.current) {
      await webVoiceProcessorRef.current.release();
      webVoiceProcessorRef.current = null;
    }
  }, [stopListening]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isListening,
    isLoading,
    error,
    startListening,
    stopListening,
    cleanup
  };
};
