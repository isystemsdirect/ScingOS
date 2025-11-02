'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
       <div className="flex min-h-screen items-center justify-center bg-background/40 p-4">
            <div className="text-center">
                <Logo isLoginPage={true} />
                <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-lg text-muted-foreground">Loading SCINGULAR AI Dashboard...</p>
                </div>
            </div>
        </div>
    </main>
  );
}
