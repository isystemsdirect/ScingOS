"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeNotifyGitHubOnCritical = maybeNotifyGitHubOnCritical;
const functions = __importStar(require("firebase-functions"));
// OPTIONAL: open a GitHub Issue on critical errors.
// Requires functions config:
// - obs.github_repo (e.g. "isystemsdirect/ScingOS")
// - obs.github_token (PAT with repo:issues scope)
// Never commit the token.
async function maybeNotifyGitHubOnCritical(evt) {
    try {
        const repo = functions.config?.()?.obs?.github_repo;
        const token = functions.config?.()?.obs?.github_token;
        if (!repo || !token)
            return { ok: false, skipped: true, reason: 'NO_GITHUB_CONFIG' };
        if (evt?.severity !== 'critical')
            return { ok: false, skipped: true, reason: 'NOT_CRITICAL' };
        const [owner, name] = String(repo).split('/');
        const title = `[SCINGULAR] Critical: ${evt.scope} — ${String(evt.message).slice(0, 80)}`;
        const body = [
            `Severity: ${evt.severity}`,
            `Scope: ${evt.scope}`,
            `Correlation: ${evt.correlationId}`,
            evt.inspectionId ? `Inspection: ${evt.inspectionId}` : '',
            evt.engineId ? `Engine: ${evt.engineId}` : '',
            evt.phase ? `Phase: ${evt.phase}` : '',
            '',
            'Message:',
            evt.message,
            '',
            'Error:',
            evt.errorName ?? '(none)',
            '',
            'Stack (truncated):',
            (evt.errorStack ?? '').slice(0, 8000),
            '',
            'Meta:',
            '```json',
            JSON.stringify(evt.meta ?? null, null, 2).slice(0, 8000),
            '```',
        ]
            .filter(Boolean)
            .join('\n');
        const res = await fetch(`https://api.github.com/repos/${owner}/${name}/issues`, {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'User-Agent': 'SCINGULAR-OBS',
            },
            body: JSON.stringify({ title, body, labels: ['obs', 'critical'] }),
        });
        if (!res.ok)
            return { ok: false, skipped: false, reason: `HTTP_${res.status}` };
        const json = await res.json();
        return { ok: true, issueUrl: json?.html_url ?? null };
    }
    catch (e) {
        return { ok: false, skipped: false, reason: e?.message ?? 'UNKNOWN' };
    }
}
//# sourceMappingURL=githubNotify.js.map