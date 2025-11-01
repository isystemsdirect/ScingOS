
'use client';
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ChevronLeft,
  KeyRound,
  Crown,
  Cpu,
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

type CapabilitySpec = {
    name: string;
    description: string;
    tiers: {
        core: string;
        pro: string;
        max: string;
    }[];
    featureToggles: {
        id: string;
        label: string;
        description: string;
        availability: string;
        defaultChecked: boolean;
    }[];
};

const keySpecifications: Record<string, CapabilitySpec> = {
    'LARI-VISION': {
        name: "LARI-VISION",
        description: "Image/Video/CCTV/Drone/Direct Visual",
        tiers: [
            { core: 'Mobile (Phone/Tablet)', pro: 'External Cameras, Drones, Borescopes', max: 'Unlimited Endpoints, 3rd Party AI Vision' },
            { core: 'On-device ML, OCR, Geotag', pro: 'Panorama, Low-light fusion, Multi-cam', max: 'Custom Scene Detection, Deep Analytics' },
            { core: 'TensorFlow Lite, CoreML', pro: 'Cloud/Edge GPU Offload', max: 'Proprietary Models, Tenant Isolation' },
        ],
        featureToggles: [
            { id: "external_camera", label: "External Camera Support", description: "Enable USB/IP/RTSP external feeds", availability: "Pro/Max", defaultChecked: true },
            { id: "ai_defect_overlay", label: "AI Defect Overlay", description: "Live ML markups in HUD", availability: "Core, Pro, Max", defaultChecked: true },
            { id: "panorama_stitch", label: "Panorama Stitch", description: "Automatic multi-photo image join", availability: "Pro/Max", defaultChecked: true },
            { id: "borescope_integration", label: "Borescope Integration", description: "Endoscope device feeds", availability: "Pro/Max", defaultChecked: false },
            { id: "report_branding", label: "Report Branding", description: "Custom logo/watermark on output", availability: "Max", defaultChecked: false },
            { id: "historical_analytics", label: "Historical Analytics", description: "Cross-job metrics, region trends", availability: "Max", defaultChecked: true },
        ]
    },
    'LARI-MAPPER': {
        name: "LARI-MAPPER",
        description: "LiDAR, Laser, 3D, Volumetric",
        tiers: [
            { core: 'On-device LiDAR (Mobile)', pro: 'External LiDAR (Tripod, Drone)', max: 'Multimodal Mapping (LiDAR+Thermal)' },
            { core: 'Distance/Area, Basic Floorplan', pro: 'Volumetrics, Fusion Scan', max: 'Enterprise Volumetrics, 4D Analysis' },
            { core: 'On-Device Processing', pro: 'Cloud Registration & Alignment', max: 'Dedicated High-Compute Instances' },
        ],
        featureToggles: [
            { id: "external_lidar", label: "External LiDAR Support", description: "Integrate tripod, mobile, or drone LiDAR scanners.", availability: "Pro/Max", defaultChecked: true },
            { id: "volumetric_analysis", label: "Volumetric Analysis", description: "Calculate volumes of stockpiles, rooms, etc.", availability: "Pro/Max", defaultChecked: true },
            { id: "point_cloud_export", label: "Point Cloud Export (.LAS, .E57)", description: "Export raw point cloud data.", availability: "Core, Pro, Max", defaultChecked: true },
            { id: "cad_export", label: "CAD/BIM Model Export", description: "Generate and export models for CAD/BIM software.", availability: "Max", defaultChecked: false },
        ]
    },
    'LARI-DOSE': {
        name: "LARI-DOSE",
        description: "DroneOps, Remote, Aerial",
        tiers: [
            { core: 'Basic Drone Imagery (DJI)', pro: 'Full Flight Control, Telemetry Overlays', max: 'Multi-UAV Swarms, RTK GPS' },
            { core: 'Auto Geotag, Photo Telemetry', pro: 'API Integration (DroneDeploy, etc.)', max: 'Real-time Cross-Sector Cloud Mapping' },
            { core: 'Manual Flight', pro: 'Automated Flight Plans', max: 'AI-Powered Autonomous Missions' },
        ],
        featureToggles: [
            { id: "flight_control", label: "In-App Flight Control", description: "Control drone flight directly from the Scingular app.", availability: "Pro/Max", defaultChecked: true },
            { id: "telemetry_overlay", label: "Live Telemetry Overlay", description: "Display live flight data on the video feed.", availability: "Pro/Max", defaultChecked: true },
            { id: "mission_planning", label: "Automated Mission Planning", description: "Create and execute automated flight paths.", availability: "Max", defaultChecked: false },
        ]
    },
    'LARI-PRISM': {
        name: "LARI-PRISM",
        description: "Elemental analysis via spectrometry for hazard detection and compliance.",
        tiers: [
            { core: 'Mobile/Handheld (XRF, basic optical)', pro: 'Multiple sensor workflows (XRF, LIBS)', max: 'Advanced lab sensors (ICP-OES, MS), spatial & visual overlays' },
            { core: 'Basic element toggling & reporting', pro: 'Auto-compliance checks, risk scoring', max: 'Full periodic table control, trace analysis, historical audits' },
            { core: 'On-device analysis', pro: 'Cloud libraries, sensor calibration', max: 'Enterprise dashboards, regulatory feeds, third-party integration' },
        ],
        featureToggles: [
            { id: "element_selector", label: "Periodic Table Element Selector", description: "Dynamically toggle analyzable elements for each job.", availability: "Core, Pro, Max", defaultChecked: true },
            { id: "compliance_reporting", label: "Dynamic Compliance Reports", description: "Auto-generate reports cross-referenced to RoHS, REACH, FDA, EPA standards.", availability: "Pro/Max", defaultChecked: true },
            { id: "calibration_qa", label: "Calibration & QA/QC Routines", description: "Integrated routines using certified reference materials.", availability: "Pro/Max", defaultChecked: false },
            { id: "trace_analysis", label: "Trace Analysis (PPM/PPB)", description: "Enable high-sensitivity detection for ultra-trace elemental analysis.", availability: "Max", defaultChecked: false },
            { id: "chain_of_custody", label: "Secure Chain-of-Custody", description: "Immutable WORM logging for all samples, tests, and results.", availability: "Max", defaultChecked: true },
        ]
    },
    'LARI-ECHO': {
        name: "LARI-ECHO",
        description: "Sonar, Acoustic, Underground, Structure",
        tiers: [
            { core: 'N/A (Add-on Key)', pro: 'Basic Acoustic/Sonar Scan, Void Detection', max: 'Multisensor Fusion (Echo+Mapper)' },
            { core: 'N/A', pro: 'Behind-Wall Object Detection', max: '3D Subsurface Analysis & Visualization' },
            { core: 'N/A', pro: 'Standard GPR Integration', max: 'Advanced Multi-Frequency GPR' },
        ],
        featureToggles: [
            { id: "gpr_integration", label: "Ground Penetrating Radar Integration", description: "Connect and process data from GPR devices.", availability: "Pro/Max", defaultChecked: true },
            { id: "3d_subsurface_viz", label: "3D Subsurface Visualization", description: "Generate 3D models of underground findings.", availability: "Max", defaultChecked: false },
        ]
    },
    'LARI-THERM': {
        name: "LARI-THERM",
        description: "Thermal, Heat Mapping, IR",
        tiers: [
            { core: 'Spot Check (Mobile camera IR)', pro: 'Full Thermal Camera Integration (FLIR, etc.)', max: 'Pro-grade Overlays, Predictive Heat Loss' },
            { core: 'N/A', pro: 'Anomaly Detection & Measurement', max: 'Energy Audit Toolkit, Quantitative Analysis' },
            { core: 'N/A', pro: 'Visual/Thermal Image Pairing', max: 'Time-Lapse Thermal Analysis' },
        ],
        featureToggles: [
            { id: "thermal_camera_integration", label: "Professional Thermal Camera Integration", description: "Connect FLIR, Teledyne, and other thermal cameras.", availability: "Pro/Max", defaultChecked: true },
            { id: "energy_audit_toolkit", label: "Energy Audit Toolkit", description: "Tools for calculating energy loss and R-values.", availability: "Max", defaultChecked: false },
        ]
    },
    'LARI-NOSE': {
        name: "LARI-NOSE",
        description: "Gas, Air Quality, Leak",
        tiers: [
            { core: 'Basic Gas Leak Checks (Pre-selected)', pro: 'Pro Sensor Integration, Real-time Logging', max: 'Multi-gas/Chemical Spectrum, Dashboards' },
            { core: 'N/A', pro: 'Airborne Contaminant Detection', max: 'OSHA/EPA Compliance Reporting' },
            { core: 'N/A', pro: 'Single-Gas Monitoring', max: 'Multi-Gas Spectrum Analysis' },
        ],
        featureToggles: [
            { id: "pro_sensor_integration", label: "Professional Sensor Integration", description: "Connect a wide range of air quality and gas sensors.", availability: "Pro/Max", defaultChecked: true },
            { id: "compliance_dashboards", label: "Compliance Dashboards", description: "Visualize data against OSHA and EPA limits.", availability: "Max", defaultChecked:false },
        ]
    },
    'LARI-GIS': {
        name: "LARI-GIS",
        description: "Geospatial, Satellite, Remote Sensed",
        tiers: [
            { core: 'Google Maps Base, Address Sync', pro: 'Custom Overlays (Zoning, Flood, Seismic)', max: 'Parcel Matching, High-Cadence Satellite Feeds' },
            { core: 'Asset Pinning', pro: 'Google Earth Engine (GEE) Analytics', max: '3D Globe Export, Custom API Integrations' },
            { core: 'Basic Geocoding', pro: 'Reverse Geocoding & Batch Processing', max: 'Live Geospatial Intelligence Feeds' },
        ],
        featureToggles: [
            { id: "custom_overlays", label: "Custom GIS Overlays", description: "Upload and manage your own KML/Shapefile/GeoJSON layers.", availability: "Pro/Max", defaultChecked: true },
            { id: "satellite_feeds", label: "High-Cadence Satellite Feeds", description: "Access near real-time satellite imagery for your zones.", availability: "Max", defaultChecked: false },
        ]
    }
};

