
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import { AnimatePresence, motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // Show loading screen for 4 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      router.replace('/login');
    }
  }, [loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-transparent">
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="w-full max-w-md"
                >
                    <Logo isLoginPage={true} />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
