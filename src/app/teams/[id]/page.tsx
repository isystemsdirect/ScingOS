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
  Briefcase,
  PlusCircle,
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
import { mockInspectors, mockTeamsData } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";

// Assume the current user is an admin for demo purposes
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
          <Button variant="outline"><Bell className="mr-2 h-4 w-4"/> Send Announcement</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Action Sidebar */}
            <nav className="sticky top-20 flex flex-col gap-2 bg-card/40 p-2 rounded-lg border">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Team Hub</h3>
                <Button variant="ghost" className="justify-start gap-3"><Users className="h-4 w-4"/> Team Roster</Button>
                <Button variant="ghost" className="justify-start gap-3"><FileText className="h-4 w-4"/> Project Docs</Button>
                <Button variant="ghost" className="justify-start gap-3"><MessageSquare className="h-4 w-4"/> Team Chat</Button>
                {currentUserRole === 'Admin' && (
                    <>
                    <Separator className="my-2" />
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Admin</h3>
                    <Button variant="ghost" className="justify-start gap-3"><Shield className="h-4 w-4"/> Admin Panel</Button>
                    </>
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
                                    <Badge variant={role === 'Admin' ? 'pro' : 'secondary'} className="gap-1">
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
                                    <li key={doc.id} className="flex items-center justify-between p-3 rounded-md border bg-background/50 hover:bg-muted/50 transition-colors">
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
                        <div className="text-center text-muted-foreground py-8">
                            <p>Real-time messaging service is initializing...</p>
                            <p className="text-xs">(Chat component will appear here)</p>
                        </div>
                    </CardContent>
                </Card>

                 {/* Admin Panel */}
                {currentUserRole === 'Admin' && (
                    <Card className="bg-card/60 backdrop-blur-sm border-primary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><Shield className="h-5 w-5"/> Admin Panel</CardTitle>
                            <CardDescription>High-level tools for managing this team.</CardDescription>
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
                                    <ul className="space-y-2 text-sm text-muted-foreground max-h-40 overflow-y-auto">
                                        {team.adminActions.map(log => (
                                            <li key={log.id} className="flex gap-2">
                                                <span className="font-mono text-xs opacity-70">[{log.timestamp}]</span>
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
