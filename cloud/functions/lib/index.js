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
exports.onInspectionComplete = exports.onUserCreate = exports.healthCheck = exports.isdc = exports.aip = exports.lari = exports.bane = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const bane_1 = require("./bane");
const lari_1 = require("./lari");
const aip_1 = require("./aip");
const isdc_1 = require("./isdc");
// Initialize Firebase Admin
admin.initializeApp();
// Export BANE functions (security)
exports.bane = bane_1.baneRouter;
// Export LARI functions (AI engines)
exports.lari = lari_1.lariRouter;
// Export AIP functions (protocol)
exports.aip = aip_1.aipRouter;
// Export ISDC functions (ISDCProtocol2025)
exports.isdc = isdc_1.isdcRouter;
// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ScingOS Cloud Functions',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
    });
});
// Example: User creation trigger
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName } = user;
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(uid).set({
        email,
        displayName: displayName || null,
        role: 'inspector',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User created: ${uid}`);
});
// Example: Inspection completion trigger
exports.onInspectionComplete = functions.firestore
    .document('inspections/{inspectionId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status !== 'completed' && after.status === 'completed') {
        const inspectionId = context.params.inspectionId;
        console.log(`Inspection completed: ${inspectionId}`);
        // TODO: Generate report
        // TODO: Send notification
    }
});
//# sourceMappingURL=index.js.map