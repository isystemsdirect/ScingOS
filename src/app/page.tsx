'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function FullscreenEntryPage() {
  const router = useRouter();

  const handleEnter = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        router.push('/login');
      });
    } else {
      router.push('/login');
    }

    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        router.push('/login');
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    // Fallback if the event doesn't fire
    setTimeout(() => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (!document.fullscreenElement) {
        router.push('/login');
      }
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green via-neon-blue to-primary rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-border-rotate"></div>
        <Button
          size="lg"
          onClick={handleEnter}
          className="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center"
        >
          <span className="text-primary group-hover:text-gray-50 transition-colors duration-200">
            INITIATE SCINGULAR AI
          </span>
        </Button>
      </div>
    </div>
  );
}
