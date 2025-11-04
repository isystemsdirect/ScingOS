
'use client';

import { Building, Users, ArrowRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockInspectors } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

// Mock teams data based on your architecture
const mockTeams = [
    {
        id: 'team-doe-inspections',
        name: 'Doe Inspections LLC',
        description: 'Primary residential and commercial inspection team.',
        memberCount: 4,
        members: mockInspectors.slice(0, 4)
    },
    {
        id: 'team-special-projects',
        name: 'Special Projects Unit',
        description: 'Focused on large-scale industrial and infrastructure projects.',
        memberCount: 2,
        members: [mockInspectors[2], mockInspectors[3]]
    },
];


export default function TeamSelectionPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams & Dispatch</h1>
            <p className="text-muted-foreground">
              Choose a team to view its central hub or create a new one.
            </p>
          </div>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
          </Button>
        </div>
        
        <div className="grid gap-6">
            {mockTeams.map((team) => (
                <Link href={`/teams/${team.id}`} key={team.id}>
                    <Card className="bg-card/60 backdrop-blur-sm hover:border-primary/80 hover:shadow-lg transition-all">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                        <Building className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{team.name}</CardTitle>
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
