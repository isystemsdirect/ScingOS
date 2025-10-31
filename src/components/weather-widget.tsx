
'use client';

import { useEffect, useState } from 'react';
import {
  getWeatherForecast,
  type WeatherOutput,
} from '@/ai/flows/lari-weather-ai';
import {
  CloudSun,
  Loader2,
  MapPin,
  Cloudy,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  LocateFixed,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';

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

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherOutput | null>(null);
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
        try {
            const forecast = await getWeatherForecast({
                location: { lat, lng },
                forecastHorizonHours: 1,
            });
            setWeather(forecast);

            // Fetch location name from coordinates
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const city = data.results[0].address_components.find((c: any) => c.types.includes('locality'));
                const state = data.results[0].address_components.find((c: any) => c.types.includes('administrative_area_level_1'));
                if(city && state) {
                    setLocationName(`${city.long_name}, ${state.short_name}`);
                } else {
                    setLocationName('Current Location');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Could not fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Location access denied.');
        setLoading(false);
        // Fallback to a default location like Anytown, CA
        fetchWeather(34.0522, -118.2437);
        setLocationName('Anytown, CA');
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

  const WeatherIcon = weather.current?.condition
    ? weatherIcons[weather.current.condition.toLowerCase()] || weatherIcons.default
    : weatherIcons.default;

  return (
    <div className="p-2 group-data-[collapsed=true]:hidden">
        <div className="flex items-center gap-3">
            <WeatherIcon className="h-8 w-8 text-primary" />
            <div className="flex-1">
                <p className="font-bold text-lg text-sidebar-foreground">
                    {Math.round(weather.current.temperature)}°C
                </p>
                <p className="text-xs text-muted-foreground -mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationName || 'Loading...'}
                </p>
            </div>
        </div>
    </div>
  );
}
