
'use client';

import {
  MoreHorizontal,
  PlusCircle,
  Shield,
  UserPlus,
  Users,
  FileText,
  Activity,
  BarChart,
} from 'lucide-react';
import Image from 'next/image';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockInspectors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  const users = mockInspectors; 

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Control Center
            </h1>
            <p className="text-muted-foreground">
              Manage users, system settings, and view audit logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Invite Admin
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" /> User Management
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="mr-2 h-4 w-4" /> Audit Logs
            </TabsTrigger>
             <TabsTrigger value="system">
              <Activity className="mr-2 h-4 w-4" /> System Health
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-4">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>
                  View, manage, and monitor all users in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Fields of Service
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => {
                      const avatar = PlaceHolderImages.find(
                        (p) => p.id === user.imageHint
                      );
                      const status = index % 2 === 0 ? 'Active' : 'Suspended';

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium flex items-center gap-3">
                            {avatar && (
                              <Image
                                src={avatar.imageUrl}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                                data-ai-hint={avatar.imageHint}
                              />
                            )}
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {`user${index + 1}@scingular.com`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === 'Admin' ? 'default' : 'secondary'
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={status === 'Active' ? 'secondary' : 'destructive'}>{status}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                             <div className="flex flex-wrap gap-1 max-w-xs">
                                {user.offeredServices.slice(0, 2).map(service => (
                                    <Badge key={service} variant="outline">{service.split('(')[0].trim()}</Badge>
                                ))}
                                {user.offeredServices.length > 2 && <Badge variant="outline">+{user.offeredServices.length - 2} more</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuItem>Force Logout</DropdownMenuItem>
                                {status !== 'Suspended' && <DropdownMenuItem>Suspend User</DropdownMenuItem>}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete User
                                </DropdownMenuItem>
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
          </TabsContent>
          <TabsContent value="logs" className="mt-4">
             <Card className="bg-card/60 backdrop-blur-sm">
                 <CardHeader>
                    <CardTitle>Admin Action Logs</CardTitle>
                    <CardDescription>A secure, immutable log of all administrative actions taken.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-12">Audit log coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="system" className="mt-4">
             <Card className="bg-card/60 backdrop-blur-sm">
                 <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Real-time metrics for API performance and server status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-12">System health monitoring coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
