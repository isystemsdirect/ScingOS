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
exports.verifyCapability = exports.requestCapability = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const SECRET_KEY = process.env.BANE_SECRET_KEY || 'dev-secret-key-change-in-production';
async function requestCapability(userId, action, _metadata) {
    // Check user permissions
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error('User not found');
    }
    const user = userDoc.data();
    // Check role-based permissions
    if (!canPerformAction(user?.role, action)) {
        throw new Error(`User role '${user?.role}' cannot perform action '${action}'`);
    }
    // Generate capability token
    const issuedAt = Date.now();
    const expiresAt = issuedAt + (60 * 60 * 1000); // 1 hour
    const token = {
        cap: action,
        userId,
        issuedAt,
        expiresAt,
        signature: '',
    };
    // Sign token
    const payload = `${token.cap}:${token.userId}:${token.issuedAt}:${token.expiresAt}`;
    token.signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payload)
        .digest('hex');
    return token;
}
exports.requestCapability = requestCapability;
function verifyCapability(token) {
    // Check expiration
    if (Date.now() > token.expiresAt) {
        return false;
    }
    // Verify signature
    const payload = `${token.cap}:${token.userId}:${token.issuedAt}:${token.expiresAt}`;
    const expectedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payload)
        .digest('hex');
    return token.signature === expectedSignature;
}
exports.verifyCapability = verifyCapability;
function canPerformAction(role, action) {
    const permissions = {
        'admin': ['*'],
        'inspector': [
            'camera.read',
            'camera.write',
            'inspection.create',
            'inspection.update',
            'inspection.finalize',
            'file.read',
            'file.write',
        ],
        'viewer': [
            'inspection.read',
            'file.read',
        ],
    };
    const userPermissions = permissions[role] || [];
    return userPermissions.includes('*') || userPermissions.includes(action);
}
//# sourceMappingURL=capability.js.map