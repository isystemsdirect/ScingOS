
'use client';

import { Briefcase, Clock, FileText, ListFilter, MapPin, PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockClients, mockJobs, mockInspectors } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import type { Job } from '@/lib/types';
import { DispatchWizard } from '@/components/dispatch-wizard';

export default function JobBoardPage() {
  const unassignedJobs = mockJobs.filter((j) => j.status === 'Unassigned');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Board</h1>
            <p className="text-muted-foreground max-w-2xl">
              A centralized view of all incoming, queued, and active jobs. Assign tasks to your team and manage your entire dispatch workflow from here.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/teams">
                <Users className="mr-2 h-4 w-4" />
                Back to Dispatch
              </Link>
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
            </Button>
          </div>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Unassigned Jobs
                </CardTitle>
                <CardDescription>
                  New inspection requests from clients that need to be assigned to an inspector.
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Sort
                    </span>
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
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unassignedJobs.map((job) => {
              const client = mockClients.find((c) => c.id === job.clientId);
              return (
                <Card key={job.id} className="flex flex-col bg-background/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg leading-tight">{job.type}</CardTitle>
                      <Badge variant={job.priority === 'High' ? 'destructive' : 'secondary'}>
                        {job.priority}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 pt-1">
                      <MapPin className="h-4 w-4" /> {job.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Client:</strong>{' '}
                        {client?.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Requested: {job.requestTime}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">Roofing</Badge>
                      <Badge variant="outline">Thermal</Badge>
                    </div>
                  </CardContent>
                  <CardContent className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="w-full">
                            View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle>{job.type}</DialogTitle>
                          <DialogDescription>
                            Job Request Details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Priority</span>
                                <Badge variant={job.priority === 'High' ? 'destructive' : 'secondary'}>
                                    {job.priority}
                                </Badge>
                            </div>
                            <Separator />
                             <div className="flex flex-col space-y-1">
                                <span className="text-muted-foreground text-sm">Client</span>
                                <span className="font-semibold">{client?.name}</span>
                            </div>
                             <div className="flex flex-col space-y-1">
                                <span className="text-muted-foreground text-sm">Location</span>
                                <span className="font-semibold">{job.address}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-muted-foreground text-sm">Requested</span>
                                <span className="font-semibold">{job.requestTime}</span>
                            </div>
                            <Separator />
                            <div className="flex flex-col space-y-2">
                                <span className="text-muted-foreground text-sm">Required Skills</span>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">Roofing</Badge>
                                    <Badge variant="outline">Thermal</Badge>
                                    <Badge variant="outline">Drone Certified</Badge>
                                </div>
                            </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DispatchWizard job={job} availableInspectors={mockInspectors.filter(i => i.onCall)} />
                  </CardContent>
                </Card>
              );
            })}
             {unassignedJobs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="mt-4 font-semibold">All jobs have been assigned.</p>
                  <p className="text-sm text-muted-foreground">Great work! The dispatch queue is clear.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
