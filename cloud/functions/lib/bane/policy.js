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
exports.checkPolicy = void 0;
const admin = __importStar(require("firebase-admin"));
async function checkPolicy(userId, action, _resource) {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return false;
    }
    const user = userDoc.data();
    const role = user?.role || 'viewer';
    // Simple role-based policy check
    const policies = {
        'admin': ['*'],
        'inspector': [
            'camera.read',
            'camera.write',
            'inspection.create',
            'inspection.update',
            'inspection.finalize',
        ],
        'viewer': [
            'inspection.read',
        ],
    };
    const allowedActions = policies[role] || [];
    return allowedActions.includes('*') || allowedActions.includes(action);
}
exports.checkPolicy = checkPolicy;
//# sourceMappingURL=policy.js.map