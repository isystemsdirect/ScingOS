
'use client';

import Link from "next/link";
import { ChevronLeft, PlusCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddCertificationPage() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto w-full">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Settings</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Add Certification/License
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Your Credential</CardTitle>
                <CardDescription>
                  Choose the certification or license you want to add from our library.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InspectionTypeList
                  selectionMode="single"
                  onSelectionChange={(selection) => setSelectedCert(selection as string)}
                />
              </CardContent>
            </Card>

            {selectedCert && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Enter Credential Details</CardTitle>
                  <CardDescription>
                    Provide the ID and expiration for your selected credential.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                        <Label>Selected Certification</Label>
                        <Input value={selectedCert.split('-').slice(1).join('-')} readOnly disabled />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="license-id">License or Certification ID</Label>
                            <Input id="license-id" placeholder="NACHI230101" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="expiry-date">Expiration Date</Label>
                            <Input id="expiry-date" type="date" />
                        </div>
                    </div>
                   <Separator className="my-2" />
                   <Button className="w-full sm:w-auto" asChild>
                     <Link href="/settings">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add and Submit for Verification
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

