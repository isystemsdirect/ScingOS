
'use client';

import { Building, PlusCircle, Video, Users, Search, Globe, Lock, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { mockConferenceRooms } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function MeetingsAndConferencesPage() {
  const conferences = mockConferenceRooms.filter(r => r.type === 'conference');
  const meetings = mockConferenceRooms.filter(r => r.type === 'meeting');

  const renderRoomCard = (room: typeof mockConferenceRooms[0]) => (
    <Card key={room.id} className="flex flex-col bg-card/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardHeader>
            <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <Badge variant={room.privacy === 'public' ? 'secondary' : 'outline'} className="gap-1.5">
                  {room.privacy === 'public' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3" />}
                  <span className="capitalize">{room.privacy}</span>
                </Badge>
            </div>
            <CardDescription>{room.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{room.participants.length} Participants</span>
            </div>
            <div className="flex items-center">
                <p className="text-sm font-medium mr-2">Attendees:</p>
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
        <CardFooter className="flex items-center gap-2">
             <Button asChild className="w-full">
                <Link href={`/conference-rooms/${room.id}`}>
                    <Video className="mr-2 h-4 w-4" />
                    {room.type === 'conference' ? 'Join Conference' : 'Join Meeting'}
                </Link>
            </Button>
        </CardFooter>
    </Card>
  );


  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meetings & Conferences</h1>
            <p className="text-muted-foreground">
              Schedule and join individual meetings or large-scale team conferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
                <User className="mr-2 h-4 w-4" /> New Meeting
            </Button>
            <Button>
              <Users className="mr-2 h-4 w-4" /> New Conference
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for public meetings, conferences, or topics with Scing AI..."
            className="w-full rounded-full bg-card/60 backdrop-blur-sm pl-12 h-12 text-base"
          />
        </div>

        <div className="space-y-8">
          {/* Conference Rooms Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><Building className="h-6 w-6 text-primary"/>Conference Rooms</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conferences.map(renderRoomCard)}
            </div>
          </div>

          <Separator />

          {/* Meeting Rooms Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><Users className="h-6 w-6 text-primary"/>Meeting Rooms</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meetings.map(renderRoomCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
