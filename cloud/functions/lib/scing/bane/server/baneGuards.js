"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baneToolGuard = exports.baneHttpGuard = void 0;
const httpMiddleware_1 = require("../integrations/httpMiddleware");
const toolGuard_1 = require("../integrations/toolGuard");
const inMemoryBaneStore_1 = require("../storage/inMemoryBaneStore");
// Server-only singleton guard construction.
// If/when Admin Firestore is available server-side, swap store in Step 5.
const config = {
    profileId: 'bane_fog_v1',
    store: new inMemoryBaneStore_1.InMemoryBaneStore(),
};
exports.baneHttpGuard = (0, httpMiddleware_1.makeBaneHttpGuard)(config);
exports.baneToolGuard = (0, toolGuard_1.makeBaneToolGuard)(config);
//# sourceMappingURL=baneGuards.js.map