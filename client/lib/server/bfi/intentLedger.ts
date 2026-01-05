export type IntentStatus = "declared" | "simulated" | "policy_evaluated" | "executed";

export type IntentState = {
  id: string;
  description: string;
  status: IntentStatus;
};

const intents = new Map<string, IntentState>();

export async function loadIntentState(_repoRoot: string, intentId: string): Promise<IntentState | null> {
  return intents.get(intentId) ?? null;
}

export async function appendIntentLedger(_repoRoot: string, _event: string, intent: IntentState): Promise<void> {
  intents.set(intent.id, intent);
}
