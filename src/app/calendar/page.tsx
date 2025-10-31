
'use client';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  Calendar as CalendarIcon,
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

type CellState = 'booked' | 'available' | 'empty';

export default function CalendarPage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = Array.from({ length: 13 }, (_, i) => `${i + 7}:00`); // 7am to 7pm

  const [gridState, setGridState] = useState<CellState[][] | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    const newGridState: CellState[][] = times.map(() =>
      days.map((_, dayIndex) => {
        const isWorkday = dayIndex < 5;
        if (!isWorkday) return 'empty';
        
        const randomValue = Math.random();
        if (randomValue > 0.8) return 'booked';
        if (randomValue > 0.3) return 'available';
        return 'empty';
      })
    );
    setGridState(newGridState);
  }, []); // Empty dependency array ensures this runs once on mount


  return (
    <div className="grid max-w-6xl mx-auto gap-8 px-4 lg:px-6">
       <div>
          <h1 className="text-3xl font-bold">Calendar & Scheduling</h1>
          <p className="text-muted-foreground">
            Manage your schedule, availability, and bookings.
          </p>
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
                    const cellState = gridState ? gridState[timeIndex][dayIndex] : 'empty';

                    return (
                        <div key={`${day}-${time}`} className="row-span-1 bg-card/80 p-1 text-xs relative min-h-[50px]">
                           {cellState === 'booked' ? (
                                <div className="bg-destructive/20 border border-destructive text-destructive-foreground rounded-md p-1 h-full flex flex-col justify-center">
                                    <p className="font-bold">Booked</p>
                                    <p className="text-xs">INS-002</p>
                                </div>
                           ) : cellState === 'available' ? (
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
