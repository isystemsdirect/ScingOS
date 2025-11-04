
'use client';

import { Building, Users, ArrowRight, PlusCircle, UserPlus, Search, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockTeamsData } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';


export default function TeamSelectionPage() {
  const mockTeams = Object.values(mockTeamsData);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams & Dispatch</h1>
            <p className="text-muted-foreground">
              Create, join, or manage your project teams.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Join a Team
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for public teams or members with Scing AI..."
            className="w-full rounded-full bg-card/60 backdrop-blur-sm pl-12 h-12 text-base"
          />
        </div>
        
        <div className="grid gap-6">
            {mockTeams.map((team) => (
                <Link href={`/teams/${team.id}`} key={team.id}>
                    <Card className="bg-card/60 backdrop-blur-sm hover:border-primary/80 hover:shadow-lg transition-all">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                        <Building className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                          {team.name}
                                          <Badge variant={team.privacy === 'public' ? 'secondary' : 'outline'} className="gap-1.5">
                                            {team.privacy === 'public' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3" />}
                                            <span className="capitalize">{team.privacy}</span>
                                          </Badge>
                                        </CardTitle>
                                        <CardDescription>{team.description}</CardDescription>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {team.members.map(member => {
                                        const avatar = PlaceHolderImages.find(p => p.id === member.imageHint);
                                        return avatar ? <Image key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src={avatar.imageUrl} alt={member.name} width={32} height={32} /> : null
                                    })}
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">{team.memberCount} Members</span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}
