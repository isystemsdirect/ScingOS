
export type InspectionStatus = "Draft" | "In Progress" | "Inspector Approved" | "Client Approved" | "Final";
export type DeviceKey = "Key-Drone" | "Key-LiDAR" | "Key-Thermal" | "Key-Spectrometer" | "Key-Sonar" | "Key-VideoHD" | "Key-Audio" | "Key-GPS";
export type NotificationType = "post" | "topic" | "weather" | "safety" | "traffic" | "weather_news";


export type Finding = {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  evidence: { type: 'image' | 'video' | 'lidar'; url: string; timestamp: string, imageHint: string }[];
  codeReferences: { docId: string; section: string }[];
  description: string;
  inspectorNote: string;
};

export type Inspection = {
  id: string;
  title: string;
  propertyAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  inspectorId: string;
  inspectorName: string;
  status: InspectionStatus;
  date: string;
  deviceKeysUsed: DeviceKey[];
  findingsCount: number;
  findings: Finding[];
  executiveSummary: string;
};

export type Certification = {
  name: string;
  id: string;
  certifyingBody: string;
  expiresAt: string;
  verified: boolean;
};

export type Location = {
    name: string;
    lat: number;
    lng: number;
}

export type Inspector = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  imageHint: string;
  bio: string;
  rating: number;
  reviews: number;
  certifications: Certification[];
  offeredServices: string[];
  location: Location;
  onCall: boolean;
};

export type Device = {
  id: string;
  name: string;
  type: DeviceKey;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSeen: string;
  firmwareVersion: string;
};

export type SubscriptionPlan = {
  name: "Individual Inspector" | "Small Business" | "Enterprise" | "Gov/Enterprise MAX";
  price: string;
  pricePeriod: string;
  features: string[];
  isCurrent?: boolean;
  cta: string;
};

export type TelemetryEvent = {
  keyId: string;
  deviceId: string;
  inspectionId?: string;
  timestampUtc: string;
  location?: {
    lat: number;
    lng: number;
    alt?: number;
  };
  payloadType:
    | 'lidar_pointcloud'
    | 'video_chunk'
    | 'image'
    | 'spectra'
    | 'sonar_ping'
    | 'thermal_frame'
    | 'audio_chunk';
  payloadRef?: string;
  metadata?: Record<string, any>;
};

export type Client = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    location: {
        lat: number;
        lng: number;
    }
    createdAt: string;
};

export type MarketplaceService = {
  id: string;
  name: string;
  description: string;
  price: string;
  provider: string;
};

export type MarketplaceIntegration = {
  id: string;
  name: string;
  description: string;
  price: string;
  vendor: string;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  memberCount: number;
  members: Inspector[];
  docs: { id: string, name: string, type: string, lastUpdated: string }[];
  adminActions: { id: string, admin: string, action: string, timestamp: string }[];
};

export type ConferenceRoom = {
    id: string;
    name: string;
    description: string;
    privacy: 'public' | 'private';
    scheduledTime: string;
    status: 'Live' | 'Scheduled' | 'Completed';
    participants: Inspector[];
}
