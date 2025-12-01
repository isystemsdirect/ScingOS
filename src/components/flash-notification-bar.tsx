
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Rss, Hash, CloudSun, AlertTriangle, X, Clock, Calendar, TrafficCone, Newspaper } from 'lucide-react';
import { mockNotifications as staticNotifications } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Notification = typeof staticNotifications[0];
type TimeFormat = '12h' | '24h';

interface WeatherData {
    name: string;
    main: {
        temp: number;
    };
    weather: {
        description: string;
        main: string;
    }[];
}

const typeInfo = {
    post: { icon: Rss, label: 'New Post', href: '/social', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    topic: { icon: Hash, label: 'Trending', href: '/topics', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    weather: { icon: CloudSun, label: 'Weather', href: '/maps-weather', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
    safety: { icon: AlertTriangle, label: 'Safety Alert', href: '/dashboard', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
    traffic: { icon: TrafficCone, label: 'Traffic Alert', href: '/maps-weather', className: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
    weather_news: { icon: Newspaper, label: 'Weather News', href: '/maps-weather', className: 'bg-sky-500/20 text-sky-300 border-sky-500/50' },
}

export function FlashNotificationBar() {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [showTime, setShowTime] = useState(true);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherUnit, setWeatherUnit] = useState<'metric' | 'imperial'>('imperial');

  const fetchWeather = (lat: number, lon: number) => {
    const apiKey = '06145e5a1bff8a8d2d507f0b19a5f71d'; // Replace with your key or move to env
    const unit = localStorage.getItem('temperature-unit') === 'C' ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Weather data fetch failed');
            return response.json();
        })
        .then(data => setWeather(data))
        .catch(console.error);
  };
  
  const fetchWeatherForCity = (city: string) => {
      const apiKey = '06145e5a1bff8a8d2d507f0b19a5f71d'; // Replace with your key or move to env
      const unit = localStorage.getItem('temperature-unit') === 'C' ? 'metric' : 'imperial';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
  
      fetch(url)
          .then(response => {
              if (!response.ok) throw new Error('Weather data fetch for city failed');
              return response.json();
          })
          .then(data => setWeather(data))
          .catch(console.error);
  };

  useEffect(() => {
    // Set initial time on client mount to avoid hydration errors
    setNow(new Date());

    const handleStorageChange = () => {
        const newFormat = localStorage.getItem('time-format-24h') === 'true' ? '24h' : '12h';
        setTimeFormat(newFormat);
        const newUnit = localStorage.getItem('temperature-unit') === 'C' ? 'metric' : 'imperial';
        setWeatherUnit(newUnit);

        const manualLocation = localStorage.getItem('manual-location');
        const useGps = localStorage.getItem('use-gps-location') === 'true';

        if (!useGps && manualLocation) {
            fetchWeatherForCity(manualLocation);
        } else {
             if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                    },
                    () => {
                    // Fallback to a default location if GPS fails
                    fetchWeather(34.0522, -118.2437);
                    }
                );
            }
        }
    };

    handleStorageChange(); // Check on mount
    
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

  const notifications = useMemo(() => {
    const weatherNotification = weather
      ? {
          id: 3,
          type: 'weather' as const,
          title: `Weather Update: ${weather.name}`,
          description: `${weather.weather[0].main}, ${Math.round(weather.main.temp)}°${weatherUnit === 'metric' ? 'C' : 'F'}. Conditions good for inspection.`,
        }
      : staticNotifications.find(n => n.type === 'weather');

    return staticNotifications.map(n => n.type === 'weather' && weatherNotification ? weatherNotification : n);
  }, [weather, weatherUnit]);


  useEffect(() => {
    if (notifications.length === 0) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % notifications.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  if (notifications.length === 0) {
    return null;
  }

  const notification = notifications[index];
  if (!notification) return null;

  const Icon = typeInfo[notification.type as keyof typeof typeInfo].icon;
  const href = typeInfo[notification.type as keyof typeof typeInfo].href;

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
                        <Badge variant="outline" className={cn("gap-2", typeInfo[notification.type as keyof typeof typeInfo].className)}>
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{typeInfo[notification.type as keyof typeof typeInfo].label}</span>
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
