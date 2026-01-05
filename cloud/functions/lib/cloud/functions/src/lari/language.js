"use strict";
/**
 * LARI-Language: Natural Language Understanding
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.understandIntent = understandIntent;
async function understandIntent(text) {
    // TODO: Integrate with OpenAI or custom NLU model
    // Simple pattern matching for demo
    const lowerText = text.toLowerCase();
    if (lowerText.includes('start') && lowerText.includes('inspection')) {
        return {
            action: 'start_inspection',
            entities: {
                inspection_type: extractInspectionType(lowerText),
            },
            confidence: 0.85,
        };
    }
    if (lowerText.includes('capture') || lowerText.includes('photo')) {
        return {
            action: 'capture_photo',
            entities: {},
            confidence: 0.9,
        };
    }
    if (lowerText.includes('code') || lowerText.includes('regulation')) {
        return {
            action: 'lookup_code',
            entities: {
                query: text,
            },
            confidence: 0.75,
        };
    }
    return {
        action: 'unknown',
        entities: {},
        confidence: 0.3,
    };
}
function extractInspectionType(text) {
    const types = ['roofing', 'electrical', 'plumbing', 'structural'];
    for (const type of types) {
        if (text.includes(type)) {
            return type;
        }
    }
    return 'general';
}
//# sourceMappingURL=language.js.map