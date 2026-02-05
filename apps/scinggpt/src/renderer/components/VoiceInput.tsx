// ScingGPT - Voice Input Component

import { useEffect, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice';

export default function VoiceInput() {
  const {
    isListening,
    isProcessing,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoice();

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Handle keyboard shortcut (Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle]);

  return (
    <div className="flex items-center justify-center gap-4 border-t border-gray-800 bg-gray-900/30 px-4 py-3">
      {/* Voice Button */}
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${
          isListening
            ? 'bg-scing-error animate-pulse'
            : 'bg-scing-primary hover:bg-indigo-600'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          // Stop icon
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        ) : (
          // Microphone icon
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

      {/* Status Text */}
      <div className="flex-1">
        {isListening ? (
          <div className="flex items-center gap-3">
            <div className="voice-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-sm text-scing-accent">Listening...</span>
          </div>
        ) : isProcessing ? (
          <span className="text-sm text-gray-400">Processing...</span>
        ) : error ? (
          <span className="text-sm text-scing-error">{error}</span>
        ) : transcript ? (
          <span className="text-sm text-gray-300 line-clamp-1">{transcript}</span>
        ) : (
          <span className="text-sm text-gray-500">
            Press <kbd className="rounded bg-gray-700 px-1.5 py-0.5 text-xs">Ctrl</kbd>+
            <kbd className="rounded bg-gray-700 px-1.5 py-0.5 text-xs">Space</kbd> or click to speak
          </span>
        )}
      </div>

      {/* Clear button (when transcript exists) */}
      {transcript && !isListening && (
        <button
          onClick={clearTranscript}
          className="rounded p-2 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          aria-label="Clear transcript"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
