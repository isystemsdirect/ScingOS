
'use client';

import {
  ChevronLeft,
  Users,
  FileText,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Video,
  UserPlus,
} from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { mockConferenceRooms, mockInspectors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConferenceRoomHub() {
  const params = useParams();
  const roomId = params.id as string;
  const room = mockConferenceRooms.find(r => r.id === roomId);

  if (!room) {
    notFound();
  }

  const currentUser = mockInspectors[0];

  return (
    <div className="mx-auto w-full max-w-full px-4 lg:px-6 h-[calc(100vh_-_9rem)]">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/conference-rooms">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Meetings & Conferences</span>
            </Button>
          </Link>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-bold tracking-tight sm:grow-0">
            {room.name}
          </h1>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex -space-x-2 overflow-hidden">
                {room.participants.slice(0, 5).map(member => {
                    const avatar = PlaceHolderImages.find(p => p.id === member.imageHint);
                    return avatar ? <Image key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src={avatar.imageUrl} alt={member.name} width={32} height={32} /> : null
                })}
            </div>
             <Button variant="outline">Meeting Details</Button>
             <Button><Video className="mr-2 h-4 w-4" /> Join Meeting</Button>
          </div>
        </div>

        <div className="grid h-full flex-1 grid-cols-1 md:grid-cols-[1fr_350px] gap-6 overflow-hidden">
          {/* Main Chat Area */}
          <Card className="flex flex-col bg-card/60 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle>Meeting Discussion</CardTitle>
                <CardDescription>This is the central chat for all meeting participants. Files and images shared here are visible to everyone in the room.</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6">
                    {/* Chat messages would be rendered here */}
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl} />
                            <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">Jane Smith</p>
                                <p className="text-xs text-muted-foreground">10:05 AM</p>
                            </div>
                            <div className="mt-1 rounded-lg bg-muted p-3 text-sm">
                                Alright, let's start with the structural findings from the 123 Main St inspection. John, can you walk us through the foundation crack you noted?
                            </div>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">John Doe</p>
                                <p className="text-xs text-muted-foreground">10:06 AM</p>
                            </div>
                            <div className="mt-1 rounded-lg bg-primary/20 p-3 text-sm">
                                Of course. Attaching the primary evidence photo now. It's a non-structural hairline crack, approximately 1/16th inch wide, on the western wall. I've cross-referenced it with ACI 318-19, and it's within tolerance, but I recommend sealing it to prevent moisture ingress.
                                <Card className="mt-3 overflow-hidden">
                                    <Image src={PlaceHolderImages.find(p => p.id === 'inspection-foundation')?.imageUrl!} alt="Foundation Crack" width={300} height={200} className="object-cover" />
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
             <CardContent className="pt-6">
                <div className="relative">
                    <Input placeholder="Type your message..." className="pr-24" />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Mic className="h-4 w-4" /></Button>
                        <Button size="sm"><Send className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Side Panel */}
          <div className="flex flex-col gap-6 h-full overflow-hidden">
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Participants</CardTitle>
                        <CardDescription className="mt-1">View and manage meeting attendees.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{room.participants.length} members</p>
                      <Button variant="outline" size="icon" className="h-7 w-7">
                        <UserPlus className="h-4 w-4" />
                        <span className="sr-only">Invite Participant</span>
                      </Button>
                    </div>
                </CardHeader>
                <ScrollArea className="h-48">
                    <CardContent>
                        <ul className="space-y-4">
                            {room.participants.map(p => (
                                <li key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={PlaceHolderImages.find(i => i.id === p.imageHint)?.imageUrl} />
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.role}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </ScrollArea>
             </Card>
             <Card className="flex-1 flex flex-col bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Shared Documents</CardTitle>
                    <CardDescription>Access all documents shared during this meeting.</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between p-3 rounded-md border bg-background/50">
                                <div>
                                    <p className="font-medium text-sm">INS-001_Report_Final.pdf</p>
                                    <p className="text-xs text-muted-foreground">Uploaded by John Doe</p>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                            </li>
                             <li className="flex items-center justify-between p-3 rounded-md border bg-background/50">
                                <div>
                                    <p className="font-medium text-sm">Structural_Peer_Review_Notes.docx</p>
                                    <p className="text-xs text-muted-foreground">Uploaded by Jane Smith</p>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                            </li>
                        </ul>
                    </CardContent>
                </ScrollArea>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
