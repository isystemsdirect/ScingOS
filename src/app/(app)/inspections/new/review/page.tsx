
'use client';

import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, notFound } from "next/navigation";
import { mockClients } from "@/lib/data";
import inspectionData from '@/lib/inspection-types.json';
import { Suspense } from "react";
import { slugify } from "@/lib/utils";


function NewInspectionReviewContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  // For the wizard, we'll assume the type is passed as a query param from step 1
  const inspectionTypeParam = "General property condition assessment (PCA)";

  const inspectionType = inspectionData.inspectionTypeCategories
    .flatMap(category => category.types)
    .find(type => type === inspectionTypeParam);


  // Find the selected client from mock data, or use the first one as a fallback for the demo
  const selectedClient = mockClients.find(c => c.id === clientId) || mockClients[0];


  // This data would be passed from previous steps in a real app
  const inspectionDetails = {
    primaryType: inspectionType,
    property: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    },
    client: selectedClient
  };

  if(!inspectionType) {
      notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href={{pathname: `/inspections/new/details`, query: { clientId: clientId ?? undefined }}}>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New Inspection: Step 3 of 3
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>
                  Please review the details below before starting the inspection.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">

                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Inspection Scope</h3>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={{pathname: "/inspections/new", query: {clientId: clientId ?? undefined}}}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        <p className="font-medium">Inspection Type</p>
                        <p className="text-muted-foreground">{inspectionDetails.primaryType}</p>
                    </div>
                </div>

                <Separator />
                
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Property & Client</h3>
                         <Button variant="ghost" size="sm" asChild>
                            <Link href={{pathname: `/inspections/new/details`, query: {clientId: clientId ?? undefined}}}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <p className="font-medium">Property Address</p>
                             <address className="grid gap-0.5 not-italic text-muted-foreground">
                                <span>{inspectionDetails.property.street}</span>
                                <span>{inspectionDetails.property.city}, {inspectionDetails.property.state} {inspectionDetails.property.zip}</span>
                             </address>
                        </div>
                        <div className="grid gap-2">
                            <p className="font-medium">Client</p>
                             <div className="text-muted-foreground">
                                <p>{inspectionDetails.client.name}</p>
                                <p>{inspectionDetails.client.email}</p>
                                <p>{inspectionDetails.client.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
              </CardContent>
              <CardFooter className="border-t p-6">
                 <Button size="lg" className="w-full sm:w-auto ml-auto" asChild>
                    <Link href={`/clients/${inspectionDetails.client.id}`}>Confirm & Start Inspection</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
    </div>
  );
}

export default function NewInspectionReviewPage() {
  return (
    <Suspense>
      <NewInspectionReviewContent />
    </Suspense>
  )
}
