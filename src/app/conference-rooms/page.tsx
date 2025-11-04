'use client';

import { Calendar, PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockConferenceRooms } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ConferenceRoomsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conference Rooms</h1>
            <p className="text-muted-foreground">
              Schedule and join cross-team executive meetings.
            </p>
          </div>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Room
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockConferenceRooms.map((room) => (
                <Card key={room.id} className="flex flex-col bg-card/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-xl">{room.name}</CardTitle>
                            <Badge variant={room.status === 'Live' ? 'destructive' : 'secondary'}>{room.status}</Badge>
                        </div>
                        <CardDescription>{room.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{new Date(room.scheduledTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                            <p className="text-sm font-medium mr-2">Participants:</p>
                             <div className="flex -space-x-2 overflow-hidden">
                                {room.participants.slice(0, 5).map(member => {
                                    const avatar = PlaceHolderImages.find(p => p.id === member.imageHint);
                                    return avatar ? <Image key={member.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-background" src={avatar.imageUrl} alt={member.name} width={24} height={24} /> : null
                                })}
                                {room.participants.length > 5 && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-2 ring-background">
                                        +{room.participants.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/conference-rooms/${room.id}`}>
                                <Video className="mr-2 h-4 w-4" />
                                {room.status === 'Live' ? 'Join Now' : 'Enter Room'}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
