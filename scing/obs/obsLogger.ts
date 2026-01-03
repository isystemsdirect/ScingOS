import type { ObsEvent, ObsScope, ObsSeverity } from './obsTypes';
import { eventId as makeEventId, correlationId as makeCorrelationId } from './obsIds';
import { redact, safeStack } from './obsRedact';

export function makeObsEvent(params: {
  severity: ObsSeverity;
  scope: ObsScope;
  message: string;
  orgId?: string;
  uid?: string;
  deviceId?: string;
  inspectionId?: string;
  engineId?: string;
  phase?: string;
  correlationId?: string;
  error?: any;
  meta?: any;
  tags?: string[];
  offlineCaptured?: boolean;
}): ObsEvent {
  const err = params.error;
  return {
    eventId: makeEventId('obs'),
    createdAt: new Date().toISOString(),
    orgId: params.orgId,
    uid: params.uid,
    deviceId: params.deviceId,
    severity: params.severity,
    scope: params.scope,
    correlationId: params.correlationId ?? makeCorrelationId('corr'),
    inspectionId: params.inspectionId,
    engineId: params.engineId,
    phase: params.phase,
    message: params.message,
    errorName: err?.name,
    errorStack: safeStack(err?.stack),
    tags: params.tags ?? [],
    meta: redact(params.meta ?? null),
    offlineCaptured: params.offlineCaptured ?? false,
  };
}
