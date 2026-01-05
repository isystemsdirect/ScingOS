"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryBaneStore = void 0;
class InMemoryBaneStore {
    constructor() {
        this.audits = [];
        this.events = [];
        this.incidents = [];
    }
    async appendAudit(record) {
        this.audits.push(record);
    }
    async appendEvent(event) {
        this.events.push(event);
    }
    async getRecentAudits(limit) {
        return this.audits.slice().sort((a, b) => b.at - a.at).slice(0, Math.max(1, Math.min(200, limit)));
    }
    async appendIncident(incident) {
        this.incidents.push(incident);
    }
    async getRecentIncidents(limit) {
        return this.incidents
            .slice()
            .sort((a, b) => b.occurredAt - a.occurredAt)
            .slice(0, Math.max(1, Math.min(200, limit)));
    }
    async getIncidentByTrace(traceId) {
        return this.incidents.find((i) => i.traceId === traceId) ?? null;
    }
}
exports.InMemoryBaneStore = InMemoryBaneStore;
//# sourceMappingURL=inMemoryBaneStore.js.map