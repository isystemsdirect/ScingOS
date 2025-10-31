
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
import { useSearchParams, useParams, notFound } from "next/navigation";
import { Suspense } from "react";
import inspectionData from '@/lib/inspection-types.json';
import { slugify } from "@/lib/utils";
import { DynamicInspectionForm } from "@/components/dynamic-inspection-form";

function NewDynamicInspectionPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const slug = params.slug as string;

    const inspectionType = inspectionData.inspectionTypeCategories
        .flatMap(category => category.types)
        .find(type => slugify(type) === slug);
    
    if (!inspectionType) {
        notFound();
    }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
      <div className="grid flex-1 items-start gap-4 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href={{ pathname: "/inspections/new", query: { clientId: clientId ?? undefined }}}>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New Inspection
              </h1>
            </div>
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{inspectionType}</CardTitle>
                <CardDescription>
                  Please fill out the details for this inspection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicInspectionForm inspectionType={inspectionType} />
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}

export default function NewDynamicInspectionPageWrapper() {
    return (
        <Suspense>
            <NewDynamicInspectionPage />
        </Suspense>
    )
}
