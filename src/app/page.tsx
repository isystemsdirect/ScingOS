
'use client';
import { ScingAI } from '@/components/ScingAI';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Sign in anonymously for demo purposes
        const result = await signInAnonymously(auth);
        setUserId(result.user.uid);
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing Scing AI...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            SCINGULAR AI Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Meet Scing - Your voice-activated AI assistant for inspections and analysis
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                <p>Click the microphone button in the bottom-right corner to activate Scing</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                <p>Say <strong>"Hey Scing"</strong> to start a conversation</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                <p>Ask about inspections, LARI-Prism analysis, or general assistance</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                <p>Say "goodbye" or "thanks Scing" to end the conversation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">🎯 Wake Word Detection</h3>
            <p className="text-gray-600">Always listening for "Hey Scing" using advanced wake word technology</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">🗣️ Natural Conversation</h3>
            <p className="text-gray-600">Powered by GPT-4 for intelligent, context-aware responses</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">🔬 SCINGULAR Integration</h3>
            <p className="text-gray-600">Direct access to inspection tools and LARI-Prism spectrometer</p>
          </div>
        </div>
      </div>

      {/* Scing AI Assistant */}
      {userId && (
        <ScingAI 
          userId={userId} 
          accessKey={process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY || ''} 
        />
      )}
    </main>
  );
}
