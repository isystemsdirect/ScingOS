
'use client';

import { useState, useEffect } from 'react';
import { Rss, Hash, CloudSun, AlertTriangle, X, Clock, Calendar } from 'lucide-react';
import { mockNotifications } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Notification = typeof mockNotifications[0];
type TimeFormat = '12h' | '24h';

const typeInfo = {
    post: { icon: Rss, label: 'New Post', href: '/social', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    topic: { icon: Hash, label: 'Trending', href: '/topics', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    weather: { icon: CloudSun, label: 'Weather', href: '/dashboard', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
    safety: { icon: AlertTriangle, label: 'Safety Alert', href: '/dashboard', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
}

export function FlashNotificationBar() {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [showTime, setShowTime] = useState(true);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');

  useEffect(() => {
    // Set initial time on client mount to avoid hydration errors
    setNow(new Date());

    // Check localStorage for saved time format preference
    const savedFormat = localStorage.getItem('time-format') as TimeFormat | null;
    if (savedFormat) {
        setTimeFormat(savedFormat);
    }

    const handleStorageChange = () => {
        const newFormat = localStorage.getItem('time-format') as TimeFormat | null;
        if (newFormat) {
            setTimeFormat(newFormat);
        }
    };
    
    window.addEventListener('storage', handleStorageChange);


    // Update time every second
    const timeInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    // Toggle between time and date every 4 seconds
    const toggleInterval = setInterval(() => {
        setShowTime(prev => !prev);
    }, 4000);

    return () => {
        clearInterval(timeInterval);
        clearInterval(toggleInterval);
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);


  useEffect(() => {
    if (mockNotifications.length === 0) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % mockNotifications.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (mockNotifications.length === 0) {
    return null;
  }

  const notification = mockNotifications[index];
  const Icon = typeInfo[notification.type].icon;
  const href = typeInfo[notification.type].href;

  const formatTime = (date: Date) => {
    if (timeFormat === '24h') {
        return format(date, 'HH:mm:ss');
    }
    return format(date, 'hh:mm:ss a');
  };

  return (
    <div className="relative z-20 w-full bg-background/50 backdrop-blur-lg border-b border-border">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 lg:px-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full flex-1 min-w-0"
                >
                <Link href={href} className="flex items-center gap-3 w-full">
                        <Badge variant="outline" className={cn("gap-2", typeInfo[notification.type].className)}>
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{typeInfo[notification.type].label}</span>
                        </Badge>
                        <p className="text-sm text-muted-foreground truncate">
                            <span className="font-semibold text-foreground">{notification.title}:</span>
                            <span className="ml-2 hidden md:inline">{notification.description}</span>
                        </p>
                </Link>
                </motion.div>
            </AnimatePresence>
            
            <div className="ml-4 pl-4 border-l border-border/50">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={showTime ? 'time' : 'date'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 text-sm font-mono w-[110px] justify-end"
                    >
                        {now ? (
                            showTime ? (
                                <>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{formatTime(now)}</span>
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{format(now, 'MM/dd/yyyy')}</span>
                                </>
                            )
                        ) : (
                           <div className="h-5 w-24 bg-muted/50 rounded-md animate-pulse" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
}

    