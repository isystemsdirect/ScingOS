import { useState } from 'react';
import Head from 'next/head';
import { VoiceButton } from '../components/voice/VoiceButton';
import { Layout } from '../components/layout/Layout';
import { useAuthStore } from '../lib/store/authStore';

export default function Home() {
  const { user } = useAuthStore();
  const [isListening, setIsListening] = useState(false);

  const handleVoiceActivation = () => {
    setIsListening(!isListening);
    console.log('Voice activation:', !isListening);
  };

  return (
    <>
      <Head>
        <title>ScingOS - Voice-First BFI Gateway</title>
        <meta name="description" content="Voice-first augmented intelligence platform" />
      </Head>

      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold text-gray-900">
              Welcome to <span className="text-primary-600">ScingOS</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Voice-first Bona Fide Intelligence Gateway Operating System
            </p>

            {user ? (
              <div className="space-y-4">
                <p className="text-lg text-gray-700">Hello, {user.email}</p>
                
                <div className="flex flex-col items-center space-y-4">
                  <VoiceButton
                    isListening={isListening}
                    onClick={handleVoiceActivation}
                  />
                  
                  {isListening && (
                    <p className="text-sm text-gray-500 animate-pulse">
                      Listening... Say "Hey, Scing!"
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Please sign in to start using ScingOS</p>
                <a
                  href="/auth/signin"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}