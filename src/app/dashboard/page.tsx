
'use client'

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Users,
  PlusCircle,
  Cpu,
  Map,
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

export default function Dashboard() {
  const user = mockInspectors[0];
  const recentInspections = mockInspections.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center">
          <div>
              <h1 className="text-lg font-semibold md:text-2xl">Welcome, {user.name.split(' ')[0]}!</h1>
              <p className="text-sm text-muted-foreground">Here's a summary of your activity.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
              <Button asChild>
                <Link href="/inspections/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start New Inspection
                </Link>
              </Button>
              <Button variant="outline">
                  <Cpu className="h-4 w-4 mr-2" />
                  Register Device
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
              <div className="text-xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Inspections
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">in the next 7 days</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                inspectors online
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Inspections</CardTitle>
                <CardDescription>
                  You have completed 265 inspections this month.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/inspections">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Findings</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        <div className="font-medium">{inspection.title}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {inspection.propertyAddress.street}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-column">
                        <Badge className="text-xs" variant={inspection.status === 'Final' ? 'default' : 'secondary'}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                        {inspection.date}
                      </TableCell>
                      <TableCell className="text-right">
                        {inspection.findingsCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/inspections/${inspection.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5" /> Live Operations Map</CardTitle>
              <CardDescription>
                Real-time view of inspectors and client needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] p-0">
               <MarketplaceMap 
                inspectors={mockInspectors.filter(i => i.onCall)}
                clients={mockClients}
               />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
