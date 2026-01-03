import type { ExpressionBundle, ExpressionComposerInput, ExpressionEvent } from './types';
import { buildResponsePlan } from './languagePlan';
import { buildTelemetry } from './telemetryPlan';

export function composeExpressionBundle(input: ExpressionComposerInput): ExpressionBundle {
  const responsePlan = buildResponsePlan(input.attractor, input.gradients, input.decision, {
    posture: input.posture,
  });
  const telemetry = buildTelemetry(
    input.attractor,
    input.gradients,
    input.decision,
    input.context ?? {}
  );
  return { responsePlan, telemetry };
}

export function composeExpressionEvent(input: ExpressionComposerInput): ExpressionEvent {
  const bundle = composeExpressionBundle(input);
  return {
    ts: Date.now(),
    responsePlan: bundle.responsePlan,
    telemetry: bundle.telemetry,
  };
}
