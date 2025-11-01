
'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { periodicTableData, elementCategories } from "@/lib/periodic-table-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PeriodicTablePage() {
    const params = useParams<{ id: string }>();
    const keyId = params.id;
    const [activeElements, setActiveElements] = useState<number[]>(periodicTableData.map(el => el.number));
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggle = (elementNumber: number, checked: boolean) => {
        if (checked) {
            setActiveElements(prev => [...prev, elementNumber]);
        } else {
            setActiveElements(prev => prev.filter(num => num !== elementNumber));
        }
    };

    const filteredElements = periodicTableData.filter(element => {
        if (searchTerm === '') return true;
        const term = searchTerm.toLowerCase();
        return (
            element.name.toLowerCase().includes(term) ||
            element.symbol.toLowerCase().includes(term) ||
            String(element.number).includes(term)
        );
    });

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
                            Select the elements that LARI-PRISM should analyze. Use the search bar to filter, and click an element to toggle its active state.
                        </CardDescription>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by element name, symbol, or atomic number..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TooltipProvider>
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
                                }}
                            >
                                {periodicTableData.map((element) => {
                                    const isActive = activeElements.includes(element.number);
                                    const isVisible = filteredElements.some(el => el.number === element.number);
                                    return (
                                    <Tooltip key={element.symbol} delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handleToggle(element.number, !isActive)}
                                                className={cn(
                                                    "relative aspect-square flex flex-col items-center justify-center p-1 border rounded-md cursor-pointer transition-all hover:scale-105 hover:z-10",
                                                    element.category === 'diatomic nonmetal' && 'bg-green-500/40',
                                                    element.category === 'noble gas' && 'bg-purple-500/40',
                                                    element.category === 'alkali metal' && 'bg-red-500/40',
                                                    element.category === 'alkaline earth metal' && 'bg-orange-500/40',
                                                    element.category === 'metalloid' && 'bg-yellow-500/40',
                                                    element.category === 'polyatomic nonmetal' && 'bg-emerald-500/40',
                                                    element.category === 'post-transition metal' && 'bg-cyan-500/40',
                                                    element.category === 'transition metal' && 'bg-sky-500/40',
                                                    element.category === 'lanthanide' && 'bg-pink-500/40',
                                                    element.category === 'actinide' && 'bg-rose-500/40',
                                                    element.category === 'unknown' && 'bg-gray-500/40',
                                                    isActive ? 'text-foreground/90' : 'text-foreground/50',
                                                    !isActive && "opacity-40 hover:opacity-75 grayscale",
                                                    !isVisible && "opacity-10 grayscale pointer-events-none"
                                                )}
                                                style={{
                                                    gridColumn: element.xpos,
                                                    gridRow: element.ypos,
                                                }}
                                            >
                                                <div className="absolute top-1 left-1 text-xs font-semibold">{element.number}</div>
                                                <div className="text-xl font-bold">{element.symbol}</div>
                                                <div className="text-[10px] leading-none text-center truncate w-full font-medium">{element.name}</div>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs p-4" side="top" align="center">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-md text-foreground", 
                                                        element.category === 'diatomic nonmetal' && 'bg-green-500/40',
                                                        element.category === 'noble gas' && 'bg-purple-500/40',
                                                        element.category === 'alkali metal' && 'bg-red-500/40',
                                                        element.category === 'alkaline earth metal' && 'bg-orange-500/40',
                                                        element.category === 'metalloid' && 'bg-yellow-500/40',
                                                        element.category === 'polyatomic nonmetal' && 'bg-emerald-500/40',
                                                        element.category === 'post-transition metal' && 'bg-cyan-500/40',
                                                        element.category === 'transition metal' && 'bg-sky-500/40',
                                                        element.category === 'lanthanide' && 'bg-pink-500/40',
                                                        element.category === 'actinide' && 'bg-rose-500/40',
                                                        element.category === 'unknown' && 'bg-gray-500/40',
                                                    )}>
                                                        <span className="text-3xl font-bold">{element.symbol}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-lg font-bold">{element.name}</p>
                                                        <p className="text-sm text-muted-foreground capitalize">{element.category}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                    <div>Atomic Number: <span className="font-medium float-right">{element.number}</span></div>
                                                    <div>Atomic Mass: <span className="font-medium float-right">{element.atomic_mass.toFixed(3)}</span></div>
                                                </div>
                                                 <div className="flex items-center space-x-2 border-t pt-4">
                                                    <Switch
                                                        id={`switch-${element.symbol}`}
                                                        checked={isActive}
                                                        onCheckedChange={(checked) => handleToggle(element.number, checked)}
                                                    />
                                                    <Label htmlFor={`switch-${element.symbol}`} className="cursor-pointer">Enable analysis for this element</Label>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )})}
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
