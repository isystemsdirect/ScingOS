
// baneChannel.ts
import type { Context } from './context';
import type { Decision } from './decision';
import type { PolicyEngine } from './policyEngine';
import type { Adapters } from './adapters';
import type { Audit } from './audit';

export interface InvokeResult<T = unknown> {
  ok: boolean;
  decision: Decision;
  data?: T;
  error?: string;
  sdrHash?: string;
}

export class BaneChannel {
  constructor(
    private policyEngine: PolicyEngine,
    private adapters: Adapters,
    private audit: Audit
  ) {}

  async invoke<T>(
    action: string,
    resource: string,
    context: Context
  ): Promise<InvokeResult<T>> {
    // 1) Strict context validation (no anonymous actions)
    if (!context.subject || !context.userRole || !context.devicePosture) {
      const decision: Decision = {
        type: 'DENY',
        reasonCode: 'CONTEXT_INVALID',
        mode: 'NORMAL',
      };
      const sdrHash = await this.audit.createSignedSDR(decision, 'system', resource);
      return { ok: false, decision, error: 'Invalid context', sdrHash };
    }

    // 2) Ask PolicyEngine for a decision
    const decision = await this.policyEngine.evaluate(action, resource, context);

    if (decision.type !== 'ALLOW') {
      const sdrHash = await this.audit.createSignedSDR(decision, context.subject, resource);
      return { ok: false, decision, error: decision.reasonCode, sdrHash };
    }

    // 3) Execute side-effect via adapters
    try {
      const data = await this.dispatch<T>(action, resource, context, decision);

      const sdrHash = await this.audit.createSignedSDR(decision, context.subject, resource);

      return { ok: true, decision, data, sdrHash };
    } catch (err: any) {
      const failureDecision: Decision = {
        type: 'ROLLBACK',
        reasonCode: 'EXECUTION_ERROR',
        reasonDetail: String(err?.message ?? err),
        mode: decision.mode,
      };
      const sdrHash = await this.audit.createSignedSDR(
        failureDecision,
        context.subject,
        resource
      );

      return { ok: false, decision: failureDecision, error: failureDecision.reasonCode, sdrHash };
    }
  }

  private async dispatch<T>(
    action: string,
    resource: string,
    context: Context,
    decision: Decision
  ): Promise<T> {
    switch (action) {
      case 'net.call':
        return this.adapters.network.call<T>(resource, context, decision);
      case 'camera.capture':
        return this.adapters.camera.capture<T>(resource, context, decision);
      case 'file.handle':
        return this.adapters.file.handle<T>(resource, context, decision);
      case 'lidar.scan':
        return this.adapters.lidar.scan<T>(resource, context, decision);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}
