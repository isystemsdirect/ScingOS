export class AuditLog {
  note(event: string, payload: Record<string, any>) {
    // Replace with your structured logging sink.
    // IMPORTANT: avoid logging raw sensitive bio/voice data; log aggregates only.
    console.debug(`[AUDIT] ${event}`, payload)
  }
}
