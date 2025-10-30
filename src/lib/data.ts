import type { Inspection, Inspector, Device, SubscriptionPlan, Client, MarketplaceService, MarketplaceIntegration } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';
const getImageHint = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageHint || '';


export const mockInspections: Inspection[] = [
  {
    id: 'INS-001',
    title: '123 Main St - Structural',
    propertyAddress: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' },
    inspectorId: 'USR-001',
    inspectorName: 'John Doe',
    status: 'Final',
    date: '2023-10-26',
    deviceKeysUsed: ['Key-Drone', 'Key-LiDAR'],
    findingsCount: 3,
    executiveSummary: 'The property at 123 Main St was inspected on October 26, 2023. The overall structure appears sound, with some minor findings noted. The primary concern is a small, non-structural crack in the foundation on the west side of the building. Additionally, the roof inspection revealed some aging shingles that are nearing the end of their service life. All electrical and plumbing systems were found to be in good working order. See the detailed findings section for more information and recommendations.',
    findings: [
      {
        id: 'F-001',
        type: 'Foundation Crack',
        severity: 'Medium',
        confidence: 0.92,
        description: 'A non-structural hairline crack was observed on the western foundation wall.',
        evidence: [{ type: 'image', url: getImageUrl('inspection-foundation'), timestamp: '2023-10-26T10:15:00Z', imageHint: getImageHint('inspection-foundation') }],
        codeReferences: [{ docId: 'ACI 318-19', section: '7.4.1' }],
        inspectorNote: 'Recommend sealing the crack to prevent moisture ingress. Monitor for any changes in size.'
      },
      {
        id: 'F-002',
        type: 'Roof Damage',
        severity: 'Low',
        confidence: 0.88,
        description: 'Asphalt shingles on the south-facing roof slope show significant granule loss.',
        evidence: [{ type: 'image', url: getImageUrl('inspection-roof'), timestamp: '2023-10-26T11:30:00Z', imageHint: getImageHint('inspection-roof') }],
        codeReferences: [{ docId: 'IRC R905.2', section: 'R905.2.1' }],
        inspectorNote: 'Shingles are approaching end of life. Budget for replacement within the next 2-3 years.'
      },
       {
        id: 'F-003',
        type: 'Thermal Anomaly',
        severity: 'Low',
        confidence: 0.95,
        description: 'Thermal imaging indicates a cold spot around the main window in the living room, suggesting an insulation gap.',
        evidence: [{ type: 'image', url: getImageUrl('inspection-thermal'), timestamp: '2023-10-26T11:30:00Z', imageHint: getImageHint('inspection-thermal') }],
        codeReferences: [{ docId: 'IECC 2021', section: 'R402.4.1.1' }],
        inspectorNote: 'Recommend adding insulation or sealing around the window frame to improve energy efficiency.'
      }
    ]
  },
  {
    id: 'INS-002',
    title: '456 Oak Ave - Pre-Purchase',
    propertyAddress: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345' },
    inspectorId: 'USR-002',
    inspectorName: 'Jane Smith',
    status: 'In Progress',
    date: '2023-10-27',
    deviceKeysUsed: ['Key-Thermal', 'Key-VideoHD'],
    findingsCount: 1,
    executiveSummary: 'Inspection is currently in progress. Initial findings indicate potential issues with the electrical panel. Further investigation is required.',
    findings: [
      {
        id: 'F-004',
        type: 'Electrical Panel Issue',
        severity: 'High',
        confidence: 0.98,
        description: 'The main electrical panel shows signs of overheating on two breakers.',
        evidence: [{ type: 'image', url: getImageUrl('inspection-electrical'), timestamp: '2023-10-27T09:45:00Z', imageHint: getImageHint('inspection-electrical') }],
        codeReferences: [{ docId: 'NEC 2020', section: '240.87' }],
        inspectorNote: 'Immediate attention from a qualified electrician is required. Breakers may be overloaded or faulty.'
      }
    ]
  },
  {
    id: 'INS-003',
    title: '789 Pine Ln - Annual Checkup',
    propertyAddress: { street: '789 Pine Ln', city: 'Someville', state: 'TX', zip: '67890' },
    inspectorId: 'USR-001',
    inspectorName: 'John Doe',
    status: 'Draft',
    date: '2023-10-28',
    deviceKeysUsed: [],
    findingsCount: 0,
    executiveSummary: 'Report is in draft status.',
    findings: []
  }
];

