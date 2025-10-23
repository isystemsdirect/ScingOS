
import {
  MoreHorizontal,
  PlusCircle,
  Users,
  UserPlus,
  Crown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamsPage() {
  const teamMembers = mockInspectors.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage your inspection team and collaborate on projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
          </Button>
          <Button variant="outline">Join a Team</Button>
        </div>
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roster">
            <Users className="mr-2 h-4 w-4" /> Team Roster
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Users className="mr-2 h-4 w-4" /> Team Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>
                Doe Inspections LLC - 4 of 5 seats used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Inspections
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((inspector, index) => {
                    const avatar = PlaceHolderImages.find(
                      (p) => p.id === inspector.imageHint
                    );
                    const role =
                      index === 0
                        ? 'Admin'
                        : index === 1
                        ? 'Lead Inspector'
                        : 'Inspector';
                    const status =
                      index % 2 === 0 ? 'Active' : 'Awaiting Response';

                    return (
                      <TableRow key={inspector.id} className="cursor-pointer">
                        <TableCell className="font-medium flex items-center gap-3">
                          {avatar && (
                            <Image
                              src={avatar.imageUrl}
                              alt={inspector.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                              data-ai-hint={avatar.imageHint}
                            />
                          )}
                          <div>
                            <div className="font-medium">{inspector.name}</div>
                            <div className="text-sm text-muted-foreground">
                              john.doe@scingular.com
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              role === 'Admin' ? 'default' : 'secondary'
                            }
                          >
                            {index === 0 && (
                              <Crown className="mr-1 h-3 w-3" />
                            )}
                            {role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {32 - index * 5}
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
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                               <DropdownMenuItem asChild>
                                <Link href={`/teams/${inspector.id}/availability`}>See Availability</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove from Team
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
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
                <CardDescription>
                  Manage your team's details and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      defaultValue="Doe Inspections LLC"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="team-logo">Team Logo</Label>
                    <Input id="team-logo" type="file" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invite New Members</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="new.inspector@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select defaultValue="inspector">
                    <SelectTrigger id="invite-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inspector">Inspector</SelectItem>
                      <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
