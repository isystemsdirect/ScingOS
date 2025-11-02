
'use client';

// This is a mock/placeholder for a real LiDAR controller.
// In a real application, this would interface with the LiDAR hardware SDK.

export interface LiDARPoint {
    x: number;
    y: number;
    z: number;
    intensity: number;
    classification?: number;
    color?: [number, number, number];
}

export interface LiDARScan {
    id: string;
    timestamp: number;
    points: LiDARPoint[];
}

export interface LiDARDevice {
    id: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'scanning' | 'error';
    capabilities: {
        maxRange: number;
        accuracy: number;
        pointsPerSecond: number;
    };
    connection: 'usb' | 'wifi' | 'ethernet';
}

class LARILiDARController {
    private activeScans: LiDARScan[] = [];
    private scanInterval: number | null = null;
    private mockDevices: LiDARDevice[] = [
        { id: 'LIDAR-001', name: 'Velodyne Puck', type: 'rotational_360', status: 'connected', capabilities: { maxRange: 100, accuracy: 0.03, pointsPerSecond: 300000 }, connection: 'ethernet' },
        { id: 'LIDAR-002', name: 'Ouster OS1', type: 'solid_state', status: 'connected', capabilities: { maxRange: 120, accuracy: 0.015, pointsPerSecond: 655360 }, connection: 'ethernet' },
        { id: 'LIDAR-003', name: 'iPhone 15 Pro LiDAR', type: 'mobile_integrated', status: 'disconnected', capabilities: { maxRange: 5, accuracy: 0.05, pointsPerSecond: 50000 }, connection: 'wifi' },
    ];

    constructor() {
        if (typeof window !== 'undefined') {
            this.generateMockScan(); // Start with an initial scan
        }
    }

    public getDevices(): LiDARDevice[] {
        // In a real app, this would discover connected devices
        return this.mockDevices;
    }

    public getActiveScans(): LiDARScan[] {
        return this.activeScans;
    }
    
    public startScanning(): void {
        if (this.scanInterval) return;
        this.scanInterval = window.setInterval(() => {
            this.generateMockScan();
        }, 100); // Generate a new scan every 100ms (10Hz)
    }
    
    public stopScanning(): void {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }

    private generateMockScan(): void {
        const points: LiDARPoint[] = [];
        const numPoints = 5000; // Simulate a decent number of points
        const radius = 20; // 20m radius

        for (let i = 0; i < numPoints; i++) {
            const r = Math.random() * radius;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            points.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi) - 1.5, // simulate ground plane
                intensity: Math.random() * 255,
            });
        }
        
        // Add a simple box object
        for(let i = 0; i < 500; i++) {
            points.push({
                x: 5 + Math.random() * 2,
                y: 5 + Math.random() * 2,
                z: Math.random() * 2 - 1.5,
                intensity: 150 + Math.random() * 50
            })
        }

        const newScan: LiDARScan = {
            id: `scan_${Date.now()}`,
            timestamp: Date.now(),
            points: points
        };
        
        this.activeScans.push(newScan);
        if (this.activeScans.length > 5) {
            this.activeScans.shift(); // Keep only the last 5 scans
        }
    }
}

export const lariLiDARController = new LARILiDARController();
