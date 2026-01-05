"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiveBaneEngine = createLiveBaneEngine;
const node_crypto_1 = __importDefault(require("node:crypto"));
const banePolicy_1 = require("../policy/banePolicy");
const detectors_baseline_1 = require("../core/detectors.baseline");
const detectors_1 = require("../core/detectors");
const aggregate_1 = require("../core/aggregate");
const sortFindings_1 = require("../core/sortFindings");
const redaction_1 = require("../core/redaction");
const redactionFromFindings_1 = require("../core/redactionFromFindings");
const preflight_1 = require("./preflight");
const escalation_1 = require("./escalation");
const throttle_1 = require("./throttle");
const incident_1 = require("./incident");
const normalize_1 = require("./normalize");
const publicResponse_1 = require("./publicResponse");
const safeSideEffects_1 = require("./safeSideEffects");
function traceIdFromEntropy() {
    if (typeof node_crypto_1.default.randomUUID === 'function')
        return node_crypto_1.default.randomUUID();
    return node_crypto_1.default.randomBytes(16).toString('hex');
}
function publicMessageFor(params) {
    if (params.verdict === 'deny') {
        return params.enforcementLevel >= 4
            ? 'Access revoked temporarily due to policy violations. Contact an authorized administrator.'
            : 'Request denied: unauthorized or unsafe operation. This attempt has been logged.';
    }
    if (params.verdict === 'review') {
        return 'Request restricted by policy. Additional authorization is required.';
    }
    return undefined;
}
function createLiveBaneEngine(config) {
    const hints = (0, banePolicy_1.policyForProfile)(config.profileId);
    return {
        evaluate(input) {
            const t0 = Date.now();
            const traceId = traceIdFromEntropy();
            const normalized = (0, normalize_1.normalizeForDetection)(input);
            const pre = (0, preflight_1.banePreflight)(config, input, traceId, t0);
            if (pre) {
                const auth = input.req?.auth;
                if (pre.verdict === 'deny') {
                    (0, throttle_1.noteHostileAttempt)({ identityId: auth?.identityId, ipHash: auth?.ipHash });
                    const throttle = (0, throttle_1.decideThrottle)({ identityId: auth?.identityId, ipHash: auth?.ipHash });
                    pre.throttle = throttle;
                }
                pre.findings = (0, sortFindings_1.sortFindings)(pre.findings);
                const final = (0, publicResponse_1.finalizePublicFacing)(pre);
                (0, safeSideEffects_1.safeSideEffects)(config, input, final);
                return final;
            }
            const detectors = (0, detectors_baseline_1.baselineDetectors)();
            const rawFindings = (0, detectors_1.runDetectors)(detectors, normalized.forDetection, hints);
            const findings = (0, sortFindings_1.sortFindings)(rawFindings);
            const agg = (0, aggregate_1.aggregate)(findings);
            let enforcementLevel = agg.verdict === 'deny' ? 3 : agg.verdict === 'review' ? 2 : agg.verdict === 'sanitize' ? 1 : 0;
            const identityId = input.req?.auth?.identityId;
            if (agg.verdict === 'deny' && identityId && hints.escalationEnabled) {
                enforcementLevel = (0, escalation_1.escalate)(identityId, agg.severity);
            }
            const spans = (0, redactionFromFindings_1.redactionsFromFindings)(input.text, findings);
            const safeText = (agg.verdict === 'sanitize' || agg.verdict === 'review') && spans.length
                ? (0, redaction_1.applyRedactions)(input.text, spans)
                : undefined;
            const out = {
                verdict: agg.verdict,
                severity: agg.severity,
                findings,
                redactions: spans.length ? spans : undefined,
                safeText,
                traceId,
                timingMs: Date.now() - t0,
                enforcementLevel,
                publicMessage: publicMessageFor({ verdict: agg.verdict, enforcementLevel }),
            };
            if (out.verdict === 'deny') {
                (0, throttle_1.noteHostileAttempt)({ identityId, ipHash: input.req?.auth?.ipHash });
                out.throttle = (0, throttle_1.decideThrottle)({ identityId, ipHash: input.req?.auth?.ipHash });
            }
            if (out.enforcementLevel === 5 && hints.incidentOnCritical) {
                const incident = (0, incident_1.toIncidentRecord)(out, {
                    identityId,
                    sessionId: input.req?.auth?.sessionId,
                    ipHash: input.req?.auth?.ipHash,
                });
                try {
                    void config.store?.appendIncident?.(incident).catch(() => { });
                }
                catch {
                    // swallow
                }
            }
            const final = (0, publicResponse_1.finalizePublicFacing)(out);
            (0, safeSideEffects_1.safeSideEffects)(config, input, final);
            return final;
        },
    };
}
//# sourceMappingURL=liveBaneEngine.js.map