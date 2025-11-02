
'use client';
import * as React from "react"
import { useState, useCallback, useRef } from 'react';

interface TextToSpeechConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = ({
  voice,
  rate = 1.0,
  pitch = 1.0,
  volume = 0.8
}: TextToSpeechConfig = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadVoices = useCallback(() => {
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
  }, []);

  const speak = useCallback((text: string, options?: Partial<TextToSpeechConfig>) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure voice parameters
      utterance.rate = options?.rate ?? rate;
      utterance.pitch = options?.pitch ?? pitch;
      utterance.volume = options?.volume ?? volume;

      // Set voice if specified
      if (options?.voice || voice) {
        const selectedVoice = voices.find(v => 
          v.name.includes(options?.voice || voice || '') ||
          v.lang.includes('en-US')
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🗣️ Scing is speaking...');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('✅ Scing finished speaking.');
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech synthesis error:', event.error);
      };

      // Speak
      speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser');
    }
  }, [voice, rate, pitch, volume, voices]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Load voices when component mounts
  React.useEffect(() => {
    loadVoices();
    
    // Some browsers load voices asynchronously
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  return {
    speak,
    stop,
    isSpeaking,
    voices,
    isSupported: 'speechSynthesis' in window
  };
};
