

'use client';

import Link from "next/link";
import { ChevronLeft, PlusCircle, User, Users, MapPin, Search, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { mockClients } from "@/lib/data";
import { ClientForm } from "@/components/client-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

function NewInspectionDetailsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const selectedClient = mockClients.find(c => c.id === clientId);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto w-full">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href={{ pathname: "/inspections/new", query: { clientId: clientId ?? undefined }}}>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New Inspection: Details
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Client & Property Information</CardTitle>
                <CardDescription>
                  Select the client for this inspection and enter the property address.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">
                 <div className="grid gap-4">
                     <h3 className="font-semibold text-lg">Client Information</h3>
                     {selectedClient ? (
                       <div className="p-4 rounded-lg border bg-muted/50 flex items-center gap-4">
                           <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                               <User className="h-5 w-5 text-muted-foreground" />
                           </div>
                           <div>
                               <p className="font-semibold">{selectedClient.name}</p>
                               <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                           </div>
                           <Link href="/inspections/new/details" className="ml-auto text-sm underline">Change client</Link>
                       </div>
                     ) : (
                      <Tabs defaultValue="new-client">
                          <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="new-client"><PlusCircle className="mr-2 h-4 w-4"/>Add New Client</TabsTrigger>
                              <TabsTrigger value="existing-client"><Users className="mr-2 h-4 w-4" />Select Existing Client</TabsTrigger>
                          </TabsList>
                          <TabsContent value="new-client">
                              <ClientForm />
                          </TabsContent>
                          <TabsContent value="existing-client">
                              <div className="grid gap-4 pt-4">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search clients by name, email..."
                                    className="pl-9 pr-20 rounded-full"
                                  />
                                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                      <Camera className="h-4 w-4 text-muted-foreground" />
                                      <span className="sr-only">Use visual search</span>
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                      <Mic className="h-4 w-4 text-muted-foreground" />
                                      <span className="sr-only">Use voice command</span>
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  {mockClients.map(client => (
                                      <Link key={client.id} href={{pathname: "/inspections/new/details", query: {clientId: client.id}}} className="w-full text-left p-4 rounded-lg border flex items-center gap-4 hover:bg-muted/50 transition-colors">
                                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                              <User className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div>
                                              <p className="font-semibold">{client.name}</p>
                                              <p className="text-sm text-muted-foreground">{client.email}</p>
                                          </div>
                                      </Link>
                                  ))}
                                </div>
                              </div>
                          </TabsContent>
                      </Tabs>
                     )}
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                    <h3 className="font-semibold text-lg">Property Address</h3>
                    <div className="grid gap-3">
                        <Label htmlFor="street-address">Street Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="street-address" placeholder="Search for an address..." className="pl-9" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Anytown" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="state">State / Province</Label>
                            <Input id="state" placeholder="CA" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="zip">ZIP / Postal Code</Label>
                            <Input id="zip" placeholder="12345" />
                        </div>
                    </div>
                </div>

                <Separator />
                 <Button asChild className="w-full sm:w-auto">
                    <Link href={{pathname: "/inspections/new/review", query: {clientId: clientId ?? undefined}}}>Review & Confirm</Link>
                </Button>

              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


export default function NewInspectionDetailsPage() {
  return (
    <Suspense>
      <NewInspectionDetailsContent />
    </Suspense>
  )
}
