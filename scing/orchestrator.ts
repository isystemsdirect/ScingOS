import { runLariEdl, LariEdlTask } from './engines/lariEdl';

export type OrchestratorTask =
  | { kind: 'lari-edl'; payload: LariEdlTask }
  | { kind: 'noop' };

export async function runOrchestrator(task: OrchestratorTask): Promise<string> {
  switch (task.kind) {
    case 'lari-edl':
      return runLariEdl(task.payload);
    case 'noop':
      return Promise.resolve('noop');
    default:
      throw new Error(`Unknown orchestrator task kind: ${(task as any).kind}`);
  }
}

export default runOrchestrator;
