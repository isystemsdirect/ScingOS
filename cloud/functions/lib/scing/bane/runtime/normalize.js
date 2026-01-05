"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeForDetection = normalizeForDetection;
function normalizeForDetection(input) {
    const text = input.text ?? '';
    const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
    return {
        original: input,
        forDetection: {
            ...input,
            // detectors use normalized text; redactions apply to original
            text: normalized,
        },
    };
}
//# sourceMappingURL=normalize.js.map