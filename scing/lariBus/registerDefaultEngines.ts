import { registerEngine } from './busRegistry';
import { createLariEchoEngine } from './engines/lariEchoEngine';

let registered = false;

export function registerDefaultEngines(): void {
  if (registered) return;
  registered = true;

  registerEngine(createLariEchoEngine());
}
