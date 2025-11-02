
'use client';
import { ScingAI } from '@/components/ScingAI';
import { NewCaptureButton } from '@/components/NewCaptureButton';
import { LiveFusionViewer } from '@/components/LiveFusionViewer';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // This logic will be improved to check for a valid API key
      // For now, we will simulate a user ID to prevent crashes
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (apiKey && apiKey !== 'your-firebase-api-key' && apiKey !== '') {
          // In a real app with a login flow, you would initialize Firebase auth here.
          // For now, we will just use a mock user to avoid crashes.
          console.log("Valid API key found, but skipping sign-in for dev stability. Using mock user.");
          setUserId('mock-dev-user');
      } else {
        console.warn("Firebase API key is not configured. Using mock user ID for development.");
        setUserId('mock-dev-user');
      }
      setIsLoading(false);
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
