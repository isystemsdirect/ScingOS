import { z } from "zod";

export const IntentScopeSchema = z.enum(["engine", "registry", "ui", "policy", "infra"]);
export type IntentScope = z.infer<typeof IntentScopeSchema>;

export const IntentRiskSchema = z.enum(["low", "medium", "high"]);
export type IntentRisk = z.infer<typeof IntentRiskSchema>;

export const IntentSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  scope: IntentScopeSchema,
  riskLevel: IntentRiskSchema,
  expectedOutcome: z.string().min(1),
  rollbackStrategy: z.string().min(1),
});

export type Intent = z.infer<typeof IntentSchema>;

export const SimulationVerdictSchema = z.enum(["safe", "risky", "blocked"]);
export type SimulationVerdict = z.infer<typeof SimulationVerdictSchema>;

export const SimulationResultSchema = z.object({
  verdict: SimulationVerdictSchema,
  confidence: z.number().min(0).max(1),
  affectedFiles: z.array(z.string()),
  affectedEngines: z.array(z.string()),
  affectedPolicies: z.array(z.string()),
  notes: z.array(z.string()),
});

export type SimulationResult = z.infer<typeof SimulationResultSchema>;

export const ReflectionSchema = z.object({
  learned: z.array(z.string()),
  followUps: z.array(z.string()),
});

export type Reflection = z.infer<typeof ReflectionSchema>;
