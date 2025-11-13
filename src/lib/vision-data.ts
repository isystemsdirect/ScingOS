
export type VisionAnalysisOptions = {
    detectCracks: boolean;
    detectCorrosion: boolean;
    detectSpalling: boolean;
    ocr: boolean;
    showConfidence: boolean;
};

export type VisionFinding = {
    id: string;
    type: 'Crack' | 'Corrosion' | 'Spalling' | 'Text';
    description: string;
    confidence: number;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    boundingBox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
};

const baseFindings: Omit<VisionFinding, 'id' | 'confidence'>[] = [
    {
        type: 'Crack',
        description: 'Hairline crack detected on surface.',
        severity: 'Medium',
        boundingBox: { x1: 20, y1: 30, x2: 60, y2: 35 },
    },
    {
        type: 'Corrosion',
        description: 'Minor surface corrosion identified.',
        severity: 'Low',
        boundingBox: { x1: 75, y1: 50, x2: 85, y2: 65 },
    },
    {
        type: 'Spalling',
        description: 'Small area of concrete spalling.',
        severity: 'High',
        boundingBox: { x1: 10, y1: 70, x2: 30, y2: 85 },
    },
    {
        type: 'Text',
        description: 'Serial Number: A5B-123-XYZ',
        severity: 'Low',
        boundingBox: { x1: 40, y1: 5, x2: 70, y2: 15 },
    },
];

export function mockVisionAnalysis(options: VisionAnalysisOptions): VisionFinding[] {
    const results: VisionFinding[] = [];

    if (options.detectCracks) {
        const finding = baseFindings.find(f => f.type === 'Crack');
        if (finding) {
            results.push({ ...finding, id: 'finding-1', confidence: Math.random() * 0.15 + 0.8 });
        }
    }
    if (options.detectCorrosion) {
        const finding = baseFindings.find(f => f.type === 'Corrosion');
        if (finding) {
            results.push({ ...finding, id: 'finding-2', confidence: Math.random() * 0.2 + 0.75 });
        }
    }
    if (options.detectSpalling) {
        const finding = baseFindings.find(f => f.type === 'Spalling');
        if (finding) {
            results.push({ ...finding, id: 'finding-3', confidence: Math.random() * 0.1 + 0.88 });
        }
    }
    if (options.ocr) {
        const finding = baseFindings.find(f => f.type === 'Text');
        if (finding) {
            results.push({ ...finding, id: 'finding-4', confidence: Math.random() * 0.05 + 0.94 });
        }
    }

    return results;
}
