import type { Reflection } from "@scingular/sdk";
import type { BfiAction } from "./pipelineTypes";

export function reflect(action: BfiAction, execOk: boolean, execMeta?: { exitCode?: number }): Reflection {
  const learned: string[] = [];
  const followUps: string[] = [];

  if (action.kind === "tasks.run") {
    if (execOk) learned.push(`Task ${action.task} succeeded.`);
    else learned.push(`Task ${action.task} failed.`);
    if (!execOk) followUps.push("Inspect stderr and address the first error." );
  }

  if (action.kind === "registry.upsert") {
    if (execOk) learned.push("Registry upsert completed." );
    else learned.push("Registry upsert failed." );
    followUps.push("Consider running typecheck to validate downstream usage." );
  }

  if (typeof execMeta?.exitCode === "number") {
    learned.push(`Exit code: ${execMeta.exitCode}`);
  }

  return { learned, followUps };
}
