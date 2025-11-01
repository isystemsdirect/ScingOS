

'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Search, Camera, Mic, Copy, Beaker, FileText, BadgeCheck, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { periodicTableData, elementCategories } from "@/lib/periodic-table-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SubstanceAnalyzer = () => {
    const [substance, setSubstance] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const mockAnalysis = (query: string) => {
        // In a real app, this would trigger the Firestore function.
        // For now, we simulate the process.
        setIsLoading(true);
        setTimeout(() => {
            if (query.toLowerCase().includes("304")) {
                 setResult({
                    substance: "Type 304 Stainless Steel",
                    elements: [
                        { symbol: "Fe", percent: 71.0, role: "Primary Element" },
                        { symbol: "Cr", percent: 18.0, role: "Corrosion Resistance" },
                        { symbol: "Ni", percent: 8.0, role: "Ductility" },
                        { symbol: "Mn", percent: 2.0, role: "Deoxidizer" },
                        { symbol: "Si", percent: 1.0, role: "Trace" },
                    ],
                    regulatoryFlags: [
                        { code: "REACH", compliant: true },
                        { code: "FDA", note: "Food-grade only if Ni < 10%" }
                    ],
                    paidFeatures: ["compliance", "traceAnalytics"]
                });
            } else {
                 setResult({
                    substance: "Unknown Alloy",
                    elements: [],
                    regulatoryFlags: [],
                    paidFeatures: []
                 });
                 toast({
                     variant: "destructive",
                     title: "Analysis Failed",
                     description: "Could not identify substance. Please try a different query."
                 })
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!substance) {
            toast({
                variant: "destructive",
                title: "Input required",
                description: "Please enter a substance to analyze."
            });
            return;
        }
        mockAnalysis(substance);
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle>Substance Analysis Engine</CardTitle>
                <CardDescription>
                    Use SCING AI to analyze the elemental composition of a substance.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Beaker className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                value={substance}
                                onChange={e => setSubstance(e.target.value)}
                                placeholder="e.g., 304 stainless steel pipe" 
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Analyzing...' : 'Analyze'}
                        </Button>
                    </div>

                    {result && (
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold">{result.substance}</h3>
                            
                            {result.elements.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Element</TableHead>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Percentage</TableHead>
                                            <TableHead>Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.elements.map((e: any) => (
                                            <TableRow key={e.symbol}>
                                                <TableCell>{periodicTableData.find(el => el.symbol === e.symbol)?.name}</TableCell>
                                                <TableCell className="font-bold">{e.symbol}</TableCell>
                                                <TableCell>{e.percent.toFixed(2)}%</TableCell>
                                                <TableCell>{e.role || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            
                            {result.regulatoryFlags.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Regulatory Flags</h4>
                                    <div className="flex flex-wrap gap-2">
                                    {result.regulatoryFlags.map((flag: any) => (
                                        <Badge key={flag.code} variant={flag.compliant ? 'default' : 'destructive'} className="gap-2">
                                            <BadgeCheck className="h-4 w-4" />
                                            {flag.code}: {flag.compliant ? 'Compliant' : 'Flagged'}
                                            {flag.note && <span className="ml-2 text-xs opacity-80">({flag.note})</span>}
                                        </Badge>
                                    ))}
                                    </div>
                                </div>
                            )}
                            
                            {result.paidFeatures.length > 0 && (
                                <div className="border-t pt-4 flex items-center justify-between bg-primary/10 p-4 rounded-md">
                                    <div>
                                        <h4 className="font-semibold text-primary">Premium Analysis Unlocked</h4>
                                        <p className="text-sm text-primary/80">Full compliance analytics & export options available.</p>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <FileText className="mr-2 h-4 w-4" /> Export Report
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};


export default function PeriodicTablePage() {
    const params = useParams<{ id: string }>();
    const keyId = params.id;
    const [activeElements, setActiveElements] = useState<number[]>(periodicTableData.map(el => el.number));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleToggle = (elementNumber: number, checked: boolean) => {
        if (checked) {
            setActiveElements(prev => [...prev, elementNumber]);
        } else {
            setActiveElements(prev => prev.filter(num => num !== elementNumber));
        }
    };

    const filteredElements = periodicTableData.filter(element => {
        const matchesSearch = searchTerm === '' ||
            element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            element.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(element.number).includes(searchTerm);
        
        const matchesCategory = selectedCategory === null || element.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const allVisibleSelected = filteredElements.length > 0 && filteredElements.every(el => activeElements.includes(el.number));

    const handleToggleAll = () => {
        const visibleElementNumbers = filteredElements.map(el => el.number);
        if (allVisibleSelected) {
            // Deselect all visible
            setActiveElements(prev => prev.filter(num => !visibleElementNumbers.includes(num)));
        } else {
            // Select all visible
            setActiveElements(prev => [...new Set([...prev, ...visibleElementNumbers])]);
        }
    };


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
                            Select the elements that LARI-PRISM should analyze. Hover or click an element to manage its settings.
                        </CardDescription>
                         <div className="relative pt-4">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by element name, symbol, or atomic number..."
                                className="w-full rounded-full bg-background pl-10 pr-20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                        <div className="flex flex-wrap items-center gap-2 pt-4">
                            <Button onClick={handleToggleAll} variant="outline" size="sm">
                                {allVisibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
                            </Button>
                             <Button onClick={() => setSelectedCategory(null)} variant={selectedCategory === null ? 'default' : 'secondary'} size="sm">All</Button>
                            {Object.entries(elementCategories).map(([key, { label }]) => (
                                <Button key={key} onClick={() => setSelectedCategory(key)} variant={selectedCategory === key ? 'default' : 'secondary'} size="sm">{label}</Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto pb-4">
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
                                                    elementCategories[element.category as keyof typeof elementCategories]?.bg,
                                                    isActive ? 'text-foreground/90' : 'text-foreground/50',
                                                    !isActive && "opacity-40 hover:opacity-75 grayscale",
                                                    !isVisible && "opacity-10 grayscale pointer-events-none"
                                                )}
                                                style={{
                                                    gridColumn: element.xpos,
                                                    gridRow: element.ypos,
                                                }}
                                            >
                                                <div className="absolute top-1 left-1 text-xs font-normal">{element.number}</div>
                                                <div className="text-xl font-bold">{element.symbol}</div>
                                                <div className="text-[10px] leading-none text-center truncate w-full font-medium">{element.name}</div>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md p-6 rounded-xl shadow-2xl border bg-gradient-to-br from-white/90 via-slate-100/80 to-white/75 text-gray-900">
                                              <div className="flex gap-5">
                                                <div className={cn(
                                                  "flex h-20 w-20 items-center justify-center rounded-lg text-4xl font-bold ring-2 ring-inset",
                                                  elementCategories[element.category as keyof typeof elementCategories]?.bg,
                                                  isActive ? "ring-primary" : "ring-gray-400"
                                                )}>{element.symbol}</div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex gap-2 items-center">
                                                    <span className="font-bold text-xl">{element.name}</span>
                                                    <span className={cn("text-xs rounded-full px-2 py-1", elementCategories[element.category as keyof typeof elementCategories]?.bg)}>{elementCategories[element.category as keyof typeof elementCategories]?.label}</span>
                                                    {isActive && <span className="ml-2 px-2 py-1 text-[10px] rounded bg-primary/70 text-white">Active Analysis</span>}
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                                                    <div>Atomic Number: <span className="font-semibold float-right text-primary">{element.number}</span></div>
                                                    <div>Atomic Mass: <span className="font-semibold float-right">{element.atomic_mass.toFixed(3)}</span></div>
                                                  </div>
                                                  <div className="mt-2 text-xs flex flex-wrap gap-2">
                                                    <span className="inline-block px-2 py-1 bg-yellow-100/70 rounded">Industry Limits: <span className="font-semibold text-yellow-700">Available</span></span>
                                                    <span className="inline-block px-2 py-1 bg-red-100/70 rounded">Flaggable: <span className="font-semibold text-red-700">Yes</span></span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="pt-5 mt-2 border-t flex items-center space-x-3">
                                                <Switch
                                                  id={`switch-${element.symbol}`}
                                                  checked={isActive}
                                                  onCheckedChange={(checked) => handleToggle(element.number, checked)}
                                                />
                                                <Label htmlFor={`switch-${element.symbol}`}>Enable analysis for this element</Label>
                                              </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )})}
                            </div>
                        </TooltipProvider>
                      </div>

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

                <SubstanceAnalyzer />
                
            </div>
        </div>
    );
}

    