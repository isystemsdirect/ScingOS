import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { getState, setState, appendAudit } from "../../../lib/server/scing/store/coAwarenessStore";
import { DEFAULT_DELEGATION_SCOPE } from "../../../lib/shared/scing/delegationDefaults";

const PatchSchema = z
  .object({
    phase: z.enum(["pre_imprint", "imprinting", "co_aware", "suspended"]).optional(),
    delegation: z
      .object({
        mode: z.enum(["manual", "assisted", "delegated"]).optional(),
        bestOutcomeDefaults: z.boolean().optional(),
        scope: z
          .object({
            canRunDevTasks: z.boolean().optional(),
            canStartStopServices: z.boolean().optional(),
            canManageDeps: z.boolean().optional(),
            canCreatePRs: z.boolean().optional(),

            canEditCode: z.boolean().optional(),
            canApplyPatches: z.boolean().optional(),
            canRefactor: z.boolean().optional(),
            canTouchSecurityPolicy: z.boolean().optional(),
            canTouchAuthSecrets: z.boolean().optional(),

            allowedPaths: z.array(z.string()).optional(),
            blockedPaths: z.array(z.string()).optional(),

            maxAutoRisk: z.enum(["low", "medium", "high", "critical"]).optional(),
            requiresApprovalAbove: z.enum(["low", "medium", "high", "critical"]).optional(),
          })
          .partial()
          .optional(),
      })
      .partial()
      .optional(),
  })
  .partial();

const BodySchema = z.object({
  iuPartnerId: z.string().min(1),
  patch: PatchSchema.optional(),
  devOverrideToCoAware: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = BodySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const { iuPartnerId, patch, devOverrideToCoAware } = parsed.data;

  if (!patch) {
    const state = getState(iuPartnerId);
    return res.status(200).json({ ok: true, state });
  }

  // Enforce defaults if caller provides delegation but no scope.
  if (patch.delegation && patch.delegation.scope == null) {
    patch.delegation.scope = DEFAULT_DELEGATION_SCOPE;
  }

  // Gate co_aware transition unless imprint gates are satisfied (dev override permitted).
  if (patch.phase === "co_aware" && !devOverrideToCoAware) {
    const current = getState(iuPartnerId);
    const g = current.imprintReadiness?.gates;
    if (!(g?.minSamplesMet && g?.minScoreMet)) {
      return res.status(200).json({
        ok: false,
        error: "Imprinting gates not satisfied. Provide devOverrideToCoAware=true for local dev only.",
        state: current,
      });
    }
  }

  const before = getState(iuPartnerId);
  const after = setState(iuPartnerId, patch);
  appendAudit(iuPartnerId, { type: "state.updated", actor: ctx.actor, before, after });

  return res.status(200).json({ ok: true, state: after });
}
