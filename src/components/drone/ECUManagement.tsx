'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface ECUManagementProps {
  droneId: string;
  ecuData?: {
    rpm: number;
    temp: number;
  };
  onECUCommand: (command: string) => void;
}

export function ECUManagement({ droneId, ecuData, onECUCommand }: ECUManagementProps) {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          ECU Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">RPM</p>
            <p className="text-2xl font-bold text-white">{ecuData?.rpm || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Temperature</p>
            <p className="text-2xl font-bold text-white">{ecuData?.temp || 'N/A'} °C</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => onECUCommand('START')} className="flex-1 bg-green-600 hover:bg-green-700">
            Start Engine
          </Button>
          <Button onClick={() => onECUCommand('STOP')} variant="destructive" className="flex-1">
            Stop Engine
          </Button>
        </div>
        <Button onClick={() => onECUCommand('DIAGNOSTICS')} variant="outline" className="w-full">
          Run Diagnostics
        </Button>
      </CardContent>
    </Card>
  );
}
