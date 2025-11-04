'use client';

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Users,
  FileText,
  MessageSquare,
  Shield,
  Crown,
  MoreVertical,
  Bell,
  CheckCircle,
  Briefcase
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockInspectors } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";

// Mock data based on your architecture
const mockTeamsData = {
    'team-doe-inspections': {
        id: 'team-doe-inspections',
        name: 'Doe Inspections LLC',
        description: 'Primary residential and commercial inspection team.',
        members: mockInspectors.slice(0, 4),
        docs: [
            { id: 'doc-1', name: 'Residential Inspection Checklist v2.3.pdf', type: 'pdf', lastUpdated: '2023-11-02' },
            { id: 'doc-2', name: 'Commercial HVAC Inspection Guide.docx', type: 'doc', lastUpdated: '2023-10-15' },
        ],
        adminActions: [
            { id: 'log-1', admin: 'John Doe', action: 'Updated member role for Jane Smith to "Lead Inspector".', timestamp: '2023-11-03 10:05 AM' },
        ]
    },
    'team-special-projects': {
        id: 'team-special-projects',
        name: 'Special Projects Unit',
        description: 'Focused on large-scale industrial and infrastructure projects.',
        members: [mockInspectors[2], mockInspectors[3]],
        docs: [
            { id: 'doc-3', name: 'Bridge Inspection Protocol (DOT-77B).pdf', type: 'pdf', lastUpdated: '2023-09-01' },
        ],
        adminActions: []
    },
};

// Assume the current user is an admin
const currentUserRole = 'Admin';

export default function TeamCentralHubPage() {
  const params = useParams();
  const teamId = params.id as keyof typeof mockTeamsData;
  const team = mockTeamsData[teamId];

  if (!team) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href="/teams">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Teams</span>
            </Button>
          </Link>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-3xl font-bold tracking-tight sm:grow-0">
            {team.name}
          </h1>
          <Button>Send Announcement</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Action Sidebar */}
            <nav className="sticky top-20 flex flex-col gap-2">
                <Button variant="ghost" className="justify-start gap-2"><Users className="h-4 w-4"/> Team Roster</Button>
                <Button variant="ghost" className="justify-start gap-2"><FileText className="h-4 w-4"/> Project Docs</Button>
                <Button variant="ghost" className="justify-start gap-2"><MessageSquare className="h-4 w-4"/> Team Chat</Button>
                {currentUserRole === 'Admin' && (
                    <Button variant="ghost" className="justify-start gap-2"><Shield className="h-4 w-4"/> Admin Panel</Button>
                )}
            </nav>

            <div className="space-y-8">
                {/* Team Members List */}
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Team Roster</CardTitle>
                        <CardDescription>Members of {team.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {team.members.map((member, index) => {
                            const avatar = PlaceHolderImages.find(p => p.id === member.imageHint);
                            const role = index === 0 ? 'Admin' : index === 1 ? 'Lead Inspector' : 'Inspector';
                            const status = member.onCall ? 'On-Call' : 'Offline';
                            return (
                                <TableRow key={member.id}>
                                <TableCell className="flex items-center gap-3">
                                    {avatar && <Image src={avatar.imageUrl} alt={member.name} width={32} height={32} className="rounded-full" />}
                                    <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{`user${index+1}@scingular.com`}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={role === 'Admin' ? 'default' : 'secondary'} className="gap-1">
                                    {role === 'Admin' && <Crown className="h-3 w-3" />}
                                    {role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={status === 'On-Call' ? 'default' : 'outline'} className="gap-1">
                                        <div className={`h-2 w-2 rounded-full ${status === 'On-Call' ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                                        {status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                                        <DropdownMenuItem>Assign Task</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            );
                            })}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Project Docs */}
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Project Documents</CardTitle>
                        <CardDescription>Shared documents relevant to this team's projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {team.docs.length > 0 ? (
                           <ul className="space-y-3">
                                {team.docs.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 rounded-md border bg-background/50">
                                        <div>
                                            <p className="font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">Last updated: {doc.lastUpdated}</p>
                                        </div>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </li>
                                ))}
                           </ul>
                        ) : (
                             <p className="text-center text-muted-foreground py-8">No documents shared with this team yet.</p>
                        )}
                    </CardContent>
                </Card>

                 {/* Team Chat */}
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Team Chat</CardTitle>
                        <CardDescription>Real-time messaging for members of {team.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground py-8">Team chat component coming soon.</p>
                    </CardContent>
                </Card>

                 {/* Admin Panel */}
                {currentUserRole === 'Admin' && (
                    <Card className="bg-card/60 backdrop-blur-sm border-primary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><Shield className="h-5 w-5"/> Admin Panel</CardTitle>
                            <CardDescription>Tools for managing this team.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button variant="outline"><Bell className="mr-2 h-4 w-4"/> Alert Team</Button>
                                <Button variant="outline"><Briefcase className="mr-2 h-4 w-4"/> Assign Project</Button>
                                <Button variant="destructive"><Users className="mr-2 h-4 w-4"/> Disband Team</Button>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Admin Action Log</h4>
                                {team.adminActions.length > 0 ? (
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {team.adminActions.map(log => (
                                            <li key={log.id} className="flex gap-2">
                                                <span className="font-mono text-xs">[{log.timestamp}]</span>
                                                <span>{log.action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No admin actions logged for this team yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}