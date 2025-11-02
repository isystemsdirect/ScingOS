
'use client';
import { ScingAI } from '@/components/ScingAI';
import { NewCaptureButton } from '@/components/NewCaptureButton';
import { LiveFusionViewer } from '@/components/LiveFusionViewer';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // This logic will be improved to check for a valid API key
      // For now, we will simulate a user ID to prevent crashes
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (auth && apiKey && apiKey !== 'your-firebase-api-key' && apiKey !== '') {
        try {
          const result = await signInAnonymously(auth);
          setUserId(result.user.uid);
        } catch (error) {
          console.error('Authentication error:', error);
          // Set a mock user ID for development to proceed without a real backend
          setUserId('mock-dev-user');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn("Firebase API key is not configured. Using mock user ID for development.");
        setUserId('mock-dev-user');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing SCINGULAR AI System...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Your existing content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            SCINGULAR AI Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Advanced AI-Driven Inspection & Analysis System
          </p>
        </div>

        {/* Main Interface */}
        <LiveFusionViewer />
      </div>

      {/* New Capture Button - Floating */}
      <NewCaptureButton 
        position="floating"
        size="lg"
        variant="gradient"
      />

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
