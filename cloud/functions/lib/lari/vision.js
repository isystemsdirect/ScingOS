"use strict";
/**
 * LARI-Vision: Computer Vision for Inspection Analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDefects = detectDefects;
async function detectDefects(imageUrl) {
    // TODO: Integrate with computer vision API (Google Cloud Vision, custom model)
    console.log(`Analyzing image: ${imageUrl}`);
    // Mock response for demo
    return [
        {
            type: 'crack',
            confidence: 0.87,
            bbox: [100, 200, 150, 250],
            severity: 'moderate',
            description: 'Linear crack detected in foundation, width ~6mm',
        },
    ];
}
//# sourceMappingURL=vision.js.map