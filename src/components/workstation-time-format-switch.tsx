
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function WorkstationTimeFormatSwitch() {
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const savedFormat = localStorage.getItem('time-format-24h');
    setIs24Hour(savedFormat === 'true');
  }, []);

  const handleCheckedChange = (checked: boolean) => {
    setIs24Hour(checked);
    localStorage.setItem('time-format-24h', String(checked));
    // Dispatch a storage event to notify other components like the FlashNotificationBar
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <Label htmlFor="time-format-switch" className="font-medium cursor-pointer">
          Time Format
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose between standard (12-hour) and military (24-hour) time.
        </p>
      </div>
      <Switch
        id="time-format-switch"
        checked={is24Hour}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}
