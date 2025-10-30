
'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Snowflake, Loader2, AlertTriangle } from 'lucide-react';
import { getWeatherForecast } from '@/ai/flows/get-weather-forecast';
import { mockInspectors } from '@/lib/data';

type ParsedWeather = {
    temp: number | null;
    summary: string | null;
    recommendation: string | null;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<ParsedWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userLocation = mockInspectors[0].location.name;

  useEffect(() => {
    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);
        const forecast = await getWeatherForecast(userLocation);
        
        if (forecast?.weatherData && forecast?.recommendation) {
            setWeather({
                temp: forecast.weatherData.temperature,
                summary: forecast.weatherData.description,
                recommendation: forecast.recommendation,
            });
        } else {
             throw new Error("Invalid weather data structure received.");
        }

      } catch (e: any) {
        console.error("Failed to fetch weather:", e);
        setError(e.message || "Could not load weather data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWeather();
  }, [userLocation]);

  const renderWeatherIcon = (description: string | null) => {
    if (!description) return <Sun className="h-6 w-6 text-primary" />;
    const desc = description.toLowerCase();
    if (desc.includes('thunder')) return <CloudLightning className="h-6 w-6 text-primary" />;
    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain className="h-6 w-6 text-primary" />;
    if (desc.includes('snow')) return <Snowflake className="h-6 w-6 text-primary" />;
    if (desc.includes('cloud') || desc.includes('overcast')) return <Cloud className="h-6 w-6 text-primary" />;
    if (desc.includes('sunny') || desc.includes('clear')) return <Sun className="h-6 w-6 text-primary" />;
    if (desc.includes('wind')) return <Wind className="h-6 w-6 text-primary" />;
    return <Sun className="h-6 w-6 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border flex items-center justify-center h-[98px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !weather) {
    return (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-xs">
            <p className='font-bold flex items-center gap-2'><AlertTriangle className="h-4 w-4" />Weather Unavailable</p>
            <p className="mt-1">{error || "Could not retrieve forecast."}</p>
        </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
        <div className="flex items-start gap-4">
            {renderWeatherIcon(weather.summary)}
            <div className='flex-1'>
                <p className="font-bold text-lg text-sidebar-foreground">{weather.temp}° F</p>
                <p className="text-sm text-muted-foreground capitalize">{weather.summary}</p>
            </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{weather.recommendation}</p>
    </div>
  );
}
