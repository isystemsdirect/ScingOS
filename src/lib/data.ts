

import type { Inspection, Inspector, Device, SubscriptionPlan, Client, MarketplaceService, MarketplaceIntegration, Team, ConferenceRoom, Job, Notification } from './types';
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
    role: 'Admin',
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
    role: 'Lead Inspector',
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
    role: 'Certified Welding Inspector (CWI)',
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
    role: 'Quality Technician',
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
  { id: 'DEV-001', name: 'Skydio X2', type: 'Key-Drone', status: 'Connected', lastSeen: '2023-10-27 10:00 AM', firmwareVersion: 'v2.1.3' },
  { id: 'DEV-005', name: 'Red Cat Teal 2', type: 'Key-Drone', status: 'Connected', lastSeen: '2023-10-27 10:05 AM', firmwareVersion: 'v1.9.8' },
  { id: 'DEV-002', name: 'FLIR E8-XT', type: 'Key-Thermal', status: 'Connected', lastSeen: '2023-10-27 09:30 AM', firmwareVersion: 'v1.8.0' },
  { id: 'DEV-003', name: 'Ouster OS1', type: 'Key-LiDAR', status: 'Disconnected', lastSeen: '2023-10-25 02:00 PM', firmwareVersion: 'v3.0.1' },
  { id: 'DEV-004', name: 'U-PHORIA UMC202HD', type: 'Key-Audio', status: 'Error', lastSeen: '2023-10-27 11:00 AM', firmwareVersion: 'v1.12' },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Individual Inspector",
    price: "$49",
    pricePeriod: "/ month",
    features: [
      "Basic AI inspection tools",
      "Compliance references",
      "Marketplace Listing Add-on ($25/mo)"
    ],
    cta: "Select Plan"
  },
  {
    name: "Small Business",
    price: "$149",
    pricePeriod: "/ month",
    isCurrent: true,
    features: [
      "Up to 5 inspectors",
      "Shared dashboards",
      "Marketplace Listing Included",
      "Basic API Access",
    ],
    cta: "Current Plan"
  },
  {
    name: "Enterprise",
    price: "$399",
    pricePeriod: "/ month",
    features: [
      "Up to 20 inspectors",
      "Advanced AI Analytics",
      "CRM Integration",
      "Priority Support"
    ],
    cta: "Contact Sales"
  },
  {
    name: "Gov/Enterprise MAX",
    price: "$999",
    pricePeriod: "/mo",
    features: [
      "Unlimited users",
      "Full compliance library",
      "On-premise options",
      "Dedicated AI models",
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

export const mockNotifications: Notification[] = [
    { id: 1, type: 'post' as const, title: "Jane Smith posted in #foundation-cracks", description: "Unusual Efflorescence Pattern on a Poured Concrete Wall?" },
    { id: 2, type: 'topic' as const, title: "#thermal-imaging is trending", description: "Join the conversation on interpreting thermal data." },
    { id: 3, type: 'weather' as const, title: "Weather Update: Los Angeles, CA", description: "Clear skies, 75°F. Ideal conditions for outdoor and drone inspections." },
    { id: 4, type: 'safety' as const, title: "High Wind Warning", description: "Winds gusting up to 45 mph. Use caution with drones." },
    { id: 5, type: 'traffic' as const, title: "I-405 Closure", description: "Northbound I-405 closed at Sunset Blvd due to accident. Expect major delays." },
    { id: 6, type: 'weather_news' as const, title: "National Weather News", description: "Tropical Storm 'Arthur' expected to make landfall in Florida late Thursday." },
];

export const mockNews = [
    {
        id: 1,
        title: "US House passes bill to ban DJI drones",
        source: "Reuters",
        time: "4h ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news-dji/150/150",
        imageHint: "drone sky"
    },
    {
        id: 2,
        title: "New AI model can detect structural flaws from photos",
        source: "TechCrunch",
        time: "12h ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news-ai/150/150",
        imageHint: "AI abstract"
    },
    {
        id: 3,
        title: "Updated building codes for 2024 released",
        source: "Construction Weekly",
        time: "1d ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news-codes/150/150",
        imageHint: "building blueprint"
    },
    {
        id: 4,
        title: "The impact of rising material costs on inspections",
        source: "The Inspector",
        time: "2d ago",
        url: "#",
        imageUrl: "https://picsum.photos/seed/news-materials/150/150",
        imageHint: "construction materials"
    }
];

export const mockTeamsData: Record<string, Team> = {
    'team-doe-inspections': {
        id: 'team-doe-inspections',
        name: 'Doe Inspections LLC',
        description: 'Primary residential and commercial inspection team.',
        privacy: 'private',
        memberCount: 4,
        members: mockInspectors.slice(0, 4),
        docs: [
            { id: 'doc-1', name: 'Residential Inspection Checklist v2.3.pdf', type: 'pdf', lastUpdated: '2023-11-02' },
            { id: 'doc-2', name: 'Commercial HVAC Inspection Guide.docx', type: 'doc', lastUpdated: '2023-10-15' },
        ],
        adminActions: [
            { id: 'log-1', admin: 'John Doe', action: 'Updated member role for Jane Smith to "Lead Inspector".', timestamp: '2023-11-03 10:05 AM' },
        ]
    },
    'team-special-projects': {
        id: 'team-special-projects',
        name: 'Special Projects Unit',
        description: 'Focused on large-scale industrial and infrastructure projects.',
        privacy: 'public',
        memberCount: 2,
        members: [mockInspectors[2], mockInspectors[3]],
        docs: [
            { id: 'doc-3', name: 'Bridge Inspection Protocol (DOT-77B).pdf', type: 'pdf', lastUpdated: '2023-09-01' },
        ],
        adminActions: []
    },
};

export const mockConferenceRooms: ConferenceRoom[] = [
    {
        id: 'conf-q4-planning',
        name: 'Q4 Executive Planning',
        description: 'Review of Q3 performance and strategic planning for Q4.',
        type: 'conference',
        privacy: 'private',
        scheduledTime: '2023-10-28T14:00:00Z',
        status: 'Live',
        participants: [mockInspectors[0], mockInspectors[1], mockInspectors[2]]
    },
    {
        id: 'conf-project-alpha-debrief',
        name: 'Project Alpha Debrief',
        description: 'Post-mortem and final report review for Project Alpha.',
        type: 'conference',
        privacy: 'private',
        scheduledTime: '2023-10-29T10:00:00Z',
        status: 'Scheduled',
        participants: [mockInspectors[1], mockInspectors[2], mockInspectors[3]]
    },
    {
        id: 'conf-new-tech-demo',
        name: 'Public Tech Demo',
        description: 'Demonstration of the LARI-PRISM spectrometer capabilities.',
        type: 'conference',
        privacy: 'public',
        scheduledTime: '2023-11-01T11:00:00Z',
        status: 'Scheduled',
        participants: mockInspectors.slice(0, 5)
    },
    {
        id: 'meet-client-intake-stark',
        name: 'Client Intake: Stark Industries',
        description: 'Initial project scoping meeting for the Malibu property.',
        type: 'meeting',
        privacy: 'private',
        scheduledTime: '2023-11-02T09:00:00Z',
        status: 'Scheduled',
        participants: [mockInspectors[0], mockInspectors[1]] // Assume client joins as guest
    },
     {
        id: 'meet-daily-standup',
        name: 'Daily Standup',
        description: 'Quick sync on daily tasks and blockers.',
        type: 'meeting',
        privacy: 'private',
        scheduledTime: '2023-11-03T08:30:00Z',
        status: 'Completed',
        participants: mockInspectors.slice(0, 4)
    }
];


export const mockJobs: Job[] = [
    {
        id: 'JOB-001',
        clientId: 'CLI-001',
        type: 'Envelope thermal imaging survey',
        address: '10880 Malibu Point, Malibu, CA',
        location: { lat: 34.033, lng: -118.805 },
        priority: 'High',
        requestTime: '2h ago',
        status: 'Unassigned',
    },
    {
        id: 'JOB-002',
        clientId: 'CLI-003',
        type: 'Phase I environmental site assessment (ESA)',
        address: '18144 El Camino Real, Sunnyvale, CA',
        location: { lat: 37.3688, lng: -122.0363 },
        priority: 'Medium',
        requestTime: '8h ago',
        status: 'Unassigned',
    },
     {
        id: 'JOB-003',
        clientId: 'CLI-002',
        type: 'Roof condition survey (low-slope/steep)',
        address: '1007 Mountain Drive, Gotham City, NJ',
        location: { lat: 40.7128, lng: -74.0060 },
        priority: 'Low',
        requestTime: '1d ago',
        status: 'Unassigned',
    },
    {
        id: 'JOB-004',
        clientId: 'CLI-001',
        type: 'Structural movement monitoring',
        address: '10880 Malibu Point, Malibu, CA',
        location: { lat: 34.033, lng: -118.805 },
        priority: 'High',
        requestTime: '1h ago',
        status: 'In Progress',
        assignedInspectorId: 'USR-001',
    },
    {
        id: 'JOB-005',
        clientId: 'CLI-002',
        type: 'Commercial building inspection (office/retail/industrial)',
        address: '1007 Mountain Drive, Gotham City, NJ',
        location: { lat: 40.7128, lng: -74.0060 },
        priority: 'Medium',
        requestTime: '3h ago',
        status: 'Assigned',
        assignedInspectorId: 'USR-003',
    },
    {
        id: 'JOB-006',
        clientId: 'CLI-003',
        type: 'Water loss/leak origin & mapping',
        address: '18144 El Camino Real, Sunnyvale, CA',
        location: { lat: 37.3688, lng: -122.0363 },
        priority: 'Medium',
        requestTime: '5h ago',
        status: 'In Progress',
        assignedInspectorId: 'USR-002',
    },
    {
        id: 'JOB-007',
        clientId: 'CLI-001',
        type: 'Annual general building inspection',
        address: '10880 Malibu Point, Malibu, CA',
        location: { lat: 34.033, lng: -118.805 },
        priority: 'Low',
        requestTime: '1d ago',
        status: 'In Progress',
        assignedInspectorId: 'USR-004',
    },
    {
        id: 'JOB-008',
        clientId: 'CLI-002',
        type: 'Storm/hail/wind damage assessment',
        address: '1007 Mountain Drive, Gotham City, NJ',
        location: { lat: 40.7128, lng: -74.0060 },
        priority: 'High',
        requestTime: '45m ago',
        status: 'Assigned',
        assignedInspectorId: 'USR-001',
    }
];

export const mockAnnouncements = [
    {
        id: 'AN-001',
        title: 'New LARI-PRISM Key Available',
        content: 'Unlock advanced materials analysis with the new LARI-PRISM spectrometer key, now available in the Marketplace.',
        date: '2023-11-05',
        read: false
    },
    {
        id: 'AN-002',
        title: 'System Maintenance Scheduled',
        content: 'Scheduled maintenance will occur on Nov 10th from 2-4 AM EST. Expect brief interruptions.',
        date: '2023-11-04',
        read: false
    },
    {
        id: 'AN-003',
        title: 'Updated Drone Compliance Guide',
        content: 'The FAA compliance guide in the Standards Library has been updated with the latest regulations.',
        date: '2023-11-02',
        read: true
    }
]
