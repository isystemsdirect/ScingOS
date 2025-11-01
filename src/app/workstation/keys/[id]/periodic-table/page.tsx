
'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { periodicTableData, elementCategories } from "@/lib/periodic-table-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PeriodicTablePage() {
    const params = useParams<{ id: string }>();
    const keyId = params.id;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="grid gap-8">
                <div className="flex items-center gap-4">
                    <Link href={`/workstation/keys/${keyId}`}>
                        <Button variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Key Management</span>
                        </Button>
                    </Link>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Periodic Table Element Selector
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Analyzable Elements</CardTitle>
                        <CardDescription>
                            Select the elements that LARI-PRISM should analyze. Click an element to toggle its active state.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TooltipProvider>
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
                                }}
                            >
                                {periodicTableData.map((element) => (
                                    <Tooltip key={element.symbol}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "relative aspect-square flex flex-col items-center justify-center p-1 border rounded-md cursor-pointer transition-all hover:scale-105 hover:z-10",
                                                    "text-white",
                                                    elementCategories[element.category as keyof typeof elementCategories]?.bg
                                                )}
                                                style={{
                                                    gridColumn: element.xpos,
                                                    gridRow: element.ypos,
                                                }}
                                            >
                                                <div className="absolute top-1 left-1 text-xs font-light">{element.number}</div>
                                                <div className="text-xl font-bold">{element.symbol}</div>
                                                <div className="text-[10px] leading-none text-center truncate w-full">{element.name}</div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{element.name} ({element.symbol})</p>
                                            <p>Atomic Number: {element.number}</p>
                                            <p>Atomic Mass: {element.atomic_mass.toFixed(3)}</p>
                                            <p>Category: {element.category}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>

                         <div className="mt-8 flex flex-wrap gap-4">
                            {Object.entries(elementCategories).map(([key, { label, bg }]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className={cn("h-4 w-4 rounded-sm", bg)}></div>
                                    <span className="text-xs text-muted-foreground">{label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
