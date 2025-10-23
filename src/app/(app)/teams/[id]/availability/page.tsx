
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { mockInspectors } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React from 'react';

export default function AvailabilityPage({ params }: { params: { id: string } }) {
  const inspector = mockInspectors.find((i) => i.id === params.id);

  if (!inspector) {
    notFound();
  }

  const avatar = PlaceHolderImages.find((p) => p.id === inspector.imageHint);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = Array.from({ length: 13 }, (_, i) => `${i + 7}:00`); // 7am to 7pm

  return (
    <div className="grid max-w-6xl mx-auto gap-8">
      <div className="flex items-center gap-4">
        <Link href="/teams">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Teams</span>
          </Button>
        </Link>
        {avatar && (
            <Image src={avatar.imageUrl} alt={inspector.name} width={40} height={40} className="rounded-full" data-ai-hint={avatar.imageHint} />
        )}
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {inspector.name}'s Availability
        </h1>
        <Badge variant={inspector.onCall ? 'default' : 'secondary'}>{inspector.onCall ? 'On-Call' : 'Unavailable'}</Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline">
            Manage Time Off
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Booking
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                View and manage this inspector's availability for the week.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="gap-1"><CalendarIcon className="h-4 w-4"/> Oct 28 - Nov 3, 2023</Button>
                <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 grid-rows-[auto,1fr] gap-px border-l border-t bg-border">
            {/* Header row */}
            <div className="bg-card p-2"></div>
            {days.map((day) => (
              <div key={day} className="bg-card p-2 text-center font-semibold">
                {day}
              </div>
            ))}

            {/* Time slots */}
            {times.map((time) => (
              <React.Fragment key={time}>
                <div className="row-span-1 bg-card p-2 text-right text-xs text-muted-foreground">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {time}
                  </div>
                </div>
                {days.map((day, dayIndex) => {
                    const isBooked = Math.random() > 0.8 && dayIndex < 5;
                    const isAvailable = Math.random() > 0.3 && dayIndex < 5;
                    return (
                        <div key={`${day}-${time}`} className="row-span-1 bg-card p-1 text-xs relative">
                           {isBooked ? (
                                <div className="bg-destructive/20 border border-destructive text-destructive-foreground rounded-md p-1 h-full flex flex-col justify-center">
                                    <p className="font-bold">Booked</p>
                                    <p className="text-xs">INS-002</p>
                                </div>
                           ) : isAvailable ? (
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
