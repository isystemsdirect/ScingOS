
'use client';
import * as THREE from 'three';
import { lariLiDARController, LiDARPoint, LiDARScan } from './lari-lidar-controller';
import { TaskDrivenAISystem } from './task-driven-ai-system';

export interface CameraCalibration {
  intrinsicMatrix: number[][]; // 3x3 camera intrinsic matrix
  distortionCoeffs: number[];  // Distortion coefficients [k1, k2, p1, p2, k3]
  extrinsicMatrix: number[][]; // 4x4 camera to LiDAR transform
  imageSize: { width: number; height: number };
}

export interface LiveFusionData {
  timestamp: number;
  cameraFrame: ImageData | HTMLVideoElement;
  lidarPoints: LiDARPoint[];
  fusedMesh: THREE.Mesh | null;
  detectedObjects: DetectedObject[];
  environmentMetrics: EnvironmentMetrics;
  aiInsights: AIInsight[];
}

export interface DetectedObject {
  id: string;
  type: 'building' | 'vehicle' | 'person' | 'tree' | 'pole' | 'sign' | 'unknown';
  boundingBox3D: {
    center: [number, number, number];
    dimensions: [number, number, number];
    rotation: [number, number, number];
  };
  confidence: number;
  pointCount: number;
  color: [number, number, number];
  velocity?: [number, number, number];
  classification: string;
}

export interface EnvironmentMetrics {
  totalPoints: number;
  scanDensity: number; // points per cubic meter
  coverageArea: number; // square meters
  heightRange: { min: number; max: number };
  surfaceTypes: Record<string, number>;
  visibility: number; // 0-1 score
  weatherConditions: {
    precipitation: number;
    visibility: number;
    temperature?: number;
  };
  motionDetected: boolean;
  noiseLevel: number;
}

export interface AIInsight {
  id: string;
  type: 'observation' | 'prediction' | 'anomaly' | 'recommendation' | 'task_completion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  timestamp: number;
  relatedObjects?: string[];
  suggestedActions?: string[];
  learnedFrom?: string; // What triggered this insight
}

export const lariCameraLiDARFusion = null;
