import { z } from "zod";
import { IntentSchema, SimulationResultSchema } from "@scingular/sdk";

export const BfiActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tasks.run"), task: z.enum(["typecheck", "lint", "build", "test"]) }),
  z.object({
    kind: z.literal("registry.upsert"),
    engine: z.object({
      id: z.string().min(1),
      displayName: z.string().min(1),
      family: z.string().min(1),
      version: z.string().min(1),
      provider: z.string().optional(),
      entry: z.string().optional(),
      visualChannel: z.string().optional(),
      purpose: z.string().optional(),
      cognitiveRole: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      failureModes: z.array(z.string()).optional(),
      policySurface: z.array(z.string()).optional(),
    }),
  }),
]);

export type BfiAction = z.infer<typeof BfiActionSchema>;

export const BfiPlanRequestSchema = z.object({
  intent: IntentSchema,
  action: BfiActionSchema,
});

export const PolicyPreviewSchema = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
  decisionId: z.string(),
});

export const BfiPlanResponseSchema = z.object({
  ok: z.boolean(),
  stages: z.object({
    intent: IntentSchema,
    simulation: SimulationResultSchema,
    policy: PolicyPreviewSchema,
  }),
  simulationHash: z.string(),
});

export type BfiPlanRequest = z.infer<typeof BfiPlanRequestSchema>;
export type BfiPlanResponse = z.infer<typeof BfiPlanResponseSchema>;
