
'use client';

import Link from "next/link";
import { ChevronLeft, User, HardHat, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { mockInspectors } from "@/lib/data";

const mockResources = [
    ...mockInspectors.map(i => ({ id: i.id, name: i.name, type: 'inspector' as const })),
    { id: 'equip-001', name: 'FLIR E8-XT Thermal Camera', type: 'equipment' as const },
    { id: 'equip-002', name: 'Ouster OS1 LiDAR Scanner', type: 'equipment' as const },
];

export default function NewBookingPage() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const getIcon = (type: 'inspector' | 'equipment') => {
    switch (type) {
      case 'inspector':
        return <User className="h-5 w-5 text-muted-foreground" />;
      case 'equipment':
        return <Package className="h-5 w-5 text-muted-foreground" />;
      default:
        return <HardHat className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 lg:px-6">
      <div className="flex flex-col sm:gap-4">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href={clientId ? `/clients/${clientId}` : "/calendar"}>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New Booking: Step 1 of 3
              </h1>
            </div>
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Select Resource</CardTitle>
                <CardDescription>
                  Choose the resource you would like to book.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                    {mockResources.map((resource) => (
                        <button
                            key={resource.id}
                            onClick={() => setSelectedResource(resource.id)}
                            className={`w-full text-left p-4 rounded-lg border flex items-center gap-4 bg-background/40 hover:bg-muted/50 transition-colors ${selectedResource === resource.id ? 'ring-2 ring-primary bg-muted/50' : 'border-border/50'}`}
                        >
                             <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {getIcon(resource.type)}
                            </div>
                            <div>
                                <p className="font-semibold">{resource.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                            </div>
                        </button>
                    ))}
                </div>
              </CardContent>
              {selectedResource && (
                <CardContent>
                   <Button className="w-full sm:w-auto" asChild>
                     <Link href={`/bookings/new/details?clientId=${clientId ?? ''}&resourceId=${selectedResource}`}>
                        Next: Questionnaire & Time
                     </Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
