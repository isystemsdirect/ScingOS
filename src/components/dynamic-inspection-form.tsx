
'use client';

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Users, PlusCircle, MapPin, Search, Camera, Mic, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockClients } from "@/lib/data";
import { ClientForm } from "@/components/client-form";
import { slugify } from "@/lib/utils";

type DynamicInspectionFormProps = {
    inspectionType: string;
}

function DynamicInspectionFormContent({ inspectionType }: DynamicInspectionFormProps) {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const selectedClient = mockClients.find(c => c.id === clientId);
  const inspectionSlug = slugify(inspectionType);

  // In a real app, you would generate form fields based on inspectionType
  // For this example, we'll use a standard set of fields.

  return (
    <div className="grid gap-8">
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
                <Link href={`/inspections/new/${inspectionSlug}`} className="ml-auto text-sm underline">Change client</Link>
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
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Use visual search</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                                <Mic className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Use voice command</span>
                            </Button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {mockClients.map(client => (
                                <Link key={client.id} href={{pathname: `/inspections/new/${inspectionSlug}`, query: {clientId: client.id}}} className="w-full text-left p-4 rounded-lg border flex items-center gap-4 hover:bg-muted/50 transition-colors">
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
                    <Input id="street-address" placeholder="Search for an address..." className="pl-9 rounded-full" />
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

        <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Inspection-Specific Details</h3>
            
            {inspectionType === "Multi-family due-diligence unit walks (sampled or 100%)" && (
                <div className="grid gap-3">
                    <Label htmlFor="number-of-units">Number of Units</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="number-of-units" type="number" placeholder="e.g., 50" className="pl-9" />
                    </div>
                </div>
            )}
            
            <p className="text-sm text-muted-foreground">
                More inspection-specific fields will appear here based on the selected template.
            </p>
        </div>


        <Separator />
        <div className="flex justify-end">
            <Button asChild disabled={!clientId}>
                <Link href={`/inspections/new/review?clientId=${clientId}&inspectionType=${inspectionSlug}`}>Review & Confirm</Link>
            </Button>
        </div>
    </div>
  );
}

export function DynamicInspectionForm(props: DynamicInspectionFormProps) {
    return (
        <Suspense>
            <DynamicInspectionFormContent {...props} />
        </Suspense>
    )
}
