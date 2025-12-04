// adapters.ts
import type { Context } from './context';
import type { Decision } from './decision';
import fs from 'fs/promises';

export interface NetworkAdapter {
  call<T>(url: string, context: Context, decision: Decision): Promise<T>;
}

export interface CameraAdapter {
  capture<T>(settings: string, context: Context, decision: Decision): Promise<T>;
}

export interface FileAdapter {
  handle<T>(pathAndOp: string, context: Context, decision: Decision): Promise<T>;
}

export interface LidarAdapter {
  scan<T>(resolution: string, context: Context, decision: Decision): Promise<T>;
}

export interface Adapters {
  network: NetworkAdapter;
  camera: CameraAdapter;
  file: FileAdapter;
  lidar: LidarAdapter;
}

// Minimal implementations
export const DefaultAdapters: Adapters = {
  network: {
    async call<T>(url, _context, _decision) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      return (await res.json()) as T;
    },
  },
  camera: {
    async capture<T>(_settings, _context, _decision) {
      // Integrate with real camera here
      return { imageId: 'stub-image-id' } as unknown as T;
    },
  },
  file: {
    async handle<T>(pathAndOp, _context, _decision) {
      const [op, path] = pathAndOp.split(':');
      if (op === 'write') {
        await fs.writeFile(path, '');
        return { path } as unknown as T;
      }
      if (op === 'read') {
        const content = await fs.readFile(path, 'utf8');
        return { path, content } as unknown as T;
      }
      throw new Error(`Unsupported file op: ${op}`);
    },
  },
  lidar: {
    async scan<T>(_resolution, _context, _decision) {
      // Integrate with real LiDAR here
      return { pointCloudId: 'stub-pc-id' } as unknown as T;
    },
  },
};
