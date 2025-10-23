'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Expand } from 'lucide-react';

export default function FullscreenEntryPage() {
  const router = useRouter();

  const handleEnter = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        // Even if fullscreen fails, navigate to the app.
        router.push('/login');
      });
    } else {
        // Fallback for browsers that don't support the API.
         router.push('/login');
    }
    
    // We navigate after the fullscreen promise resolves or is caught.
    // A listener is the most reliable way.
    const onFullscreenChange = () => {
        if (document.fullscreenElement) {
            router.push('/login');
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);

    // As a fallback if the event doesn't fire for some reason
    setTimeout(() => {
         document.removeEventListener('fullscreenchange', onFullscreenChange);
         if (!document.fullscreenElement) {
            router.push('/login');
         }
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 text-center">
        <Logo />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          The Future of Inspection is Here
        </h1>
        <p className="max-w-xl text-muted-foreground md:text-lg">
          For the best experience, enter fullscreen mode.
        </p>
        <Button size="lg" onClick={handleEnter}>
          <Expand className="mr-2 h-5 w-5" />
          Enter Scingular
        </Button>
      </div>
    </div>
  );
}
