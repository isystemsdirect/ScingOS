import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Helper wrapper for future use: wrap callables to auto-log thrown errors.
// Note: this writes directly to Firestore (best-effort) and then rethrows.
export function captureCallableError<T>(
  name: string,
  fn: (data: any, ctx: functions.https.CallableContext) => Promise<T>
) {
  return functions.https.onCall(async (data, ctx) => {
    try {
      return await fn(data, ctx);
    } catch (err: any) {
      try {
        const uid = ctx.auth?.uid ?? null;
        const eventId = `fnerr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        await admin
          .firestore()
          .doc(`obs/events/${eventId}`)
          .set(
            {
              eventId,
              createdAt: new Date().toISOString(),
              orgId: data?.orgId ? String(data.orgId) : null,
              uid,
              deviceId: data?.deviceId ? String(data.deviceId) : null,
              severity: 'critical',
              scope: 'function',
              correlationId: data?.correlationId ? String(data.correlationId) : `corr_${Date.now()}`,
              inspectionId: data?.inspectionId ? String(data.inspectionId) : null,
              engineId: data?.engineId ? String(data.engineId) : null,
              phase: data?.phase ? String(data.phase) : null,
              message: `Callable error: ${name}`,
              errorName: err?.name ? String(err.name).slice(0, 200) : null,
              errorStack: err?.stack ? String(err.stack).slice(0, 12000) : null,
              tags: ['callable:error'],
              meta: {
                dataKeys: Object.keys(data ?? {}),
                code: err?.code ?? null,
              },
              flushedAt: new Date().toISOString(),
            },
            { merge: false }
          );
      } catch {
        // ignore
      }
      throw err;
    }
  });
}
