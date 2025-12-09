"use strict";
/**
 * ISDCProtocol2025 Type Definitions
 *
 * ISD-Communications Protocol for standardized inspection workflows
 * and data synchronization across all inspection systems.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISDCErrorCode = exports.ISDC_PROTOCOL_VERSION = void 0;
/**
 * Protocol version identifier
 */
exports.ISDC_PROTOCOL_VERSION = '2025.1.0';
/**
 * Protocol error codes
 */
var ISDCErrorCode;
(function (ISDCErrorCode) {
    ISDCErrorCode["SYNC_CONFLICT"] = "ISDC_SYNC_CONFLICT";
    ISDCErrorCode["VERSION_MISMATCH"] = "ISDC_VERSION_MISMATCH";
    ISDCErrorCode["INVALID_ENTITY"] = "ISDC_INVALID_ENTITY";
    ISDCErrorCode["UNAUTHORIZED"] = "ISDC_UNAUTHORIZED";
    ISDCErrorCode["SYNC_FAILED"] = "ISDC_SYNC_FAILED";
    ISDCErrorCode["ENTITY_NOT_FOUND"] = "ISDC_ENTITY_NOT_FOUND";
    ISDCErrorCode["CAPABILITY_DENIED"] = "ISDC_CAPABILITY_DENIED";
})(ISDCErrorCode || (exports.ISDCErrorCode = ISDCErrorCode = {}));
//# sourceMappingURL=types.js.map