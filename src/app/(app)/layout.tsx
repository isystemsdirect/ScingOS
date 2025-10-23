
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
  Shrink
} from "lucide-react";

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
import { useState, useEffect } from "react";
import { BackgroundSlideshow } from "@/components/background/background-slideshow";


function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFullscreenToggle}>
      {isFullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
      <span className="sr-only">{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</span>
    </Button>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = mockInspectors[0];
  const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar1');
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative">
      <BackgroundSlideshow />
      <div className="hidden border-r bg-sidebar md:block z-10">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
            {isProOrEnterprise && <Badge variant="pro" className="ml-2">Pro</Badge>}
          </div>
          <div className="flex-1">
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
              <NavLink href="/clients">
                <Users className="h-4 w-4" />
                Clients
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
          <div className="mt-auto px-4 pt-4 pb-24 border-t border-sidebar-border bg-[rgba(0,0,0,0.8)]">
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
                  <div className="text-left">
                    <div className="font-medium text-sidebar-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">Inspector</div>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" />Account</Link></DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-col z-10">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
                  {isProOrEnterprise && <Badge variant="pro" className="ml-2">Pro</Badge>}
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
                <NavLink href="/clients" isMobile>
                  <Users className="h-5 w-5" />
                  Clients
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
          
          <div className="flex items-center gap-4 ml-auto">
              {user.onCall && (
                <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-status-active animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-status-active" />
                  Marketplace Status: Active
                </div>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <FullscreenToggle />
          </div>
        </header>
        <div className="flex-1 overflow-auto">
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent">
              {children}
            </main>
        </div>
      </div>
    </div>
  );
}
