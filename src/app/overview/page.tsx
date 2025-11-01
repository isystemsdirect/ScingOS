
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

const corePillars = [
    {
        icon: BrainCircuit,
        title: "LARI™ AI Core",
        description: "The Logistical, Analytical, and Reporting Interface is the central nervous system, a suite of interoperable AI sub-engines designed for multimodal data fusion and complex analysis."
    },
    {
        icon: Cpu,
        title: "Edge-to-Cloud Continuum",
        description: "A hybrid architecture enabling real-time, on-device processing for speed and offline capability, with seamless offload to high-compute cloud infrastructure for deep analytics."
    },
    {
        icon: ShieldCheck,
        title: "Trust & Provenance",
        description: "Every data point, analysis, and report is cryptographically signed and chained, creating an immutable audit trail from sensor to final sign-off, ensuring scientific and legal defensibility."
    },
    {
        icon: Gem,
        title: "Monetization Framework",
        description: "A sophisticated, entitlement-driven SaaS model where functionality is unlocked via tiered and specialized 'Keys', creating powerful, recurring revenue streams."
    }
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
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        An Executive Summary & Strategic Overview of the World's First Vertically-Integrated, AI-Powered Inspection & Field Intelligence Ecosystem.
                    </p>
                </header>

                <Separator />

                <section>
                    <Card className="bg-card/60 backdrop-blur-sm border-primary/20 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3"><Rocket className="h-6 w-6"/> The SCINGULAR Vision: The Future of Inspection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-base text-muted-foreground leading-relaxed">
                            <p>
                                The global inspection, testing, and certification market is a multi-trillion dollar industry ripe for disruption. It currently operates on fragmented, decades-old workflows, manual data entry, and subjective, error-prone analysis. SCINGULAR introduces a paradigm shift: a unified, intelligent platform that transforms raw field data into verifiable, monetizable, and actionable insights in real-time. We are not merely building a better inspection app; we are creating the definitive operating system for the entire physical world assessment value chain.
                            </p>
                            <p>
                                By vertically integrating sensor hardware, edge AI processing, cloud analytics, and a sophisticated SaaS monetization engine, SCINGULAR creates an unparalleled moat. Our platform empowers a single inspector to perform the work of an entire team of specialists, exponentially increasing efficiency, accuracy, and profitability while simultaneously establishing a new gold standard for data integrity and scientific rigor.
                            </p>
                        </CardContent>
                    </Card>
                </section>
                
                <section className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Core Technological Pillars</h2>
                        <p className="text-muted-foreground mt-2">The four foundational innovations driving our market disruption.</p>
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
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><Network className="h-8 w-8"/> The LARI™ Engine: A Symphony of AI</h2>
                        <p className="text-muted-foreground mt-2">A breakdown of the specialized AI sub-engines that form our proprietary core.</p>
                    </div>
                    <Card className="bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-VISION</h3>
                                <p className="text-sm text-muted-foreground">Processes all visual data—from smartphone cameras to drone feeds and borescopes—to identify defects, perform OCR, and create 2D/3D asset models.</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-MAPPER</h3>
                                <p className="text-sm text-muted-foreground">The spatial intelligence core. Ingests LiDAR, laser, and 3D volumetric data to generate floorplans, calculate volumes, and perform advanced geometric analysis.</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-PRISM</h3>
                                <p className="text-sm text-muted-foreground">A groundbreaking elemental analysis engine. Simulates real-time lookups to scientific databases to determine material compositions and flag regulatory & safety issues.</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-THERM & LARI-ECHO</h3>
                                <p className="text-sm text-muted-foreground">These engines interpret the invisible, analyzing thermal/infrared data for heat anomalies and sonar/acoustic data for subsurface defects like voids and rebar location.</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-COMPLIANCE & LARI-SYNTHESIZER</h3>
                                <p className="text-sm text-muted-foreground">The reporting powerhouses. Cross-references all findings against a vast library of codes and standards, then synthesizes the data into coherent, actionable executive summaries.</p>
                            </div>
                             <div className="space-y-1">
                                <h3 className="font-semibold text-primary">LARI-GUANGEL & Domain Models</h3>
                                <p className="text-sm text-muted-foreground">A suite of specialized models for safety (Guardian Angel AI), logistics, environmental analysis, and other industry verticals, providing hyper-contextual, actionable intelligence.</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
                
                <section className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><TrendingUp className="h-8 w-8"/> Lucrative Monetization & Market Strategy</h2>
                        <p className="text-muted-foreground mt-2">Our multi-pronged strategy for market capture and scalable, high-margin revenue generation.</p>
                    </div>
                     <div className="grid gap-6 md:grid-cols-2">
                         <Card className="bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Tiered SaaS & Key Marketplace</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">A recurring revenue model based on inspector seats and data volume, with powerful upsell paths.</p>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Freemium Tier:</span> Establishes market presence and a user funnel by offering core tools.</li>
                                    <li><span className="font-semibold text-foreground">Pro Tier:</span> Unlocks external hardware integration (drones, LiDAR), creating a primary revenue driver for professional users.</li>
                                    <li><span className="font-semibold text-foreground">Enterprise Tier:</span> High-ticket contracts for large firms, offering unlimited usage, advanced security, and dedicated support.</li>
                                    <li><span className="font-semibold text-foreground">Key Marketplace:</span> A powerful a-la-carte system selling access to specialized LARI engines (e.g., LARI-PRISM), creating high-margin, needs-based revenue streams.</li>
                                </ul>
                            </CardContent>
                         </Card>
                         <Card className="bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Data & Analytics as a Service (DAaaS)</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">The true long-term value lies in our unique, aggregated, and verifiable dataset of the built world.</p>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Insurance & Underwriting:</span> Sell anonymized, aggregated risk data (e.g., defect prevalence by region) to insurance carriers for actuarial modeling.</li>
                                    <li><  span className="font-semibold text-foreground">Real Estate Finance:</span> Provide portfolio-level analytics to REITs, lenders, and investors for due diligence and asset lifecycle management.</li>
                                    <li><span className="font-semibold text-foreground">Predictive Maintenance:</span> Leverage historical data to create predictive models for component failure, sold as a premium analytics service to property managers.</li>
                                </ul>
                            </CardContent>
                         </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}
