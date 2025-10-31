
'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  Calendar as CalendarIcon,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { mockInspectors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


type CellState = {
    state: 'booked' | 'available' | 'empty';
    inspectorId?: string;
    inspectorName?: string;
};

// Simple hash function to get a color from an inspector ID
const getColorFromId = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
}


export default function CalendarPage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = Array.from({ length: 13 }, (_, i) => `${i + 7}:00`); 

  const [gridState, setGridState] = useState<CellState[][] | null>(null);
  const [selectedInspectors, setSelectedInspectors] = useState<string[]>(
    mockInspectors.map(i => i.id)
  );

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    const newGridState: CellState[][] = times.map(() =>
      days.map((_, dayIndex) => {
        const isWorkday = dayIndex < 5;
        if (!isWorkday) return { state: 'empty' };
        
        const randomValue = Math.random();
        if (randomValue > 0.8) {
            const inspector = mockInspectors[Math.floor(Math.random() * mockInspectors.length)];
            return { state: 'booked', inspectorId: inspector.id, inspectorName: inspector.name.split(' ')[0] };
        }
        if (randomValue > 0.3) return { state: 'available' };
        return { state: 'empty' };
      })
    );
    setGridState(newGridState);
  }, []); // Empty dependency array ensures this runs once on mount

  const handleInspectorToggle = (inspectorId: string) => {
    setSelectedInspectors(prev => 
        prev.includes(inspectorId) 
        ? prev.filter(id => id !== inspectorId)
        : [...prev, inspectorId]
    );
  }

  const allInspectorsSelected = selectedInspectors.length === mockInspectors.length;
  const handleToggleAll = () => {
    if (allInspectorsSelected) {
      setSelectedInspectors([]);
    } else {
      setSelectedInspectors(mockInspectors.map(i => i.id));
    }
  }


  return (
    <div className="grid max-w-full gap-8 px-4 lg:px-6 md:grid-cols-[280px_1fr]">
       <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold">Calendar & Scheduling</h1>
            <p className="text-muted-foreground">
              Manage your schedule, availability, and bookings.
            </p>
          </div>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Users className="h-5 w-5"/> Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="toggle-all"
                        checked={allInspectorsSelected}
                        onCheckedChange={handleToggleAll}
                    />
                    <Label htmlFor="toggle-all" className="font-semibold">Toggle All</Label>
                </div>
                 {mockInspectors.map(inspector => {
                    const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                    return (
                        <div key={inspector.id} className="flex items-center space-x-3">
                             <Checkbox 
                                id={inspector.id} 
                                checked={selectedInspectors.includes(inspector.id)}
                                onCheckedChange={() => handleInspectorToggle(inspector.id)}
                                style={{ borderColor: getColorFromId(inspector.id) }}
                                className="data-[state=checked]:bg-transparent"
                            />
                            {avatar && (
                                <Image src={avatar.imageUrl} alt={inspector.name} width={32} height={32} className="rounded-full" data-ai-hint={inspector.imageHint} />
                            )}
                            <Label htmlFor={inspector.id} className="flex-1 cursor-pointer">{inspector.name}</Label>
                        </div>
                    )
                 })}
            </CardContent>
          </Card>
       </div>
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Schedule</CardTitle>
              <CardDescription>
                Weekly overview of your team's availability and bookings.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="gap-1"><CalendarIcon className="h-4 w-4"/> Oct 28 - Nov 3, 2023</Button>
                <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                 <Button asChild>
                    <Link href="/bookings/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Booking
                    </Link>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 grid-rows-[auto,1fr] gap-px border-l border-t bg-border">
            {/* Header row */}
            <div className="bg-card/80 p-2"></div>
            {days.map((day) => (
              <div key={day} className="bg-card/80 p-2 text-center font-semibold">
                {day}
              </div>
            ))}

            {/* Time slots */}
            {times.map((time, timeIndex) => (
              <React.Fragment key={time}>
                <div className="row-span-1 bg-card/80 p-2 text-right text-xs text-muted-foreground">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {time}
                  </div>
                </div>
                {days.map((day, dayIndex) => {
                    const cell = gridState ? gridState[timeIndex][dayIndex] : { state: 'empty' };
                    const isBookedAndSelected = cell.state === 'booked' && cell.inspectorId && selectedInspectors.includes(cell.inspectorId);
                    const color = cell.inspectorId ? getColorFromId(cell.inspectorId) : 'hsl(var(--primary))';
                    return (
                        <div key={`${day}-${time}`} className="row-span-1 bg-card/80 p-1 text-xs relative min-h-[50px]">
                           {cell.state === 'booked' ? (
                                <div 
                                    className={cn(
                                        "border border-primary/50 text-primary-foreground rounded-md p-1 h-full flex flex-col justify-center transition-all duration-300",
                                        isBookedAndSelected ? "bg-primary" : "bg-muted/40"
                                    )}
                                    style={isBookedAndSelected ? { backgroundColor: color, borderColor: color, color: '#fff' } : {}}
                                >
                                    <p className={cn("font-bold", !isBookedAndSelected && "text-muted-foreground/60")}>{cell.inspectorName}</p>
                                    <p className={cn("text-xs", isBookedAndSelected ? "opacity-80" : "text-muted-foreground/50")}>Booked</p>
                                </div>
                           ) : cell.state === 'available' ? (
                                <div className="bg-primary/20 border border-primary/50 text-primary-foreground rounded-md p-1 h-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                    <p>Available</p>
                                </div>
                           ): (
                                <div className="bg-muted/30 h-full rounded-md"></div>
                           )}
                        </div>
                    )
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
