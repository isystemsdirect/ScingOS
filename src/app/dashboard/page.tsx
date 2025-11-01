
'use client'

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  DollarSign,
  Users,
  PlusCircle,
  Cpu,
  Map,
  FileText,
  UserCheck,
  ShieldAlert,
  Bell,
  CalendarClock
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { mockInspections, mockInspectors, mockClients } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MarketplaceMap } from "@/components/marketplace-map";
import { Separator } from "@/components/ui/separator";

const mockAgenda = [
    { time: "09:00 AM", title: "Pre-Purchase Inspection", address: "456 Oak Ave", id: "INS-002" },
    { time: "11:30 AM", title: "Client Follow-up: Stark Industries", address: "10880 Malibu Point", id: "CLI-001"},
    { time: "02:00 PM", title: "Annual Checkup", address: "789 Pine Ln", id: "INS-003"},
];

const mockActivityFeed = [
    { id: 1, type: "inspection", content: "Jane Smith started inspection INS-002.", time: "5m ago" },
    { id: 2, type: "client", content: "New client 'Cyberdyne Systems' was added.", time: "25m ago" },
    { id: 3, type: "report", content: "Report for INS-001 was finalized and sent.", time: "1h ago" },
    { id: 4, type: "system", content: "Device 'Skydio X2' firmware updated to v2.1.4.", time: "2h ago" },
];


export default function Dashboard() {
  const user = mockInspectors[0];
  const team = mockInspectors.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex items-center">
          <div>
              <h1 className="text-lg font-semibold md:text-2xl">Welcome, {user.name.split(' ')[0]}!</h1>
              <p className="text-sm text-muted-foreground">This is your command center. Here's what's happening across the ecosystem.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
              <Button asChild>
                <Link href="/inspections/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start New Inspection
                </Link>
              </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inspections This Month
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+265</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members Online</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 / 4</div>
              <p className="text-xs text-muted-foreground">1 member offline</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marketplace Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+18</div>
              <p className="text-xs text-muted-foreground">
                new jobs available in your area
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 grid gap-8">
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5" /> Live Operations Map</CardTitle>
                    <CardDescription>Real-time view of team members and active client needs.</CardDescription>
                </CardHeader>
                <CardContent className="h-[450px] p-0">
                    <MarketplaceMap 
                        inspectors={mockInspectors.filter(i => i.onCall)}
                        clients={mockClients}
                    />
                </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Team Status</CardTitle>
                        <CardDescription>
                        Overview of your team's current assignments and availability.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/teams">
                        Manage Team
                        <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Inspector</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Current Task</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {team.map((inspector, index) => {
                            const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                            const status = index === 1 ? "In Inspection" : inspector.onCall ? "On-Call" : "Offline";
                            return (
                                <TableRow key={inspector.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    {avatar && <Image src={avatar.imageUrl} alt={inspector.name} width={32} height={32} className="rounded-full" />}
                                    {inspector.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={status === "In Inspection" ? "destructive" : status === "On-Call" ? "default" : "secondary"}>
                                        {status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {status === "In Inspection" ? "INS-002: 456 Oak Ave" : "Idle"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        Guardian Angel AI
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                        <UserCheck className="h-6 w-6 text-green-400" />
                        <div>
                            <p className="font-semibold text-green-300">All Systems Nominal</p>
                            <p className="text-xs text-green-400/80">User biometrics and environmental data are within safe limits.</p>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground">LARI-GUAngel_AI is monitoring your safety in the field. All readings are currently normal.</p>
                </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5"/> Today's Agenda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {mockAgenda.map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className="text-sm font-semibold text-muted-foreground w-20 pt-0.5">{item.time}</div>
                            <div className="flex-1 border-l-2 border-primary pl-3">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.address}</p>
                            </div>
                        </div>
                     ))}
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="secondary">
                        <Link href="/calendar">View Full Calendar</Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockActivityFeed.map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className="text-xs text-muted-foreground w-16 pt-0.5">{item.time}</div>
                            <div className="flex-1">
                                <p className="text-sm">{item.content}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
