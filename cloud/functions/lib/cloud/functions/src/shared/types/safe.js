"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecord = isRecord;
exports.getRecord = getRecord;
exports.asString = asString;
exports.asNumber = asNumber;
exports.asBoolean = asBoolean;
function isRecord(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function getRecord(v, ctx = 'value') {
    if (!isRecord(v))
        throw new Error(`${ctx} must be an object`);
    return v;
}
function asString(v, fallback = '') {
    return typeof v === 'string' ? v : fallback;
}
function asNumber(v, fallback = 0) {
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
function asBoolean(v, fallback = false) {
    return typeof v === 'boolean' ? v : fallback;
}
//# sourceMappingURL=safe.js.map