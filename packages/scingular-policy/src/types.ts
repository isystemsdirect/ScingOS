import { z } from "zod";
import { Capabilities } from "./capabilities";

export const CapabilitySchema = z.enum(
  Object.values(Capabilities) as [
    (typeof Capabilities)[keyof typeof Capabilities],
    ...(typeof Capabilities)[keyof typeof Capabilities][]
  ]
);

export const ActorSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["owner", "dev", "viewer"]),
  env: z.enum(["dev", "stage", "prod"]),
});

export const PolicyDecisionSchema = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
});

export type Actor = z.infer<typeof ActorSchema>;
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;
