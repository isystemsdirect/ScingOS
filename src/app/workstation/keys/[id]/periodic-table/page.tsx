
'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Search, Camera, Mic, Copy } from "lucide-react";
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

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Copied to clipboard!",
        });
    };
    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
            >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
            </Button>
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-xs">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};


const firestoreStructureCode = `
// /substanceQueries (collection)
{
  queryId: "auto-uuid",
  userId: "user-123",
  queryText: "304 stainless steel pipe", // user search
  normalized: "Type 304 Stainless Steel", // resolved by SCING AI NLP handler
  status: "pending" | "processing" | "complete" | "error",
  requestedAt: Timestamp,
  resultId: "elementBreakdown-autoid"
}

// /elementBreakdowns (collection)
{
  resultId: "elementBreakdown-autoid",
  queryId: "auto-uuid",
  substance: "Type 304 Stainless Steel",
  elements: [
    { symbol: "Fe", percent: 71.0, primary: true },
    { symbol: "Cr", percent: 18.0, role: "corrosion resistance" },
    { symbol: "Ni", percent: 8.0, role: "ductility" },
    { symbol: "Mn", percent: 2.0, role: "deoxidizer" },
    { symbol: "Si", percent: 1.0 },
    // ...trace (ppm, hazardous, flagged)
  ],
  regulatoryFlags: [
    { code: "REACH", compliant: true },
    { code: "FDA", note: "Food-grade only if Ni < 10%" }
  ],
  provenance: [
    { source: "ASTM spec A312", uri: "...", date: "2025-01-01" },
    { source: "PubChem", uri: "...", date: "2024-09-15" }
  ],
  created: Timestamp,
  paidFeatures: ["compliance", "traceAnalytics", "reportExport"]
}
`;

const firebaseFunctionCode = `
exports.analyzeSubstance = functions.firestore
  .document('/substanceQueries/{queryId}')
  .onCreate(async (snap, context) => {
    const { queryText, userId } = snap.data();
    // Use SCING AI NLP API to normalize and classify search term
    const normalized = await scingNlpResolve(queryText);
    // Search trusted external databases (Materials Project, PubChem, ASTM, vendor APIs)
    const composition = await getElementBreakdown(normalized);
    // Run compliance and flagged element logic, assign premium status if needed
    const flags = computeCompliance(composition, userId);
    // Store result in /elementBreakdowns
    await firestore.collection("elementBreakdowns").add({
      queryId: context.params.queryId,
      substance: normalized,
      elements: composition.elements,
      regulatoryFlags: flags,
      provenance: composition.sources,
      created: Date.now(),
      paidFeatures: flags.premium ? ["compliance", "traceAnalytics", "reportExport"] : []
    });
    // Optionally: push notification to user/device/email
    return;
  });
`;

const frontendExampleCode = `
export default function SubstanceSearch() {
  const [substance, setSubstance] = useState('');
  const [result, setResult] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async () => {
    // Add query to Firestore to kick off Function
    const docRef = await addDoc(collection(db, 'substanceQueries'), {
      queryText: substance,
      userId: user.uid,
      requestedAt: serverTimestamp()
    });
    // Listen for result in elementBreakdowns
    onSnapshot(doc(db, 'elementBreakdowns', docRef.id), (snap) => {
      setResult(snap.data());
      setIsPremium(snap.data().paidFeatures.length > 0);
    });
  };

  return (
    <div>
      <input value={substance} onChange={e => setSubstance(e.target.value)} />
      <button onClick={handleSubmit}>Analyze Substance</button>
      {result && (
        <div className="result-card lucrative">
          <h2>{result.substance}</h2>
          <table>
            <thead><tr><th>Element</th><th>%</th><th>Role</th></tr></thead>
            <tbody>
              {result.elements.map(e => <tr key={e.symbol}>
                <td>{e.symbol}</td><td>{e.percent.toFixed(2)}</td><td>{e.role || '-'}</td>
              </tr>)}
            </tbody>
          </table>
          <div className="reg-flags">
            {result.regulatoryFlags.map(flag => (
              <span className={flag.compliant ? 'compliant' : 'flagged'}>{flag.code}</span>
            ))}
          </div>
          {isPremium && 
            <button className="premium-btn" onClick={openUpgradeModal}>
              Unlock full compliance analytics & export
            </button>
          }
        </div>
      )}
    </div>
  );
}
`;


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
                             <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
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

                <Card>
                    <CardHeader>
                        <CardTitle>Substance Analysis Architecture</CardTitle>
                        <CardDescription>
                            Technical architecture for integrating SCING AI substance search with the LARI elemental analytics engine.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">1. Firestore Database Structure</h3>
                            <CodeBlock code={firestoreStructureCode} language="js" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">2. Firebase Function — Substance Analyzer</h3>
                            <CodeBlock code={firebaseFunctionCode} language="js" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">3. Front-End Example (React + Firestore)</h3>
                             <CodeBlock code={frontendExampleCode} language="jsx" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Lucrative SaaS Features</h3>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li><strong>Premium exports:</strong> PDF/CSV, regulatory reports, flagged/at-risk batch auditing.</li>
                                <li><strong>Compliance modules:</strong> RoHS, REACH, FDA, country/region laws attached per inquiry.</li>
                                <li><strong>Bulk/enterprise jobs:</strong> Batch analysis, scheduled reports, webhook/API integration.</li>
                                <li><strong>Data enrichment:</strong> Upcharge for proprietary datasets, advanced provenance, insurance risk analytics.</li>
                                <li><strong>User Logs & Upgrades:</strong> Per-user tracking, usage counts, upgrade journeys.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
