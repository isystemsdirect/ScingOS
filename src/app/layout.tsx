
'use client';

import { Inter } from "next/font/google";
import { Toaster as SonnerToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import AppShell from "@/components/app-shell";

import "./globals.css";
import "@/styles/background-slideshow.css";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessagingDialog } from '@/components/messaging-dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import BackgroundSlideshow from '@/components/background-slideshow';
import Logo from '@/components/logo';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockUserId = 'mock-dev-user';
    setUserId(mockUserId);
    
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
    
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const authRoutes = ['/login', '/', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <head>
          <title>SCINGULAR - AI-Powered Inspections</title>
          <meta name="description" content="The future of inspection technology, powered by AI." />
      </head>
      <body>
          {isAuthRoute ? (
             <>
                <BackgroundSlideshow />
                {children}
            </>
          ) : isLoading ? (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <BackgroundSlideshow />
                <div className="flex flex-col items-center gap-4">
                    <Logo isLoginPage={true} />
                    <p className="text-muted-foreground">Loading Ecosystem...</p>
                </div>
            </div>
          ) : (
            <TooltipProvider>
                <AppShell
                    userId={userId}
                    isFullScreen={isFullScreen}
                    toggleFullScreen={toggleFullScreen}
                    handleRefresh={handleRefresh}
                >
                    <main className={cn("flex-1 overflow-y-auto p-4 sm:px-6 sm:py-6 rounded-xl bg-[radial-gradient(ellipse_at_center,hsl(var(--card)/0.1)_0%,transparent_70%)]", 
                        pathname === '/messaging' && 'p-0 sm:p-0',
                        pathname === '/maps-weather' && 'p-0 sm:p-0'
                    )}>
                        {children}
                    </main>
                    <MessagingDialog />
                </AppShell>
            </TooltipProvider>
          )}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
