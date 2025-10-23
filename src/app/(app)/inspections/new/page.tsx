

'use client';

import Link from "next/link";
import { ChevronLeft, ListFilter, PlusCircle, Search, Library, FolderKanban, Star } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { mockSubscriptionPlans } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NewInspectionPage() {
  const [primaryType, setPrimaryType] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');


  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-4xl mx-auto w-full">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link href={clientId ? `/clients/${clientId}` : "/inspections"}>
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
                  Choose the main type of inspection you are performing from the list below, or create your own template.
                </CardDescription>
                 <div className="pt-4">
                     <Tabs defaultValue="library">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="library"><Library className="mr-2 h-4 w-4" />Library</TabsTrigger>
                            <TabsTrigger value="projects"><FolderKanban className="mr-2 h-4 w-4"/>Projects</TabsTrigger>
                            <TabsTrigger value="saved"><Star className="mr-2 h-4 w-4"/>Saved Templates</TabsTrigger>
                        </TabsList>
                        <TabsContent value="library">
                             <div className="flex items-center gap-2 pt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search inspection types..." className="pl-9 rounded-md" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 gap-1">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Filter
                                        </span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked>Real-estate</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>Construction</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>Environmental</DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {isProOrEnterprise && (
                                    <Button size="sm" className="h-10 gap-1">
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Create Template
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </TabsContent>
                         <TabsContent value="projects">
                            <div className="flex flex-col items-center justify-center pt-8 text-center">
                                <p className="text-muted-foreground mb-4">Project folders are managed in the Teams section.</p>
                                <Button asChild>
                                    <Link href="/teams">Go to Teams & Dispatch</Link>
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="saved">
                           <div className="flex flex-col items-center justify-center pt-8 text-center">
                                <p className="text-muted-foreground">Your saved custom templates will appear here.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
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
                     <Link href={{ pathname: "/inspections/new/details", query: { clientId: clientId ?? undefined }}}>
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
