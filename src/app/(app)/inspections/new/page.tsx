

'use client';

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InspectionTypeList } from "@/components/inspection-type-list";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function NewInspectionPage() {
  const [primaryType, setPrimaryType] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto w-full">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href="/inspections">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Start a New Inspection
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Primary Inspection Type</CardTitle>
                <CardDescription>
                  Choose the main type of inspection you are performing from the list below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InspectionTypeList
                  selectionMode="single"
                  onSelectionChange={(selection) => setPrimaryType(selection as string)}
                />
              </CardContent>
            </Card>

            {primaryType && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Add-on Inspections (Optional)</CardTitle>
                  <CardDescription>
                    You can add multiple secondary inspections to this project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <InspectionTypeList selectionMode="multiple" />
                   <Separator className="my-6" />
                   <Button className="w-full sm:w-auto" asChild>
                     <Link href="/inspections/new/details">
                        Next: Add Property Details
                     </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
