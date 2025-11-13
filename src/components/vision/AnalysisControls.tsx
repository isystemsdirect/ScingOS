
'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { VisionAnalysisOptions } from '@/lib/vision-data';

interface AnalysisControlsProps {
  options: VisionAnalysisOptions;
  onOptionChange: (options: VisionAnalysisOptions) => void;
  disabled: boolean;
}

const controlOptions = [
    { key: 'detectCracks' as keyof VisionAnalysisOptions, label: 'Detect Cracks' },
    { key: 'detectCorrosion' as keyof VisionAnalysisOptions, label: 'Detect Corrosion' },
    { key: 'detectSpalling' as keyof VisionAnalysisOptions, label: 'Detect Spalling' },
    { key: 'ocr' as keyof VisionAnalysisOptions, label: 'Read Text (OCR)' },
    { key: 'showConfidence' as keyof VisionAnalysisOptions, label: 'Show Confidence Scores' },
];

export function AnalysisControls({ options, onOptionChange, disabled }: AnalysisControlsProps) {
  const handleToggle = (key: keyof VisionAnalysisOptions, checked: boolean) => {
    onOptionChange({ ...options, [key]: checked });
  };

  return (
    <div className="space-y-4">
      {controlOptions.map(option => (
        <div key={option.key} className="flex items-center justify-between p-3 rounded-md border bg-background/40">
          <Label htmlFor={option.key} className="font-normal cursor-pointer">
            {option.label}
          </Label>
          <Switch
            id={option.key}
            checked={options[option.key]}
            onCheckedChange={(checked) => handleToggle(option.key, checked)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
