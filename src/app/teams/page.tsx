'use client';

import { Building, Users, ArrowRight, PlusCircle, UserPlus, Search, Globe, Lock, Briefcase, MapPin, Star, ShieldCheck, Phone, Mail, Clock, ListFilter, FileText, MessageSquare, User } from 'lucide-react';
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
import { PlaceHolderImages } from '@/components/../lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MarketplaceMap } from '@/components/marketplace-map';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMessagingStore } from '@/lib/stores/messaging-store';


export default function TeamDispatchPage() {
  const availableInspectors = mockInspectors.filter(i => i.onCall);
  const unassignedJobs = mockJobs.filter(j => j.status === 'Unassigned');
  const activeJobs = mockJobs.filter(j => j.status !== 'Unassigned' && j.status !== 'Completed');
  const openMessagingDialog = useMessagingStore((state) => state.openDialog);

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
              <Link href="/teams/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                View Job Board
              </Link>
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

            <div className="flex flex-col gap-6 h-full overflow-hidden">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Job Board</CardTitle>
                                <CardDescription>Manage incoming inspection requests from clients.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold">You have {unassignedJobs.length} unassigned jobs.</p>
                        <p className="text-sm text-muted-foreground">Go to the Job Board to view details and dispatch your team.</p>
                         <Button asChild className="mt-4">
                            <Link href="/teams/jobs">View Job Board</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Tabs defaultValue="available-inspectors" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="available-inspectors">Available Inspectors ({availableInspectors.length})</TabsTrigger>
                      <TabsTrigger value="active-jobs">Active Jobs ({activeJobs.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="available-inspectors" className="flex-1 overflow-hidden">
                    <Card className="bg-card/60 backdrop-blur-sm h-full flex flex-col border-0 shadow-none">
                        <CardHeader className="pt-4">
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
                                            {avatar && <Image src={avatar.imageUrl} alt={inspector.name} width={48} height={48} className="rounded-full" data-ai-hint={avatar.imageHint} />}
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
                                            <div className="flex flex-col gap-2">
                                                <Button variant="outline" size="sm">Dispatch</Button>
                                                <Button variant="secondary" size="sm" onClick={() => openMessagingDialog(inspector.id, inspector.name)}>
                                                    <MessageSquare className="mr-2 h-3 w-3" />Message
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                  </TabsContent>
                  <TabsContent value="active-jobs" className="flex-1 overflow-hidden">
                    <Card className="bg-card/60 backdrop-blur-sm h-full flex flex-col border-0 shadow-none">
                        <CardHeader className="pt-4">
                            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Active Jobs</CardTitle>
                            <CardDescription>Inspections currently in progress by your team.</CardDescription>
                        </CardHeader>
                         <ScrollArea className="flex-1">
                            <CardContent className="space-y-4">
                                {activeJobs.map(job => {
                                    const inspector = mockInspectors.find(i => i.id === job.assignedInspectorId);
                                    const avatar = inspector ? PlaceHolderImages.find(p => p.id === inspector.imageHint) : null;
                                    return (
                                        <div key={job.id} className="p-4 rounded-lg border bg-background/50">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <p className="font-semibold">{job.type}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {job.address}
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{job.status}</Badge>
                                            </div>
                                            <Separator className="my-3" />
                                            <div className="flex items-center justify-between">
                                                {inspector && avatar ? (
                                                     <div className="flex items-center gap-3">
                                                        <Image src={avatar.imageUrl} alt={inspector.name} width={32} height={32} className="rounded-full" data-ai-hint={avatar.imageHint} />
                                                        <div>
                                                            <p className="text-sm font-medium">{inspector.name}</p>
                                                            <p className="text-xs text-muted-foreground">Assigned Inspector</p>
                                                        </div>
                                                     </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                         <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                         </div>
                                                         <p className="text-sm text-muted-foreground">Inspector not found</p>
                                                     </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm">View Job</Button>
                                                    {inspector && (
                                                        <Button variant="secondary" size="sm" onClick={() => openMessagingDialog(inspector.id, inspector.name)}>
                                                            <MessageSquare className="mr-2 h-3 w-3" />Message
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                 {activeJobs.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No active jobs at the moment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                  </TabsContent>
                </Tabs>
            </div>
        </div>
      </div>
    </div>
  );
}
