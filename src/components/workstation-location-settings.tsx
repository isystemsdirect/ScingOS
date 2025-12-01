
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WorkstationLocationSettings() {
  const [useGps, setUseGps] = useState(true);
  const [manualLocation, setManualLocation] = useState('');
  const [inputLocation, setInputLocation] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedGpsPref = localStorage.getItem('use-gps-location');
    const savedManualLoc = localStorage.getItem('manual-location');
    
    setUseGps(savedGpsPref !== 'false'); // Default to true if not set
    
    if (savedManualLoc) {
      setManualLocation(savedManualLoc);
      setInputLocation(savedManualLoc);
    }
  }, []);

  const handleGpsToggle = (checked: boolean) => {
    setUseGps(checked);
    localStorage.setItem('use-gps-location', String(checked));
    // Dispatch a storage event to notify other components like the weather widget
    window.dispatchEvent(new Event('storage'));
    toast({
      title: 'Location Settings Updated',
      description: `Switched to ${checked ? 'Automatic GPS Detection' : 'Manual Location'}.`,
    });
  };

  const handleManualLocationSave = () => {
    setManualLocation(inputLocation);
    localStorage.setItem('manual-location', inputLocation);
    window.dispatchEvent(new Event('storage'));
     toast({
      title: 'Location Saved',
      description: `Weather and alerts will now use "${inputLocation}".`,
    });
  };

  return (
    <div className="grid gap-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="gps-toggle" className="font-medium cursor-pointer">
                Automatic GPS Detection
                </Label>
                <p className="text-sm text-muted-foreground">
                Use your device's GPS for weather and location data.
                </p>
            </div>
            <Switch
                id="gps-toggle"
                checked={useGps}
                onCheckedChange={handleGpsToggle}
            />
        </div>
        {!useGps && (
            <div className="grid gap-3 rounded-lg border p-4">
                <Label htmlFor="manual-location">Set Manual Location</Label>
                <p className="text-sm text-muted-foreground -mt-1">Enter a city name for weather and alerts.</p>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="manual-location" 
                        value={inputLocation}
                        onChange={(e) => setInputLocation(e.target.value)}
                        placeholder="e.g., New York, US" 
                        className="pl-9" 
                    />
                </div>
                 <Button onClick={handleManualLocationSave} className="w-fit">Save Location</Button>
            </div>
        )}
    </div>
  );
}
