
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
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const weatherIcons: { [key: string]: React.ElementType } = {
  clear: Sun,
  clouds: Cloudy,
  'partly cloudy': Cloudy,
  rain: CloudRain,
  'light rain': CloudRain,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
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
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const fetchWeather = async (lat: number, lng: number) => {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
            setError("OpenWeatherMap API key is not configured.");
            setLoading(false);
            return;
        }
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Weather API request failed with status ${response.status}`);
            }
            const data: WeatherData = await response.json();
            setWeather(data);
            setLocationName(data.name);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Could not fetch weather data.');
            }
        } finally {
            setLoading(false);
        }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Location access denied. Displaying default.');
        // Fallback to a default location like Anytown, CA
        fetchWeather(34.0522, -118.2437);
      }
    );
  }, []);
    
  if (loading) {
    return (
        <div className="p-2 space-y-2">
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
    ? weatherIcons[weather.weather[0].main.toLowerCase()] || weatherIcons.default
    : weatherIcons.default;

  return (
    <div className="p-2 group-data-[collapsed=true]:hidden">
        <div className="flex items-center gap-3">
            <WeatherIcon className="h-8 w-8 text-primary" />
            <div className="flex-1">
                <p className="font-bold text-lg text-sidebar-foreground">
                    {Math.round(weather.main.temp)}°C
                </p>
                <p className="text-xs text-muted-foreground -mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationName || 'Loading...'}
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
