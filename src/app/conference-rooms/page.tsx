
'use client';

import { Building, PlusCircle, Video, Users, Search, Globe, Lock, Clock, MoreVertical, User } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function MeetingsAndConferencesPage() {
  const conferences = mockConferenceRooms.filter(r => r.type === 'conference');
  const meetings = mockConferenceRooms.filter(r => r.type === 'meeting');

  const getStatusInfo = (room: typeof mockConferenceRooms[0]) => {
      if (room.privacy === 'private') {
          return { text: 'Private & Locked', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: <Lock className="h-3 w-3" /> };
      }
      switch (room.status) {
          case 'Live':
              return { text: 'Live Now', color: 'bg-green-500/20 text-green-300 border-green-500/50', icon: <Video className="h-3 w-3" /> };
          case 'Scheduled':
              return { text: 'Lobby Open', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: <Clock className="h-3 w-3" /> };
          default:
              return { text: 'Completed', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50', icon: <Clock className="h-3 w-3" /> };
      }
  };


  const renderRoomCard = (room: typeof mockConferenceRooms[0]) => {
    const statusInfo = getStatusInfo(room);
    const isPrivate = room.privacy === 'private';
    const isLive = room.status === 'Live' && !isPrivate;

    return (
        <Card key={room.id} className="flex flex-col bg-card/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <CardDescription className="mt-1">{room.description}</CardDescription>
                    </div>
                     <Badge variant={'outline'} className={cn("gap-1.5 whitespace-nowrap", statusInfo.color)}>
                        {statusInfo.icon}
                        {statusInfo.text}
                    </Badge>
                </div>
                 <p className="text-xs text-muted-foreground pt-2">
                    Scheduled for: {format(new Date(room.scheduledTime), 'MMM d, yyyy, h:mm a')}
                </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{room.participants.length} Participants invited</span>
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
                 <Button asChild className="w-full" disabled={!isLive && !isPrivate}>
                    <Link href={isLive ? `/conference-rooms/${room.id}` : '#'}>
                        {isPrivate ? <><Lock className="mr-2 h-4 w-4"/>Request to Join</> : <><Video className="mr-2 h-4 w-4" />{room.type === 'conference' ? "Join Conference" : "Join Meeting"}</>}
                    </Link>
                </Button>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
  };


  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meetings & Conferences</h1>
            <p className="text-muted-foreground max-w-2xl mt-1">This is your collaboration hub. Create private meetings for individual stakeholders or schedule large-scale, team-based conferences. Use the Scing AI search to find public rooms, topics, or members across the network.</p>
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
            placeholder="Search for public rooms, topics, or members with Scing AI..."
            className="w-full rounded-full bg-card/60 backdrop-blur-sm pl-12 h-12 text-base"
          />
        </div>

        <div className="space-y-8">
          {/* Conference Rooms Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-1 flex items-center gap-3"><Building className="h-6 w-6 text-primary"/>Conference Rooms</h2>
            <p className="text-muted-foreground mb-4">Large-scale, team-based collaborative events.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conferences.map(renderRoomCard)}
            </div>
          </div>

          <Separator />

          {/* Meeting Rooms Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-1 flex items-center gap-3"><Users className="h-6 w-6 text-primary"/>Meeting Rooms</h2>
            <p className="text-muted-foreground mb-4">Focused discussions for individuals and small groups.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meetings.map(renderRoomCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
