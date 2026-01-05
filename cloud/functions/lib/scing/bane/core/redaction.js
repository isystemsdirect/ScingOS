"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSpans = mergeSpans;
exports.applyRedactions = applyRedactions;
function mergeSpans(spans) {
    const s = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
    const out = [];
    for (const cur of s) {
        const prev = out[out.length - 1];
        if (!prev || cur.start > prev.end) {
            out.push({ ...cur });
        }
        else {
            prev.end = Math.max(prev.end, cur.end);
            prev.label = prev.label || cur.label;
        }
    }
    return out;
}
function applyRedactions(text, spans) {
    if (!spans.length)
        return text;
    const merged = mergeSpans(spans);
    let out = '';
    let last = 0;
    for (const sp of merged) {
        out += text.slice(last, sp.start);
        out += `[REDACTED:${sp.label}]`;
        last = sp.end;
    }
    out += text.slice(last);
    return out;
}
//# sourceMappingURL=redaction.js.map