export const mockInspectors: Inspector[] = [
  { 
    id: 'USR-001', 
    name: 'John Doe', 
    avatarUrl: getImageUrl('avatar1'), 
    imageHint: getImageHint('avatar1'), 
    bio: "With over 15 years of experience in residential and commercial inspections, I specialize in structural assessments and thermal imaging. My goal is to provide clients with a thorough and unbiased evaluation of their property. I'm a certified InterNACHI inspector and a licensed drone pilot.",
    rating: 4.9, 
    reviews: 124, 
    certifications: [
      { name: 'InterNACHI Certified Professional Inspector', id: 'NACHI230101', certifyingBody: 'InterNACHI', expiresAt: '2025-01-01', verified: true },
      { name: 'Licensed Drone Pilot (Part 107)', id: 'FA3LCE123', certifyingBody: 'Federal Aviation Administration', expiresAt: '2024-06-15', verified: true },
      { name: 'Level II Thermographer', id: 'ITC-456B', certifyingBody: 'Infrared Training Center', expiresAt: '2026-11-30', verified: false },
    ], 
    offeredServices: [
        "General property condition assessment (PCA)",
        "Residential home inspection (buyer)",
        "Roof condition survey (low-slope/steep)",
        "Moisture intrusion/basement foundation survey",
        "HVAC functional performance testing",
        "Envelope thermal imaging survey"
    ],
    location: { name: 'Anytown, CA', lat: 34.0522, lng: -118.2437 }, 
    onCall: true 
  },
  { 
    id: 'USR-002', 
    name: 'Jane Smith', 
    avatarUrl: getImageUrl('avatar2'), 
    imageHint: getImageHint('avatar2'), 
    bio: "I am a CCPIA certified commercial property inspector with a focus on large-scale projects and LiDAR scanning. I provide detailed 3D models and data analysis for developers and property managers.",
    rating: 4.8, 
    reviews: 98, 
    certifications: [
        { name: 'Commercial Property Inspector', id: 'CCPIA-789', certifyingBody: 'CCPIA', expiresAt: '2025-03-20', verified: true },
        { name: 'LiDAR Scanning Professional', id: 'LSP-2023-XYZ', certifyingBody: 'National Geodetic Survey', expiresAt: '2024-12-01', verified: false },
    ], 
    offeredServices: [
        "Commercial building inspection (office/retail/industrial)",
        "Boundary & topographic survey (with utility locates)",
        "Phase I environmental site assessment (ESA)"
    ],
    location: { name: 'Anytown, CA', lat: 34.055, lng: -118.25 },
    onCall: false 
  },
  { 
    id: 'USR-003', 
    name: 'Mike Johnson', 
    avatarUrl: getImageUrl('avatar3'), 
    imageHint: getImageHint('avatar3'), 
    bio: "As a Certified Master Inspector and a former commercial diver, I have a unique skill set for inspecting underwater structures, bridges, and other marine infrastructure.",
    rating: 4.9, 
    reviews: 210, 
    certifications: [
        { name: 'Certified Master Inspector', id: 'CMI-001', certifyingBody: 'InterNACHI', expiresAt: '2025-01-01', verified: true },
        { name: 'Commercial Diving Supervisor', id: 'ADS-1234', certifyingBody: 'Association of Diving Contractors', expiresAt: '2024-08-01', verified: true },
    ], 
    offeredServices: [
        "Water loss/leak origin & mapping",
        "Storm/hail/wind damage assessment",
        "Settlement/structural movement monitoring"
    ],
    location: { name: 'Someville, TX', lat: 30.2672, lng: -97.7431 },
    onCall: true 
  },
  { 
    id: 'USR-004', 
    name: 'Emily White', 
    avatarUrl: getImageUrl('avatar4'), 
    imageHint: getImageHint('avatar4'), 
    bio: "My expertise is in materials science and analysis. I use advanced spectrometry to detect and identify potential issues with building materials, from asbestos to Chinese drywall.",
    rating: 5.0, 
    reviews: 75, 
    certifications: [
        { name: 'Spectrometer Analyst', id: 'SPEC-987', certifyingBody: 'Coblentz Society', expiresAt: '2025-07-22', verified: false },
    ], 
    offeredServices: [
        "Asbestos survey (pre-reno/demo) & clearance",
        "Lead-based paint (LBP) inspection/risk assessment",
        "Indoor air quality (IAQ) testing"
    ],
    location: { name: 'Anytown, CA', lat: 34.05, lng: -118.24 }, 
    onCall: true 
  },
];

