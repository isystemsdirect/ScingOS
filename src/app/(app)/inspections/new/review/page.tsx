
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

export default function NewInspectionReviewPage() {

  // This data would be passed from previous steps in a real app
  const inspectionDetails = {
    primaryType: "General property condition assessment (PCA)",
    addOnTypes: [
      "Roof condition survey (low-slope/steep)",
      "Moisture intrusion/basement foundation survey",
    ],
    property: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    },
    client: {
      name: "Stark Industries",
      email: "tony@stark.com",
      phone: "(212) 555-0100"
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto w-full">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href="/inspections/new/details">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New Inspection: Review
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Review & Confirm</CardTitle>
                <CardDescription>
                  Please review the details below before starting the inspection.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">

                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Inspection Scope</h3>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/inspections/new"><Edit className="mr-2 h-4 w-4" />Edit</Link>
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        <p className="font-medium">Primary Inspection Type</p>
                        <p className="text-muted-foreground">{inspectionDetails.primaryType}</p>
                    </div>
                     <div className="grid gap-2">
                        <p className="font-medium">Add-on Inspections</p>
                        <div className="flex flex-wrap gap-2">
                            {inspectionDetails.addOnTypes.map(type => (
                                <Badge key={type} variant="secondary">{type}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Property & Client</h3>
                         <Button variant="ghost" size="sm" asChild>
                            <Link href="/inspections/new/details"><Edit className="mr-2 h-4 w-4" />Edit</Link>
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
                    <Link href="/clients">Confirm & Start</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
