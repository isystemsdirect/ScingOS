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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSDR = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
async function createSDR(data) {
    const sdrId = crypto.randomUUID();
    const timestamp = new Date();
    const sdr = {
        sdrId,
        timestamp,
        userId: data.userId,
        action: data.action,
        result: data.result,
        metadata: data.metadata || {},
        signature: '', // Will be set below
    };
    // Create signature
    const payload = JSON.stringify({
        sdrId: sdr.sdrId,
        timestamp: sdr.timestamp.toISOString(),
        userId: sdr.userId,
        action: sdr.action,
        result: sdr.result,
    });
    sdr.signature = crypto
        .createHash('sha256')
        .update(payload)
        .digest('hex');
    // Store in Firestore
    await admin.firestore().collection('sdrs').doc(sdrId).set(sdr);
    console.log(`SDR created: ${sdrId}`);
    return sdrId;
}
exports.createSDR = createSDR;
//# sourceMappingURL=sdr.js.map