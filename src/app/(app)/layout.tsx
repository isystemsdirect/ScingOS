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
  ChevronDown
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
import { mockInspectors } from "@/lib/data";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = mockInspectors[0];
  const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar1');

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-sidebar-accent"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/inspections"
                className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <ClipboardList className="h-4 w-4" />
                Inspections
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </Badge>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-sidebar-accent"
              >
                <Store className="h-4 w-4" />
                Marketplace
              </Link>
              <Link
                href="/devices"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-sidebar-accent"
              >
                <Cpu className="h-4 w-4" />
                Devices
              </Link>
              <Link
                href="/billing"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-sidebar-accent"
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-sidebar-border">
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
                <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/">Logout</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
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
                <Logo />
                <Link
                  href="/dashboard"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/inspections"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-sidebar-accent px-3 py-2 text-primary"
                >
                  <ClipboardList className="h-5 w-5" />
                  Inspections
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </Badge>
                </Link>
                <Link
                  href="/marketplace"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-foreground"
                >
                  <Store className="h-5 w-5" />
                  Marketplace
                </Link>
                <Link
                  href="/devices"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-foreground"
                >
                  <Cpu className="h-5 w-5" />
                  Devices
                </Link>
                <Link
                  href="/billing"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-foreground"
                >
                  <CreditCard className="h-5 w-5" />
                  Billing
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inspections, codes, standards..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Mic className="h-5 w-5" />
            <span className="sr-only">Voice Commands</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
