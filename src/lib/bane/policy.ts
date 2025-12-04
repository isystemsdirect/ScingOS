// policy.ts
import type { DevicePosture, UserRole } from './context';

export interface DomainRule {
  domain: string;
  methods: string[];
}

export interface FilePathRule {
  prefix: string;           // e.g. "reports/"
  operations: Array<'read' | 'write' | 'append'>;
}

export interface SensorRule {
  sensor: 'camera' | 'lidar';
  allowedPostures: DevicePosture[];
}

export interface PolicyBundle {
  id: string;
  version: string;
  roles: UserRole[];
  allowlistedDomains: DomainRule[];
  filePaths: FilePathRule[];
  sensors: SensorRule[];
  demonMode: boolean;
  updatedAt: string;
}
