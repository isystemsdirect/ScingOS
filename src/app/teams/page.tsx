
'use client';

import { Building, Users, ArrowRight, PlusCircle, UserPlus, Search, Globe, Lock, Briefcase, MapPin, Star, ShieldCheck, Phone, Mail, Clock, ListFilter } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockTeamsData, mockInspectors, mockClients, mockJobs } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MarketplaceMap } from '@/components/marketplace-map';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function TeamDispatchPage() {
  const availableInspectors = mockInspectors.filter(i => i.onCall);
  const unassignedJobs = mockJobs.filter(j => j.status === 'Unassigned');

  return (
    <div className="mx-auto w-full max-w-full px-4 lg:px-6 h-[calc(100vh_-_9rem)] overflow-hidden">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams & Dispatch</h1>
            <p className="text-muted-foreground max-w-3xl">
              This is the operational command center for your field teams. View real-time locations, manage unassigned jobs, and dispatch available inspectors to new client requests.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/teams/manage"><Users className="mr-2 h-4 w-4"/>Manage Teams</Link>
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <Card className="bg-card/60 backdrop-blur-sm h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Live Dispatch Map</CardTitle>
                    <CardDescription>Real-time overview of available inspectors and incoming job requests.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 rounded-b-lg overflow-hidden">
                    <MarketplaceMap 
                        inspectors={availableInspectors}
                        clients={[]} // Pass jobs as clients for now for map markers
                    />
                </CardContent>
            </Card>

            <div className="grid grid-rows-2 gap-6 h-full overflow-hidden">
                <Card className="bg-card/60 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader>
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Dispatch Control Panel</CardTitle>
                                <CardDescription>Manage incoming inspection requests and assign them to your team.</CardDescription>
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Priority</DropdownMenuItem>
                                    <DropdownMenuItem>Newest</DropdownMenuItem>
                                    <DropdownMenuItem>Closest</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col">
                         <Tabs defaultValue="incoming" className="flex-1 flex flex-col">
                            <div className="px-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="incoming">Incoming ({unassignedJobs.length})</TabsTrigger>
                                    <TabsTrigger value="queued">Queued (0)</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="incoming" className="flex-1 mt-0">
                                <ScrollArea className="h-full">
                                    <div className="space-y-4 p-6 pt-4">
                                        {unassignedJobs.map(job => (
                                            <div key={job.id} className="p-4 rounded-lg border bg-background/50 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{job.type}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.address}</p>
                                                    </div>
                                                    <Badge variant={job.priority === 'High' ? 'destructive' : 'secondary'}>{job.priority}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Client: {mockClients.find(c => c.id === job.clientId)?.name}</span>
                                                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Requested: {job.requestTime}</div>
                                                </div>
                                                <div className="border-t pt-3 flex flex-wrap gap-1">
                                                    <Badge variant="outline">Roofing</Badge>
                                                    <Badge variant="outline">Thermal</Badge>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                                    <Button size="sm" className="w-full">Dispatch</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="queued" className="flex-1 mt-0">
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    <p>No jobs in the queue.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Available Inspectors</CardTitle>
                        <CardDescription>Team members currently on-call and ready for dispatch.</CardDescription>
                    </CardHeader>
                     <ScrollArea className="flex-1">
                        <CardContent className="space-y-4">
                            {availableInspectors.map(inspector => {
                                const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                                return (
                                <div key={inspector.id} className="p-4 rounded-lg border bg-background/50">
                                    <div className="flex items-start gap-4">
                                        {avatar && <Image src={avatar.imageUrl} alt={inspector.name} width={48} height={48} className="rounded-full" />}
                                        <div className="flex-1">
                                            <p className="font-semibold">{inspector.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="h-3 w-3 fill-primary text-primary" /> {inspector.rating}
                                                <Separator orientation="vertical" className="h-4" />
                                                <MapPin className="h-3 w-3" /> {inspector.location.name}
                                            </div>
                                             <div className="flex flex-wrap gap-1 mt-2">
                                                {inspector.certifications.slice(0, 2).map(cert => (
                                                    <Badge key={cert.id} variant="secondary" className="text-xs font-normal gap-1"><ShieldCheck className="h-3 w-3"/>{cert.name.substring(0, 25)}...</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Dispatch</Button>
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
