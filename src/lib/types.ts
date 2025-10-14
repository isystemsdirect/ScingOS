export type InspectionStatus = "Draft" | "In Progress" | "Inspector Approved" | "Client Approved" | "Final";
export type DeviceKey = "Key-Drone" | "Key-LiDAR" | "Key-Thermal" | "Key-Spectrometer" | "Key-Sonar" | "Key-VideoHD" | "Key-Audio" | "Key-GPS";

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

export type Inspector = {
  id: string;
  name: string;
  avatarUrl: string;
  imageHint: string;
  rating: number;
  reviews: number;
  certifications: Certification[];
  location: string;
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
  name: "Free" | "Basic" | "Pro" | "Enterprise" | "Enterprise MAX";
  price: string;
  pricePeriod: string;
  features: string[];
  isCurrent?: boolean;
  cta: string;
};
