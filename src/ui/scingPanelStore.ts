export type ScingPanelState = {
  isOpen: boolean;
};

type ScingPanelSubscriber = (state: ScingPanelState) => void;

let state: ScingPanelState = { isOpen: false };
const subs = new Set<ScingPanelSubscriber>();

export function getState(): ScingPanelState {
  return state;
}

export function subscribe(fn: ScingPanelSubscriber): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

function setState(next: ScingPanelState) {
  state = next;
  for (const s of subs) {
    try {
      s(state);
    } catch {
      // ignore subscriber faults
    }
  }
}

export function open() {
  if (state.isOpen) return;
  setState({ ...state, isOpen: true });
}

export function close() {
  if (!state.isOpen) return;
  setState({ ...state, isOpen: false });
}

export function toggle() {
  setState({ ...state, isOpen: !state.isOpen });
}
