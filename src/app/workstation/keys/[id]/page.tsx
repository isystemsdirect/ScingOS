
'use client';
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ChevronLeft,
  KeyRound,
  CheckCircle,
  XCircle,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function KeyManagementPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) {
    notFound();
  }
  
  const keyDetails: {[key: string]: {name: string, description: string, capabilities: {[key: string]: string}}} = {
    'key_vision_std_abc123': {
        name: "LARI-VISION",
        description: "Image/Video/CCTV/Drone/Direct Visual",
        capabilities: {
            "Construction": "Facade, roof, bridge, tunnel, elevator, crane, traffic, site safety",
            "Energy": "Solar array, wind turbine, substation, oil/gas tanks/platforms, nuclear visual checks",
            "Water": "Tank/reservoir, pump station, canal, dam",
            "Transportation": "Vehicle, rail rolling stock, cargo bay, road surface, airport field marking",
            "Manufacturing": "Packed goods, batch output, label and packaging checks, cleanroom monitoring",
            "Healthcare": "Medical device surface, internal endoscopy, facility safety",
            "Agriculture": "Livestock visual, produce grading, storage/warehouse",
            "Environmental": "Landfill, hazardous waste, soil/air visible pollutants"
        }
    }
  }
  
  const details = keyDetails[params.id] || {
        name: "LARI Engine Key",
        description: "Manages a specific LARI sub-engine.",
        capabilities: {
            "General": "This key enables access to a specialized LARI sub-engine for advanced data processing."
        }
  }

  const featureToggles = [
    { id: "external_camera", label: "External Camera Support", description: "Enable USB/IP/RTSP external feeds", availability: "Pro/Max", defaultChecked: true },
    { id: "ai_defect_overlay", label: "AI Defect Overlay", description: "Live ML markups in HUD", availability: "Core, Pro, Max", defaultChecked: true },
    { id: "panorama_stitch", label: "Panorama Stitch", description: "Automatic multi-photo image join", availability: "Pro/Max", defaultChecked: true },
    { id: "borescope_integration", label: "Borescope Integration", description: "Endoscope device feeds", availability: "Pro/Max", defaultChecked: false },
    { id: "report_branding", label: "Report Branding", description: "Custom logo/watermark on output", availability: "Max", defaultChecked: false },
    { id: "historical_analytics", label: "Historical Analytics", description: "Cross-job metrics, region trends", availability: "Max", defaultChecked: true },
  ];


  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
          <Link href="/workstation?tab=keys">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workstation</span>
            </Button>
          </Link>
          <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
              <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {details.name}
          </h1>
          <Badge variant="secondary" className="font-mono">{params.id}</Badge>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{details.name}</CardTitle>
                    <CardDescription>{details.description}</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/finances">Manage Plan</Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Tiered Capabilities</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Feature</TableHead>
                                    <TableHead>Core</TableHead>
                                    <TableHead>Pro</TableHead>
                                    <TableHead>Elite/MAX</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">Hardware Support</TableCell>
                                    <TableCell>Mobile (Phone/Tablet)</TableCell>
                                    <TableCell>External Cameras, Drones, Borescopes</TableCell>
                                    <TableCell>Unlimited Endpoints, 3rd Party AI Vision</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Key Features</TableCell>
                                    <TableCell>On-device ML, OCR, Geotag</TableCell>
                                    <TableCell>Panorama, Low-light fusion, Multi-cam</TableCell>
                                    <TableCell>Custom Scene Detection, Deep Analytics</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Compute</TableCell>
                                    <TableCell>On-Device (TensorFlow Lite)</TableCell>
                                    <TableCell>Cloud/Edge GPU Offload</TableCell>
                                    <TableCell>Proprietary Models, Tenant Isolation</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>
                    <div className="space-y-4">
                        {featureToggles.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor={feature.id} className="font-medium cursor-pointer">{feature.label}</Label>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-muted-foreground">
                                    {feature.availability.split(', ').map(tier => <Badge key={tier} variant={tier === 'Max' ? 'pro' : 'secondary'} className="mr-1">{tier}</Badge>)}
                                </div>
                                <Switch id={feature.id} defaultChecked={feature.defaultChecked} />
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-4">Role-Based Access Control</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><Crown className="text-primary"/> Admin</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Full management of features, users, and analytics. Can configure tiers and view usage logs.
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Manager / Lead</CardTitle></CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Assign jobs, enable/disable Pro features per user, and generate reports.
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Inspector / Operator</CardTitle></CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Access entitled features only. Can request Pro tools and submit evidence.
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </CardContent>
        </Card>

      </div>
    </div>
  );
}

    