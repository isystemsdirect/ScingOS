import { z } from "zod";

export const ToolDefSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.any(),
  outputSchema: z.any(),
});

export type ToolDef = z.infer<typeof ToolDefSchema>;
