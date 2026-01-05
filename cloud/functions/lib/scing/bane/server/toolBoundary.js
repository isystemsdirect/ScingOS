"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGuardedTool = runGuardedTool;
const baneGuards_1 = require("./baneGuards");
async function runGuardedTool(params) {
    const decision = (0, baneGuards_1.baneToolGuard)({
        toolName: params.toolName,
        requiredCapability: params.requiredCapability,
        payloadText: params.payloadText,
        identityId: params.identityId,
        capabilities: params.capabilities,
        sessionIntegrity: {
            nonceOk: true,
            signatureOk: true,
            tokenFresh: Boolean(params.identityId),
        },
    });
    if (!decision.ok) {
        const err = new Error(decision.message);
        err.baneTraceId = decision.traceId;
        throw err;
    }
    return params.exec();
}
//# sourceMappingURL=toolBoundary.js.map