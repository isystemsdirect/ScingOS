"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSimpleHtml = renderSimpleHtml;
exports.bundleHash = bundleHash;
const evidenceHash_1 = require("../evidence/evidenceHash");
const reportDeterminism_1 = require("./reportDeterminism");
function renderSimpleHtml(report) {
    const esc = (s) => String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const r = report;
    const sections = (r.sections ?? [])
        .map((b) => `<h2>${esc(b.title)}</h2><pre>${esc(JSON.stringify(b.content, null, 2))}</pre>`)
        .join('\n');
    const title = r.sections?.[0]?.content?.title ??
        'Inspection Report';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title></head><body><h1>${esc(title)}</h1>${sections}</body></html>`;
}
function bundleHash(bundle) {
    return (0, evidenceHash_1.sha256Hex)((0, reportDeterminism_1.stableJsonDeep)(bundle));
}
//# sourceMappingURL=reportExportBundle.js.map