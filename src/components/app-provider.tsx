
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppShell from './app-shell';
import { cn } from '@/lib/utils';
import { MessagingDialog } from './messaging-dialog';
import { TooltipProvider } from './ui/tooltip';
import BackgroundSlideshow from './background-slideshow';
import Logo from './logo';


export function AppProvider({
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

  if (isAuthRoute) {
    return (
        <>
            <BackgroundSlideshow />
            {children}
        </>
    );
  }

  if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <BackgroundSlideshow />
          <div className="flex flex-col items-center gap-4">
            <Logo isLoginPage={true} />
            <p className="text-muted-foreground">Loading Ecosystem...</p>
          </div>
       </div>
      );
  }

  return (
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
  );
}
