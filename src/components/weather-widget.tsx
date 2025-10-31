
'use client';

import { useEffect, useState } from 'react';
import {
  CloudSun,
  Loader2,
  MapPin,
  Cloudy,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const weatherIcons: { [key: string]: React.ElementType } = {
  Clear: Sun,
  Clouds: Cloudy,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  default: CloudSun,
};

interface WeatherData {
    name: string;
    main: {
        temp: number;
    };
    weather: {
        description: string;
        icon: string;
        main: string;
    }[];
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');

  const fetchWeather = (lat: number, lon: number) => {
    const currentUnit = localStorage.getItem('temperature-unit') === 'C' ? 'metric' : 'imperial';
    setUnit(currentUnit);
    const apiKey = 'cf5f05aff1d3b71885fb90702f9fd4cb';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;
    
    setLoading(true);
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        return response.json();
      })
      .then(data => {
        setWeather(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const handleStorageChange = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
              setError("Cannot access location. Showing default weather.");
              fetchWeather(34.0522, -118.2437); // Fallback to LA
            }
          );
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial fetch

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
        <div className="p-2 space-y-2 group-data-[collapsed=true]:hidden">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    )
  }
  
  if (error && !weather) {
    return (
        <div className="p-2 group-data-[collapsed=true]:hidden">
            <div className="p-2 rounded-md bg-destructive/20 border border-destructive/50 text-xs text-destructive-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">{error}</div>
            </div>
        </div>
    );
  }

  if (!weather) {
    return null;
  }

  const WeatherIcon = weather.weather[0]?.main
    ? weatherIcons[weather.weather[0].main] || weatherIcons.default
    : weatherIcons.default;

  return (
    <div className="p-2 group-data-[collapsed=true]:hidden">
        <div className="flex items-center gap-3">
            <WeatherIcon className="h-8 w-8 text-primary" />
            <div className="flex-1">
                <p className="font-bold text-lg text-sidebar-foreground">
                    {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </p>
                <p className="text-xs text-muted-foreground -mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {weather.name || 'Loading...'}
                </p>
            </div>
        </div>
        {error && (
             <div className="mt-2 p-1.5 rounded-md bg-yellow-500/20 border border-yellow-500/50 text-xs text-yellow-300 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                <div className="flex-1">{error}</div>
            </div>
        )}
    </div>
  );
}
