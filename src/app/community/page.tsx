
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
  ExternalLink,
  Image as ImageIcon,
  Video,
  Paperclip,
  Rss,
  Hash,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
import { mockInspectors, mockSubscriptionPlans } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScingularLogoText } from '@/components/ui/logo-text';
import { AnnouncementsWidget } from '@/components/announcements-widget';

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
]

export default function CommunityPage() {
  const user = mockInspectors[0];
  const avatar = PlaceHolderImages.find(p => p.id === user.imageHint);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold">Community Hub</h1>
            <p className="text-muted-foreground">
              A real-time feed of posts, questions, and knowledge from the Scingular community.
            </p>
          </div>
           <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/social"><Rss className="mr-2 h-4 w-4" /> Social Timeline</Link>
            </Button>
            <Button asChild>
              <Link href="/topics"><Hash className="mr-2 h-4 w-4" /> Browse Topics</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-6">
                 <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader className="flex-row items-center gap-4">
                        {avatar && <Image src={avatar.imageUrl} alt={user.name} width={40} height={40} className="rounded-full" data-ai-hint={user.imageHint} />}
                        <div className="flex-1">
                            <Input placeholder="Share your thoughts or ask a question..." className="bg-muted border-none" />
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center pb-4 px-4">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm"><ImageIcon className="h-4 w-4 mr-2" /> Image</Button>
                            <Button variant="ghost" size="sm"><Video className="h-4 w-4 mr-2" /> Video</Button>
                            <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4 mr-2" /> Attachment</Button>
                        </div>
                        <Button>Post</Button>
                    </CardFooter>
                </Card>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search community posts..." className="pl-9 rounded-full" />
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
                    const postAvatar = post.isAiResponse ? { imageUrl: '/logo.png' } : PlaceHolderImages.find(p => p.id === author?.imageHint);
                    
                    return (
                    <Card key={post.id} className="transition-shadow hover:shadow-lg bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                {postAvatar && (
                                    <Image src={postAvatar.imageUrl} alt={author?.name || 'AI'} width={40} height={40} className="rounded-full" data-ai-hint={author?.imageHint} />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {post.isAiResponse ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-muted-foreground" />}
                                        <CardTitle className="text-lg">{post.title}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Posted by {post.isAiResponse ? <ScingularLogoText className="text-sm" /> : author?.name}
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
                <AnnouncementsWidget />
                 <Card className="bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        {avatar && <Image src={avatar.imageUrl} alt={user.name} width={56} height={56} className="rounded-full border-2 border-primary" data-ai-hint={user.imageHint} />}
                        <div>
                            <p className="font-semibold text-lg">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.certifications[0].name.substring(0, 25)}...</p>
                            <Link href="/profile" className="text-xs text-primary hover:underline">View Profile</Link>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-sm">
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
                 <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Top Contributors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockInspectors.slice(1,4).map(inspector => {
                            const contributorAvatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                            return (
                                <div key={inspector.id} className="flex items-center gap-3">
                                    {contributorAvatar && <Image src={contributorAvatar.imageUrl} alt={inspector.name} width={32} height={32} className="rounded-full" />}
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
