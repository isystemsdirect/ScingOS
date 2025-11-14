
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '../ui/button';
import { Camera, SlidersHorizontal, Video } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from '../ui/slider';

interface CameraControlsProps {
    devices: MediaDeviceInfo[];
    selectedDeviceId: string;
    onDeviceChange: (deviceId: string) => void;
    onCapture: () => void;
    disabled: boolean;
}

export function CameraControls({ devices, selectedDeviceId, onDeviceChange, onCapture, disabled }: CameraControlsProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="camera-select">Camera Device</Label>
                <Select value={selectedDeviceId} onValueChange={onDeviceChange} disabled={disabled || devices.length === 0}>
                    <SelectTrigger id="camera-select">
                        <SelectValue placeholder="Select a camera" />
                    </SelectTrigger>
                    <SelectContent>
                        {devices.map(device => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${devices.indexOf(device) + 1}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <Button onClick={onCapture} disabled={disabled} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Capture Frame
            </Button>
            
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="advanced-settings">
                    <AccordionTrigger>
                        <div className='flex items-center gap-2'>
                            <SlidersHorizontal className='h-4 w-4' />
                            Advanced Camera Settings
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                        <div className="grid gap-3">
                            <Label>Exposure</Label>
                            <Slider defaultValue={[50]} max={100} step={1} disabled={disabled}/>
                        </div>
                         <div className="grid gap-3">
                            <Label>White Balance</Label>
                            <Slider defaultValue={[4500]} min={2000} max={7500} step={100} disabled={disabled}/>
                        </div>
                         <div className="grid gap-3">
                            <Label>ISO</Label>
                            <Slider defaultValue={[400]} min={100} max={3200} step={100} disabled={disabled}/>
                        </div>
                         <div className="grid gap-3">
                            <Label>Focus</Label>
                            <Slider defaultValue={[75]} max={100} step={1} disabled={disabled}/>
                        </div>
                        <div className="grid gap-3">
                            <Label>Resolution</Label>
                             <Select defaultValue="1920x1080" disabled={disabled}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="640x480">640x480 (VGA)</SelectItem>
                                    <SelectItem value="1280x720">1280x720 (720p)</SelectItem>
                                    <SelectItem value="1920x1080">1920x1080 (1080p)</SelectItem>
                                    <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