const mockKeysData: Record<string, {name: string, lariEngine: string}> = {
    'key_vision_std_abc123': { name: "Standard Vision Key", lariEngine: "LARI-VISION"},
    'key_thermal_std_ghi789': { name: "Standard Thermal Key", lariEngine: "LARI-THERM"},
    'key_audio_std_jkl012': { name: "Standard Audio Key", lariEngine: "LARI-NOSE"}, // Mapped to NOSE for demo
    'key_dose_pro_def456': { name: "Professional Drone Key", lariEngine: "LARI-DOSE"},
    'key_mapper_ent_ghi789': { name: "Enterprise LiDAR Key", lariEngine: "LARI-MAPPER"},
    'key_prism_max_jkl012': { name: "Max Spectrometer Key", lariEngine: "LARI-PRISM"},
    'key_sonar_max_mno345': { name: "Max Sonar Key", lariEngine: "LARI-ECHO"},
    'key_gis_pro_pqr678': { name: "Pro GIS Key", lariEngine: "LARI-GIS" },
};


export default function KeyManagementPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) {
    notFound();
  }
  
  const keyInfo = mockKeysData[params.id];
  const spec = keyInfo ? keySpecifications[keyInfo.lariEngine] : null;

  if (!spec) {
       return (
         <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
            <div className="flex items-center gap-4">
                <Link href="/workstation?tab=keys">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Workstation</span>
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Key Not Found</h1>
            </div>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The details for the key ID "{params.id}" could not be found.</p>
                </CardContent>
            </Card>
         </div>
       )
  }


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
              <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {spec.name}
          </h1>
          <Badge variant="secondary" className="font-mono">{params.id}</Badge>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{spec.name}</CardTitle>
                    <CardDescription>{spec.description}</CardDescription>
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
                                {spec.tiers.map((tier, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-semibold">{['Hardware Support', 'Key Features', 'Compute/Integration'][index]}</TableCell>
                                        <TableCell>{tier.core}</TableCell>
                                        <TableCell>{tier.pro}</TableCell>
                                        <TableCell>{tier.max}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>
                    <div className="space-y-4">
                        {spec.featureToggles.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor={feature.id} className="font-medium cursor-pointer">{feature.label}</Label>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-muted-foreground">
                                    {feature.availability.split('/').map(tier => <Badge key={tier} variant={tier === 'Max' ? 'pro' : 'secondary'} className="mr-1">{tier}</Badge>)}
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

    