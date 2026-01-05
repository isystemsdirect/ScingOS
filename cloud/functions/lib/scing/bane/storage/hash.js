"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
const node_crypto_1 = __importDefault(require("node:crypto"));
function sha256Hex(s) {
    return node_crypto_1.default.createHash('sha256').update(s).digest('hex');
}
//# sourceMappingURL=hash.js.map