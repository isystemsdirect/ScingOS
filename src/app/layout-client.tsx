
'use client';

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Building,
  ClipboardList,
  CreditCard,
  Cpu,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  Mic,
  Package2,
  Search,
  Settings,
  Store,
  Users,
  Wrench,
  ChevronDown,
  User,
  Library,
  DollarSign,
  Expand,
  Shrink,
  Hash,
  Rss,
  RefreshCw,
  Calendar,
  Map
} from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { mockInspectors, mockSubscriptionPlans } from "@/lib/data";
import { NavLink } from "@/components/nav-link";
import { AiSearchDialog } from "@/components/ai-search-dialog";
import { Separator } from "@/components/ui/separator";
import { FlashNotificationBar } from "@/components/flash-notification-bar";
import { WeatherWidget } from "@/components/weather-widget";
import { NewsWidget } from "@/components/news-widget";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = mockInspectors[0];
  const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar1');
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');
  const router = useRouter();
  const pathname = usePathname();

  const handleRefresh = () => {
    router.refresh();
  };

  const authRoutes = ['/login', '/signup', '/forgot-password'];
  if (authRoutes.includes(pathname) || pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block group" data-collapsed="false">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
            {isProOrEnterprise && <Badge variant="pro" className="ml-2 text-[0.6rem] px-1.5 py-0.5 h-auto group-data-[collapsed=true]:hidden">Pro</Badge>}
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink href="/inspections">
                <ClipboardList className="h-4 w-4" />
                Inspections
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </Badge>
              </NavLink>
               <NavLink href="/calendar">
                <Calendar className="h-4 w-4" />
                Calendar & Scheduling
              </NavLink>
              <NavLink href="/clients">
                <Users className="h-4 w-4" />
                Clients & Contacts
              </NavLink>
               <NavLink href="/teams">
                <Users className="h-4 w-4" />
                Teams & Dispatch
              </NavLink>
              
              <Separator className="my-2 bg-sidebar-border" />

              <NavLink href="/library">
                <Library className="h-4 w-4" />
                Standards Library
              </NavLink>
              <NavLink href="/marketplace">
                <Store className="h-4 w-4" />
                Marketplace
              </NavLink>
              <NavLink href="/community">
                <MessageSquare className="h-4 w-4" />
                Community Hub
              </NavLink>
              <NavLink href="/social">
                <Rss className="h-4 w-4" />
                Social Timeline
              </NavLink>
              <NavLink href="/topics">
                <Hash className="h-4 w-4" />
                Topics
              </NavLink>

              <Separator className="my-2 bg-sidebar-border" />

              <NavLink href="/workstation">
                <Cpu className="h-4 w-4" />
                Workstation
              </NavLink>
              <NavLink href="/finances">
                <DollarSign className="h-4 w-4" />
                Finances
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-sidebar-border space-y-4">
            <NewsWidget />
            <WeatherWidget />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-start gap-2 w-full px-2">
                  {avatarImage && (
                    <Image
                      src={avatarImage.imageUrl}
                      width={32}
                      height={32}
                      alt={user.name}
                      data-ai-hint={avatarImage.imageHint}
                      className="rounded-full"
                    />
                  )}
                  <div className="text-left group-data-[collapsed=true]:hidden">
                    <div className="font-medium text-sidebar-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">Inspector</div>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsed=true]:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/workstation"><Settings className="mr-2 h-4 w-4" />Workstation</Link></DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-col relative h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Package2 className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground">
              <nav className="grid gap-2 text-lg font-medium">
                <div className="flex items-center">
                  <Logo />
                  {isProOrEnterprise && <Badge variant="pro" className="ml-2 text-[0.6rem] px-1.5 py-0.5 h-auto">Pro</Badge>}
                </div>
                 <NavLink href="/dashboard" isMobile>
                  <Home className="h-5 w-5" />
                  Dashboard
                </NavLink>
                <NavLink href="/inspections" isMobile>
                  <ClipboardList className="h-5 w-5" />
                  Inspections
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </Badge>
                </NavLink>
                 <NavLink href="/calendar" isMobile>
                  <Calendar className="h-5 w-5" />
                  Calendar & Scheduling
                </NavLink>
                <NavLink href="/clients" isMobile>
                  <Users className="h-5 w-5" />
                  Clients & Contacts
                </NavLink>
                 <NavLink href="/teams" isMobile>
                  <Users className="h-5 w-5" />
                  Teams & Dispatch
                </NavLink>
                 <Separator className="my-2 bg-sidebar-border" />
                <NavLink href="/library" isMobile>
                  <Library className="h-5 w-5" />
                  Standards Library
                </NavLink>
                <NavLink href="/marketplace" isMobile>
                  <Store className="h-5 w-5" />
                  Marketplace
                </NavLink>
                <NavLink href="/community" isMobile>
                    <MessageSquare className="h-5 w-5" />
                    Community Hub
                </NavLink>
                <NavLink href="/social" isMobile>
                    <Rss className="h-5 w-5" />
                    Social Timeline
                </NavLink>
                 <NavLink href="/topics" isMobile>
                    <Hash className="h-5 w-5" />
                    Topics
                </NavLink>
                 <Separator className="my-2 bg-sidebar-border" />
                <NavLink href="/workstation" isMobile>
                  <Cpu className="h-5 w-5" />
                  Workstation
                </NavLink>
                <NavLink href="/finances" isMobile>
                  <DollarSign className="h-5 w-5" />
                  Finances
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <AiSearchDialog />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleRefresh}>
                <RefreshCw className="h-5 w-5" />
                <span className="sr-only">Refresh Page</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
          </div>
        </header>
        <FlashNotificationBar />
        <main className={cn("flex-1 overflow-y-auto p-4 sm:px-6 sm:py-6 bg-black/20 backdrop-blur-sm bg-[radial-gradient(ellipse_at_center,hsl(var(--card)/0.1)_0%,transparent_70%)]", "rounded-xl")}>
          {children}
        </main>
      </div>
    </div>
  );
}
