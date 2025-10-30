
'use client';

import {
  PlusCircle,
  Rss,
  Hash,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CommunityPage() {

  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold">Community Hub</h1>
            <p className="text-muted-foreground">
              Explore topics, join discussions, and view the live social timeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Social Timeline</CardTitle>
                    <CardDescription>View the real-time feed of posts from the Scingular community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/social"><Rss className="mr-2 h-4 w-4" /> View Social Timeline</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Explore Topics</CardTitle>
                    <CardDescription>Browse and follow topics to discover focused discussions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/topics"><Hash className="mr-2 h-4 w-4" /> Browse Topics</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
