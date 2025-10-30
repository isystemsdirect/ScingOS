
'use client';

import { useState, useEffect } from 'react';
import { Rss, Hash, CloudSun, AlertTriangle, X } from 'lucide-react';
import { mockNotifications } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Notification = typeof mockNotifications[0];

const typeInfo = {
    post: { icon: Rss, label: 'New Post', href: '/social', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    topic: { icon: Hash, label: 'Trending', href: '/topics', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    weather: { icon: CloudSun, label: 'Weather', href: '/dashboard', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
    safety: { icon: AlertTriangle, label: 'Safety Alert', href: '/dashboard', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
}

export function FlashNotificationBar() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (mockNotifications.length === 0) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % mockNotifications.length);
    }, 5000); // Change notification every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || mockNotifications.length === 0) {
    return null;
  }

  const notification = mockNotifications[index];
  const Icon = typeInfo[notification.type].icon;
  const href = typeInfo[notification.type].href;

  return (
    <div className="relative z-20 w-full bg-background/50 backdrop-blur-lg border-b border-border">
      <AnimatePresence mode="wait">
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Link href={href}>
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 lg:px-6 cursor-pointer">
                <div className="flex items-center gap-3">
                     <Badge variant="outline" className={cn("gap-2", typeInfo[notification.type].className)}>
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{typeInfo[notification.type].label}</span>
                    </Badge>
                    <p className="text-sm text-muted-foreground truncate">
                        <span className="font-semibold text-foreground">{notification.title}:</span>
                        <span className="ml-2 hidden md:inline">{notification.description}</span>
                    </p>
                </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss notifications</span>
      </button>
    </div>
  );
}
