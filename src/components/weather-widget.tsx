
'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Snowflake, Loader2 } from 'lucide-react';
import { getWeatherForecast } from '@/ai/flows/get-weather-forecast';
import { mockInspectors } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function WeatherWidget() {
  const [weather, setWeather] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userLocation = mockInspectors[0].location.name;

  useEffect(() => {
    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);
        const forecast = await getWeatherForecast(userLocation);
        setWeather(forecast);
      } catch (e) {
        console.error("Failed to fetch weather:", e);
        setError("Could not load weather data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWeather();
  }, [userLocation]);

  const renderWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('thunder')) return <CloudLightning className="h-6 w-6 text-primary" />;
    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain className="h-6 w-6 text-primary" />;
    if (desc.includes('snow')) return <Snowflake className="h-6 w-6 text-primary" />;
    if (desc.includes('cloud') || desc.includes('overcast')) return <Cloud className="h-6 w-6 text-primary" />;
    if (desc.includes('sunny') || desc.includes('clear')) return <Sun className="h-6 w-6 text-primary" />;
    if (desc.includes('wind')) return <Wind className="h-6 w-6 text-primary" />;
    return <Sun className="h-6 w-6 text-primary" />;
  };

  const parseWeather = (text: string) => {
    const tempMatch = text.match(/(\d+)\s*degrees/);
    const temp = tempMatch ? tempMatch[1] : null;

    const summaryMatch = text.match(/currently\s\d+\s*degrees\sand\s(.*?)\./i);
    let summary = summaryMatch ? summaryMatch[1] : 'Clear';
    if(summary.endsWith(',')) summary = summary.slice(0,-1);


    return { temp, summary };
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
            <p className='font-bold'>Weather Unavailable</p>
            <p>{error || "Could not retrieve forecast."}</p>
        </div>
    );
  }

  const { temp, summary } = parseWeather(weather);


  return (
    <div className="p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
        <div className="flex items-start gap-4">
            {renderWeatherIcon(summary)}
            <div className='flex-1'>
                <p className="font-bold text-lg text-sidebar-foreground">{temp}° F</p>
                <p className="text-sm text-muted-foreground capitalize">{summary}</p>
            </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{weather.split('Safety Recommendation:')[1] || ''}</p>
    </div>
  );
}
