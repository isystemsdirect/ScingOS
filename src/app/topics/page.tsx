
'use client';

import {
  Hash,
  ListFilter,
  PlusCircle,
  Rss,
  Search,
  Star,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const mockTopics = [
  { id: 1, name: 'Drone Inspections', tag: 'drone-inspections', posts: 42, followers: 120, isFollowing: true, description: "Best practices, regulations, and new tech for aerial inspections." },
  { id: 2, name: 'Thermal Imaging', tag: 'thermal-imaging', posts: 78, followers: 250, isFollowing: true, description: "Interpreting thermal data for moisture, insulation, and electrical issues." },
  { id: 3, name: 'Foundation Cracks', tag: 'foundation-cracks', posts: 112, followers: 450, isFollowing: false, description: "Structural vs. non-structural cracks, assessment techniques, and reporting." },
  { id: 4, name: 'GFCI Best Practices', tag: 'gfci-tests', posts: 23, followers: 88, isFollowing: false, description: "Code requirements and best practices for testing and documenting GFCI outlets." },
  { id: 5, name: 'Commercial Roofing', tag: 'commercial-roofing', posts: 55, followers: 180, isFollowing: true, description: "Covering TPO, EPDM, and modified bitumen roof systems." },
  { id: 6, name: 'AI in Reporting', tag: 'ai-reporting', posts: 91, followers: 310, isFollowing: true, description: "Leveraging AI for faster, more accurate report generation." },
]

export default function TopicsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold">Explore Topics</h1>
            <p className="text-muted-foreground">
              Browse, follow, and create topics to drive focused discussions.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                <Link href="/social">
                    <Rss className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        View Timeline
                    </span>
                </Link>
            </Button>
             <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Topic
              </span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for topics..."
                    className="w-full rounded-full bg-card/60 backdrop-blur-sm pl-9"
                />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Trending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Popular</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>New</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTopics.map(topic => (
            <Card key={topic.id} className="flex flex-col bg-card/60 backdrop-blur-sm">
              <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Hash className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg hover:underline">
                        <Link href={`/topics/${topic.tag}`}>{topic.name}</Link>
                    </CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{topic.posts}</span> posts | <span className="font-bold text-foreground">{topic.followers}</span> followers
                </div>
                <Button variant={topic.isFollowing ? "secondary" : "outline"} size="sm">
                  <Star className="mr-2 h-4 w-4" />
                  {topic.isFollowing ? "Following" : "Follow"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
