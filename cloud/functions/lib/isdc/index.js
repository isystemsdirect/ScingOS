"use strict";
/**
 * ISDCProtocol2025 Module
 * ISD-Communications Protocol for inspection data synchronization
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isdcRouter = exports.handleISDCMessage = void 0;
var protocol_1 = require("./protocol");
Object.defineProperty(exports, "handleISDCMessage", { enumerable: true, get: function () { return protocol_1.handleISDCMessage; } });
__exportStar(require("./types"), exports);
const protocol_2 = require("./protocol");
/**
 * ISDC router for Firebase Cloud Functions
 */
exports.isdcRouter = {
    handleMessage: protocol_2.handleISDCMessage,
};
//# sourceMappingURL=index.js.map