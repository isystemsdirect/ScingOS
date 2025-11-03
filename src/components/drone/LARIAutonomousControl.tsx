'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Brain, Play, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LARIAutonomousControlProps {
  droneId: string;
  aiStatus?: {
    autonomous: boolean;
    mission: string;
  };
  onAIToggle: (enabled: boolean) => void;
}

export function LARIAutonomousControl({ droneId, aiStatus, onAIToggle }: LARIAutonomousControlProps) {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          LARI AI Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Autonomous Mode</h4>
            <p className="text-sm text-gray-400">Enable LARI AI to control the drone.</p>
          </div>
          <Switch
            checked={aiStatus?.autonomous}
            onCheckedChange={onAIToggle}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Current Mission</p>
          <Badge variant="outline" className="text-purple-300 border-purple-500">
            {aiStatus?.mission || 'None'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            <span>Set Waypoint Mission</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            <span>Start Autonomous Scan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
