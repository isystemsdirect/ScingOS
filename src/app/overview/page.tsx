
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  BrainCircuit,
  Cpu,
  FileText,
  Gem,
  Globe,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Bot
} from 'lucide-react';
import { ScingularLogoText } from '@/components/ui/logo-text';

const corePillars = [
    {
        icon: Cpu,
        title: "The AI Trinity: LARI™, Scing™, & BANE™",
        description: "LARI is the analytical powerhouse, Scing is the hyper-intuitive human-relations AI bot, and BANE ensures platform integrity and data provenance while driving business intelligence."
    },
    {
        icon: BrainCircuit,
        title: "Edge-to-Cloud Continuum Architecture",
        description: "A sophisticated hybrid architecture leveraging on-device processing for immediate feedback and cloud computing for deep analytics and model training."
    },
    {
        icon: ShieldCheck,
        title: "Cryptographic Trust & Provenance Chain",
        description: "Every data point is cryptographically signed and timestamped by BANE, creating an unbroken, immutable audit trail from sensor to final report."
    },
    {
        icon: Gem,
        title: "Entitlement-Driven Monetization",
        description: "A dynamic, multi-tiered SaaS model where access to functionalities is managed via a proprietary 'Key' system, optimized by BANE."
    }
];

const lariEngines = [
    { name: "LARI-VISION", description: "Processes visual data for defect recognition, OCR, and 3D modeling." },
    { name: "LARI-MAPPER", description: "Processes LiDAR and 3D data for floorplans and geometric analysis." },
    { name: "LARI-PRISM", description: "Simulates API lookups to authoritative databases for material composition analysis." },
    { name: "LARI-THERM & LARI-ECHO", description: "Interpret thermal, infrared, sonar, and acoustic data for subsurface defect detection." },
    { name: "LARI-COMPLIANCE & LARI-SYNTHESIZER", description: "Cross-references findings against codes and synthesizes data into reports." },
    { name: "LARI-GUANGEL & Domain Models", description: "A suite of specialized models for field safety, logistics, environmental analysis, and more." },
];


export default function OverviewPage() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="space-y-12 text-foreground">
                
                <header className="space-y-4 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-4">
                        <Sparkles className="h-10 w-10 text-primary" />
                        SCINGULAR AI
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                        A Strategic & Technical Deep-Dive into the World's First Vertically-Integrated, AI-Powered Inspection & Field Intelligence Ecosystem.
                    </p>
                </header>

                <Separator />

                <section>
                    <Card className="bg-card/60 backdrop-blur-sm border-primary/20 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3"><Rocket className="h-6 w-6"/> Vision & Total Addressable Market (TAM)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-base text-muted-foreground leading-relaxed">
                            <p>
                                The global Inspection, Testing, and Certification (TIC) market, valued at over **$200 billion** and projected to exceed **$300 billion by 2030**, currently operates on antiquated, analog-first principles. SCINGULAR is not merely a participant in this market; it is the market's complete redefinition.
                            </p>
                            <p>
                                We have architected the definitive operating system for physical world assessment—a vertically-integrated ecosystem that fuses proprietary sensor hardware, edge AI, high-compute cloud analytics, and a sophisticated SaaS monetization engine. This creates an unparalleled competitive moat, transforming raw field data into verifiable, monetizable, and legally defensible intelligence in real-time.
                            </p>
                        </CardContent>
                    </Card>
                </section>
                
                <section className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Core Technological Pillars</h2>
                        <p className="text-muted-foreground mt-2">The four foundational and proprietary innovations driving our market dominance.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                         {corePillars.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <Card key={pillar.title} className="flex flex-col bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                                    <CardHeader className="flex-row items-center gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-lg">{pillar.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <CardDescription>{pillar.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><Network className="h-8 w-8"/> LARI™ Engine: The Analytical Core</h2>
                        <p className="text-muted-foreground mt-2">A technical breakdown of the specialized sub-engines within the LARI federated AI suite.</p>
                    </div>
                     <Card className="bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lariEngines.map(engine => (
                                <div key={engine.name} className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
                                    <div>
                                        <p className="font-semibold">{engine.name}</p>
                                        <p className="text-sm text-muted-foreground">{engine.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                     </Card>
                </section>
                
                <section className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><TrendingUp className="h-8 w-8"/> The Monetization Engine</h2>
                        <p className="text-muted-foreground mt-2">A multi-pronged, high-margin strategy for scalability and sustained growth.</p>
                    </div>
                     <div className="grid gap-6 md:grid-cols-2">
                         <Card className="bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Tiered SaaS & A-La-Carte Key Marketplace</CardTitle>
                                <CardDescription>A recurring revenue model with multiple upsell vectors.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <ul className="text-sm list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Freemium/Individual ($49/mo):</span> Establishes market presence and funnels users into the ecosystem.</li>
                                    <li><span className="font-semibold text-foreground">Pro/Business ($149/mo):</span> Unlocks external hardware integration and advanced LARI engines.</li>
                                    <li><span className="font-semibold text-foreground">Enterprise ($399+/mo):</span> High-ticket contracts with unlimited usage and private cloud options.</li>
                                    <li><span className="font-semibold text-foreground">Key Marketplace:</span> An "App Store" model for a-la-carte purchasing of specialized LARI engine 'Keys'.</li>
                                </ul>
                            </CardContent>
                         </Card>
                         <Card className="bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Data & Analytics as a Service (DaaS) via BANE</CardTitle>
                                <CardDescription>Selling premium data products from aggregated, anonymized inspection data.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <ul className="text-sm list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Insurance & Underwriting:</span> Provide anonymized risk data for actuarial modeling.</li>
                                    <li><span className="font-semibold text-foreground">Real Estate Finance & REITs:</span> Offer portfolio-level analytics for due diligence and capital expenditure forecasting.</li>
                                    <li><span className="font-semibold text-foreground">Predictive Maintenance Models:</span> Sell predictive models for component failure to property management firms and OEMs.</li>
                                    <li><span className="font-semibold text-foreground">Market Intelligence Reports:</span> Generate reports on material usage, compliance, and defect patterns.</li>
                                </ul>
                            </CardContent>
                         </Card>
                    </div>
                </section>

                 <section className="text-center py-8">
                    <h2 className="text-2xl font-bold">Defining the Future</h2>
                    <p className="mt-4 max-w-4xl mx-auto text-lg text-muted-foreground">
                       SCINGULAR is more than a software company; it is the central nervous system for the future of physical asset management. By creating a self-reinforcing ecosystem where advanced AI tools drive the creation of valuable data, we are positioned for exponential growth and complete market domination.
                    </p>
                </section>
            </div>
        </div>
    );
}

