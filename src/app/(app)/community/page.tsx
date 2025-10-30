
'use client';

import {
  MoreVertical,
  PlusCircle,
  File,
  Search,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ListFilter,
  User,
  Bot,
  ExternalLink
} from 'lucide-react';

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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { mockInspectors } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mockPosts = [
  {
    id: 1,
    authorId: 'USR-002',
    type: 'question',
    title: 'Unusual Efflorescence Pattern on a Poured Concrete Wall?',
    content: 'Came across a strange, almost crystalline efflorescence pattern on a 1980s foundation wall. It doesn\'t look like typical powdery deposits. Has anyone seen this before? Attached a photo. Wondering if it could be related to a specific additive in the concrete mix from that era.',
    tags: ['concrete', 'foundation', 'efflorescence'],
    likes: 12,
    comments: 4,
    bookmarked: false,
    isAiResponse: false,
  },
  {
    id: 2,
    authorId: 'AI',
    type: 'ai-response',
    title: 'Re: Unusual Efflorescence Pattern',
    content: 'Based on the visual data, the crystalline structure may indicate the presence of sulfates in the groundwater reacting with the portland cement. This is sometimes referred to as "sulfate attack," which can be more aggressive than typical efflorescence. Recommend testing the soil and water PH levels. Cross-referencing with ACI 201.2R-08 (Guide to Durable Concrete) suggests this pattern aligns with external sulfate attack.',
    tags: [],
    likes: 8,
    comments: 0,
    bookmarked: true,
    isAiResponse: true,
  },
  {
    id: 3,
    authorId: 'USR-003',
    type: 'knowledge',
    title: 'Pro-Tip: Documenting GFCI Test with Video',
    content: 'A quick tip for new inspectors: when you test GFCI outlets, take a short video showing the test button tripping the receptacle and then the reset button working correctly. It provides undeniable proof of the test and can be a great addition to your report, especially for flips or new constructions.',
    tags: ['electrical', 'best-practices', 'reporting'],
    likes: 45,
    comments: 12,
    bookmarked: true,
    isAiResponse: false,
  },
];

const mockNews = [
    {
        id: 1,
        title: "T2D2, an AI-powered building inspection platform, launches enhanced version",
        source: "BuiltWorlds",
        time: "2h ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news1/150/150",
        imageHint: "technology abstract"
    },
    {
        id: 2,
        title: "New Drone Regulations Impacting Roof Inspections in 2024",
        source: "The Inspector",
        time: "8h ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news2/150/150",
        imageHint: "drone sky"
    },
    {
        id: 3,
        title: "AI in Construction: Thornton Tomasetti’s T2D2 gets an upgrade",
        source: "AEC Magazine",
        time: "1d ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news3/150/150",
        imageHint: "construction site"
    },
     {
        id: 4,
        title: "The Best Home Inspection Software of 2024",
        source: "The Close",
        time: "2d ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news4/150/150",
        imageHint: "software code"
    }
]

export default function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold">SAI Community</h1>
            <p className="text-muted-foreground">
              Share knowledge, ask questions, and learn from fellow inspectors and the Scingular AI.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="lg">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-start">
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search community posts..." className="pl-9 rounded-md" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sm:whitespace-nowrap">
                            Filter
                            </span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>All Posts</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Questions</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Knowledge Sharing</DropdownMenuCheckboxItem>
                         <DropdownMenuCheckboxItem>AI Responses</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {mockPosts.map((post) => {
                    const author = post.isAiResponse ? { name: 'Scingular AI', avatarUrl: '/logo.png', imageHint: '' } : mockInspectors.find(i => i.id === post.authorId);
                    const avatar = post.isAiResponse ? { imageUrl: '/logo.png' } : PlaceHolderImages.find(p => p.id === author?.imageHint);
                    
                    return (
                    <Card key={post.id} className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                {avatar && (
                                    <Image src={avatar.imageUrl} alt={author?.name || 'AI'} width={40} height={40} className="rounded-full" data-ai-hint={author?.imageHint} />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {post.isAiResponse ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-muted-foreground" />}
                                        <CardTitle className="text-lg">{post.title}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Posted by {author?.name || 'Scingular AI'}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="ml-auto">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Report Post</DropdownMenuItem>
                                        <DropdownMenuItem>Mute User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {post.content}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {post.tags.map(tag => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-muted-foreground border-t pt-2 pb-2">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm hover:text-primary">
                                <ThumbsUp className="h-4 w-4" /> {post.likes} Likes
                            </Button>
                            <Separator orientation="vertical" className="h-4"/>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm hover:text-primary">
                                <MessageCircle className="h-4 w-4" /> {post.comments} Comments
                            </Button>
                             <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm ml-auto hover:text-primary">
                                <Bookmark className="h-4 w-4" /> Bookmark
                            </Button>
                        </CardFooter>
                    </Card>
                    )
                })}
            </div>

             <div className="sticky top-20 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Industry News</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {mockNews.map(item => (
                                <li key={item.id}>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4">
                                        <Image src={item.imageUrl} alt={item.title} width={60} height={60} className="rounded-md object-cover" data-ai-hint={item.imageHint} />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{item.title}</p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                                <span>{item.source}</span>
                                                <span>{item.time}</span>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Top Contributors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockInspectors.slice(0,3).map(inspector => {
                            const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                            return (
                                <div key={inspector.id} className="flex items-center gap-3">
                                    {avatar && <Image src={avatar.imageUrl} alt={inspector.name} width={32} height={32} className="rounded-full" />}
                                    <div>
                                        <p className="font-semibold text-sm">{inspector.name}</p>
                                        <p className="text-xs text-muted-foreground">{inspector.certifications[0].name.substring(0, 25)}...</p>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
