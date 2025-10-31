
'use client';

import Image from "next/image"
import { ListFilter, MapPin, Search, Star, ShieldCheck, Briefcase, KeyRound, Construction, Users, Building } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { mockInspectors, mockMarketplaceServices, mockMarketplaceIntegrations, mockClients } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketplaceMap } from "@/components/marketplace-map";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function MarketplacePage() {
  const [showInspectors, setShowInspectors] = useState(true);
  const [showClients, setShowClients] = useState(true);
  const [showMap, setShowMap] = useState(true);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover inspectors, services, and integrations to expand your capabilities.
            </p>
          </div>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Marketplace Map</CardTitle>
                    <CardDescription>Live map of available inspectors and active client needs.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="show-map" checked={showMap} onCheckedChange={setShowMap} />
                    <Label htmlFor="show-map">Show Map</Label>
                </div>
              </div>
            </CardHeader>
          {showMap && (
            <CardContent>
              <div className="h-[60vh] w-full rounded-lg overflow-hidden border">
                  <MarketplaceMap
                    inspectors={showInspectors ? mockInspectors : []}
                    clients={showClients ? mockClients : []}
                  />
              </div>
            </CardContent>
          )}
        </Card>


        <Tabs defaultValue="inspectors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inspectors"><Briefcase className="mr-2 h-4 w-4" /> Find an Inspector</TabsTrigger>
                <TabsTrigger value="services"><Construction className="mr-2 h-4 w-4" /> Browse Services</TabsTrigger>
                <TabsTrigger value="integrations"><KeyRound className="mr-2 h-4 w-4" /> Integrations & Keys</TabsTrigger>
            </TabsList>
            <TabsContent value="inspectors" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Inspector Marketplace</CardTitle>
                                <CardDescription>Find and dispatch certified inspectors in your area.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked>Available Now</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>Top Rated</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>InterNACHI Certified</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name, location, or certification..."
                                className="w-full rounded-full bg-background pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mockInspectors.map((inspector) => {
                            const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
                            return (
                            <Card key={inspector.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card/60 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-start gap-4 p-4 bg-muted/20">
                                {avatar && (
                                    <Image
                                    src={avatar.imageUrl}
                                    alt={inspector.name}
                                    width={80}
                                    height={80}
                                    className="rounded-full border-4 border-background"
                                    data-ai-hint={avatar.imageHint}
                                    />
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{inspector.name}</CardTitle>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4 fill-primary text-primary" />
                                    <span>{inspector.rating}</span>
                                    <span>({inspector.reviews} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{inspector.location.name}</span>
                                    </div>
                                </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                <p className="font-semibold text-sm mb-2">Certifications</p>
                                <div className="flex flex-wrap gap-2">
                                    {inspector.certifications.map((cert) => (
                                    <Badge key={cert.id} variant="secondary" className="gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        {cert.name}
                                    </Badge>
                                    ))}
                                </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                <Button className="w-full">
                                    {inspector.onCall ? "Dispatch Now" : "Request Booking"}
                                </Button>
                                </CardFooter>
                            </Card>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="services" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Professional Services</CardTitle>
                        <CardDescription>Purchase specialized reports, consultations, and analytical services from certified providers.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mockMarketplaceServices.map((service) => (
                            <Card key={service.id} className="flex flex-col bg-card/60 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                            <Construction className="w-6 h-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between">
                                    <div className="text-lg font-bold">{service.price}</div>
                                    <Button>Learn More</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="integrations" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Partner Integrations & Keys</CardTitle>
                        <CardDescription>Expand your capabilities by purchasing new Keys from our technology partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mockMarketplaceIntegrations.map((item) => (
                             <Card key={item.id} className="flex flex-col bg-card/60 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                            <KeyRound className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">Provided by {item.vendor}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between">
                                     <div className="text-lg font-bold">{item.price}</div>
                                     <Button>Purchase Key</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