export const mockDevices: Device[] = [
  { id: 'DEV-001', name: 'DJI Mavic 3 Enterprise', type: 'Key-Drone', status: 'Connected', lastSeen: '2023-10-27 10:00 AM', firmwareVersion: 'v2.1.3' },
  { id: 'DEV-002', name: 'FLIR E8-XT', type: 'Key-Thermal', status: 'Connected', lastSeen: '2023-10-27 09:30 AM', firmwareVersion: 'v1.8.0' },
  { id: 'DEV-003', name: 'Ouster OS1', type: 'Key-LiDAR', status: 'Disconnected', lastSeen: '2023-10-25 02:00 PM', firmwareVersion: 'v3.0.1' },
  { id: 'DEV-004', name: 'U-PHORIA UMC202HD', type: 'Key-Audio', status: 'Error', lastSeen: '2023-10-27 11:00 AM', firmwareVersion: 'v1.12' },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Free",
    price: "$0",
    pricePeriod: "/ month (7-day trial)",
    features: [
      "1 inspector",
      "Basic PDF reports",
      "5 GB storage",
      "1 Device Key"
    ],
    cta: "Start Trial"
  },
  {
    name: "Basic",
    price: "$29",
    pricePeriod: "/ month",
    features: [
      "Up to 2 inspectors",
      "Standard PDF reports",
      "50 GB storage",
      "Google Maps overlays",
      "Scheduling features",
      "2 Device Keys"
    ],
    cta: "Subscribe"
  },
  {
    name: "Pro",
    price: "$199",
    pricePeriod: "/ month",
    isCurrent: true,
    features: [
      "Up to 5 inspectors",
      "Advanced device support (Drones, LiDAR)",
      "500 GB storage",
      "API Access",
      "Dispatch list priority",
      "Model-run credits"
    ],
    cta: "Current Plan"
  },
  {
    name: "Enterprise",
    price: "Custom",
    pricePeriod: "",
    features: [
      "Custom inspector numbers",
      "Dedicated instance option",
      "99.9% Uptime SLA",
      "SSO & advanced security",
      "Legal/compliance features",
      "Priority support"
    ],
    cta: "Contact Sales"
  },
];


export const mockClients: Client[] = [
    {
        id: "CLI-001",
        name: "Stark Industries",
        email: "contact@stark.com",
        phone: "212-555-0100",
        address: {
            street: "10880 Malibu Point",
            city: "Malibu",
            state: "CA",
            zip: "90265"
        },
        location: { lat: 34.033, lng: -118.805 },
        createdAt: "2023-01-15T00:00:00Z"
    },
    {
        id: "CLI-002",
        name: "Wayne Enterprises",
        email: "info@wayne-ent.com",
        phone: "212-555-0199",
        address: {
            street: "1007 Mountain Drive",
            city: "Gotham City",
            state: "NJ",
            zip: "07001"
        },
        location: { lat: 40.7128, lng: -74.0060 },
        createdAt: "2023-02-20T00:00:00Z"
    },
    {
        id: "CLI-003",
        name: "Cyberdyne Systems",
        email: "hr@cyberdyne.com",
        phone: "408-555-0155",
        address: {
            street: "18144 El Camino Real",
            city: "Sunnyvale",
            state: "CA",
            zip: "94087"
        },
        location: { lat: 37.3688, lng: -122.0363 },
        createdAt: "2023-05-10T00:00:00Z"
    }
];

export const mockMarketplaceServices: MarketplaceService[] = [
    {
        id: "SERV-001",
        name: "Phase I Environmental Site Assessment (ESA)",
        description: "A comprehensive report to identify potential or existing environmental contamination liabilities.",
        price: "$1,500 - $3,000",
        provider: "EcoAssess Inc."
    },
    {
        id: "SERV-002",
        name: "Forensic Leak & Moisture Mapping",
        description: "Advanced diagnostics to find the origin of water intrusion using thermal and acoustic methods.",
        price: "$750",
        provider: "Dry-Tec Diagnostics"
    },
    {
        id: "SERV-003",
        name: "Structural Engineer Review & Stamp",
        description: "Have a licensed Structural Engineer review your findings and provide a stamped letter.",
        price: "Starts at $500",
        provider: "Structural Integrity Group"
    },
];

export const mockMarketplaceIntegrations: MarketplaceIntegration[] = [
    {
        id: "INT-001",
        name: "Matterport 3D Tour Key",
        description: "Integrate Matterport's 3D scanning capabilities directly into your inspection workflow.",
        price: "$49/month",
        vendor: "Matterport"
    },
    {
        id: "INT-002",
        name: "Bluebeam Project Sync Key",
        description: "Automatically sync your findings and reports with Bluebeam Projects for seamless collaboration.",
        price: "$29/month",
        vendor: "Bluebeam"
    },
    {
        id: "INT-003",
        name: "AutoCAD Floorplan Generation Key",
        description: "Use your LARI-MAPPER LiDAR scans to automatically generate AutoCAD-compatible floorplans.",
        price: "$99/month",
        vendor: "CADify"
    },
];