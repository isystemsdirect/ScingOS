"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escalate = escalate;
const riskLedger_1 = require("./riskLedger");
function escalate(identityId, severity) {
    const rec = (0, riskLedger_1.recordStrike)(identityId, severity);
    if (severity === 'critical') {
        (0, riskLedger_1.lockIdentity)(identityId, 60 * 60 * 1000);
        return 5;
    }
    if (rec.strikes >= 3) {
        (0, riskLedger_1.lockIdentity)(identityId, 15 * 60 * 1000);
        return 4;
    }
    if (rec.strikes === 2) {
        return 3;
    }
    return 2;
}
//# sourceMappingURL=escalation.js.map