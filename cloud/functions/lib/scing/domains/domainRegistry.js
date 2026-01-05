"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_REGISTRY = void 0;
exports.getDomain = getDomain;
const domain_1 = require("./moistureMold/v1/domain");
const domain_2 = require("./roofing/v1/domain");
const domain_3 = require("./electrical/v1/domain");
const domain_4 = require("./plumbing/v1/domain");
exports.DOMAIN_REGISTRY = {
    moisture_mold: domain_1.MOISTURE_MOLD_DOMAIN_V1,
    roofing: domain_2.ROOFING_DOMAIN_V1,
    electrical: domain_3.ELECTRICAL_DOMAIN_V1,
    plumbing: domain_4.PLUMBING_DOMAIN_V1,
};
function getDomain(domainKey) {
    return exports.DOMAIN_REGISTRY[domainKey] ?? null;
}
//# sourceMappingURL=domainRegistry.js.map