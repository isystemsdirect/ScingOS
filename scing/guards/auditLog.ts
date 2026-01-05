export class AuditLog {
  note(event: string, payload: Record<string, any>) {
    // Replace with structured logging sink.
    // IMPORTANT: do not log raw sensitive bio/voice data; log aggregates only.
    console.debug('[AUDIT] ' + event, payload);
  }
}
