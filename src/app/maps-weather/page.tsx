
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MarketplaceMap } from '@/components/marketplace-map';
import { mockInspectors, mockClients } from '@/lib/data';
import {
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  Thermometer,
  Wind,
  Cloudy,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    description: string;
    main: string;
  }[];
  wind: {
    speed: number;
  };
}

const weatherIcons: { [key: string]: React.ElementType } = {
  Clear: Sun,
  Clouds: Cloudy,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  default: CloudSun,
};

export default function MapsWeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');

  const fetchWeather = (lat: number, lon: number) => {
    const currentUnit =
      localStorage.getItem('temperature-unit') === 'C' ? 'metric' : 'imperial';
    setUnit(currentUnit);
    const apiKey = '06145e5a1bff8a8d2d507f0b19a5f71d';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

    setLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        return response.json();
      })
      .then((data) => {
        setWeather(data);
        setError(null);
      })
      .catch((err) => {
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
            fetchWeather(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          () => {
            setError('Cannot access location. Showing default weather.');
            fetchWeather(34.0522, -118.2437); // Fallback to LA
          }
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial fetch

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const WeatherIcon = weather?.weather[0]?.main
    ? weatherIcons[weather.weather[0].main] || weatherIcons.default
    : weatherIcons.default;

  return (
    <div className="mx-auto w-full max-w-full px-4 lg:px-6 h-full flex flex-col">
      <div className="py-4">
          <h1 className="text-3xl font-bold">Maps & Weather</h1>
          <p className="text-muted-foreground">
            Get a real-time operational overview and local weather conditions.
          </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start flex-1 overflow-hidden">
        <div className="h-full w-full rounded-lg overflow-hidden border">
          <MarketplaceMap inspectors={mockInspectors} clients={mockClients} />
        </div>

        <div className="sticky top-0 space-y-6 h-full overflow-y-auto">
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Current Weather</CardTitle>
              <CardDescription>
                Live conditions for your location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              ) : error && !weather ? (
                <div className="p-2 rounded-md bg-destructive/20 border border-destructive/50 text-destructive-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : weather ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <WeatherIcon className="h-16 w-16 text-primary" />
                    <div>
                      <p className="text-5xl font-bold">
                        {Math.round(weather.main.temp)}°
                        {unit === 'metric' ? 'C' : 'F'}
                      </p>
                      <p className="text-muted-foreground capitalize">
                        {weather.weather[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Thermometer className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="font-semibold">
                        {Math.round(weather.main.feels_like)}°
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Feels Like
                      </p>
                    </div>
                    <div>
                      <Droplets className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="font-semibold">
                        {weather.main.humidity}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Humidity
                      </p>
                    </div>
                    <div>
                      <Wind className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="font-semibold">
                        {Math.round(weather.wind.speed)}{' '}
                        {unit === 'metric' ? 'm/s' : 'mph'}
                      </p>
                      <p className="text-xs text-muted-foreground">Wind</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{weather.name}</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
