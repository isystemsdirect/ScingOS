
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardList,
  Cpu,
  Dashboard,
  DollarSign,
  FileText,
  Home,
  KeyRound,
  Library,
  MessageSquare,
  Shield,
  Sparkles,
  Store,
  Users,
  Calendar
} from 'lucide-react';


const capabilities = [
    {
        icon: Home,
        title: "Dashboard & Live Operations",
        description: "A centralized command center providing a real-time overview of all activities. Features key performance indicators, a live map of team members and client needs, and status updates for ongoing inspections.",
        tags: ["Real-Time", "Analytics", "Mapping"]
    },
    {
        icon: ClipboardList,
        title: "Inspection Management",
        description: "An end-to-end system for creating, managing, and finalizing inspection reports. The workflow guides users from template selection to final report generation, integrating AI for executive summaries and detailed findings.",
        tags: ["Workflow", "Reporting", "AI Summary"]
    },
    {
        icon: Calendar,
        title: "Scheduling & Team Coordination",
        description: "A comprehensive team calendar for managing bookings and availability. Users can view team schedules, create new bookings for specific resources (inspectors or equipment), and manage appointments.",
        tags: ["Calendar", "Booking", "Resource Management"]
    },
    {
        icon: Users,
        title: "Client & Team Management",
        description: "Robust CRM and team administration tools. Includes a client database with contact information and inspection history, plus a team roster for managing roles, permissions, and invitations.",
        tags: ["CRM", "User Management", "Permissions"]
    },
    {
        icon: Cpu,
        title: "Workstation & Device Lab",
        description: "The central hub for personal and device configuration. Users can manage their public profile, professional credentials, API keys, and connect hardware like cameras and sensors in the Device Lab for tuning.",
        tags: ["Configuration", "Device Management", "Profiles"]
    },
    {
        icon: KeyRound,
        title: "LARI Engine & Key Management",
        description: "The core of SCINGULAR's intelligence. The LARI (Logistical, Analytical, and Reporting Interface) engine is composed of specialized sub-engines. Users manage access and functionality through a system of tiered Keys.",
        tags: ["AI Core", "API Keys", "Entitlements"]
    },
    {
        icon: Sparkles,
        title: "LARI-PRISM: Substance Analysis",
        description: "A powerful feature within the Workstation that allows users to analyze the elemental composition of any substance. It simulates real-time lookups to authoritative scientific databases, providing detailed breakdowns and regulatory compliance flags.",
        tags: ["AI Analysis", "Chemistry", "Compliance"]
    },
    {
        icon: MessageSquare,
        title: "Community & Knowledge Hub",
        description: "A social platform for inspectors to connect, ask questions, and share knowledge. Features include a main timeline, topic-based forums, and industry news, fostering a collaborative environment.",
        tags: ["Social", "Collaboration", "Knowledge Base"]
    },
    {
        icon: Library,
        title: "Standards & Code Vault",
        description: "A digital library where users can upload and manage the codes, standards, and documents that train their personal AI model, ensuring accurate and relevant code cross-referencing during inspections.",
        tags: ["AI Training", "Compliance", "Documents"]
    },
    {
        icon: DollarSign,
        title: "Finance & Subscription Management",
        description: "A complete financial overview, allowing users to manage their subscription plan, update payment methods, and view their entire transaction and invoice history.",
        tags: ["Billing", "SaaS", "Invoicing"]
    },
    {
        icon: Shield,
        title: "Administration & System Health",
        description: "An admin-level control center for managing all system users, viewing audit logs of administrative actions, and monitoring the real-time health and performance of the application's APIs and servers.",
        tags: ["Admin", "Security", "Monitoring"]
    },
]

export default function OverviewPage() {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        SCINGULAR Capabilities Report
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        A comprehensive overview of the application's features and functions developed thus far.
                    </p>
                </div>
                <Separator />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {capabilities.map((cap) => {
                        const Icon = cap.icon;
                        return (
                            <Card key={cap.title} className="flex flex-col bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className='flex-1'>
                                            <CardTitle>{cap.title}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <CardDescription>{cap.description}</CardDescription>
                                </CardContent>
                                <CardContent>
                                     <div className="flex flex-wrap gap-2">
                                        {cap.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
