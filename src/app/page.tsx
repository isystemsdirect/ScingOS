import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Cpu,
  FileText,
  Mic,
  ShieldCheck,
  Store,
} from "lucide-react";
import Logo from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI-Powered Reports",
    description:
      "Generate multi-page reports with AI-written executive summaries, stunning visuals, and audio presentations.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: "Device Integration",
    description:
      "Seamlessly connect drones, LiDAR, thermal cameras, and more with dedicated LARI sub-engines for each device.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Standards Cross-Check",
    description:
      "Automatically cross-reference findings against a vast library of codes and standards, complete with citations.",
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: "Voice Assistant",
    description:
      "Use 'Hey, Scing!' to control your inspections with voice commands for a hands-free, efficient workflow.",
  },
  {
    icon: <Store className="h-8 w-8 text-primary" />,
    title: "Inspector Marketplace",
    description:
      "Find and dispatch certified inspectors through a searchable directory with live availability and scheduling.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Dynamic Exports",
    description:
      "Export reports in multiple formats, including investor decks, client overviews, and detailed technical documents.",
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
            <Button asChild>
              <Link href="/login">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10"
          />}
          <div className="container mx-auto max-w-5xl text-center">
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              The Future of Inspection is Here
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              AI-Powered Inspections with{" "}
              <span className="text-primary">Scingular</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Unleash the power of AI to conduct faster, more accurate, and
              data-rich inspections. From drone telemetry to voice commands,
              Scingular is your all-in-one platform.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Your Free Trial
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Request a Demo
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-card/50 py-20 md:py-32">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold text-foreground sm:text-4xl">
                A Revolutionary Feature Set
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Scingular integrates cutting-edge technology into every step of
                the inspection process.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/70 shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Scingular, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
