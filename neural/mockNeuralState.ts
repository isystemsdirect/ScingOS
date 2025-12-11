export type NeuralMode = "idle" | "thinking" | "speaking" | "error";

export type NeuralVisualState = {
  mode: NeuralMode;
  intensity: number; // 0–1
};

type Callback = (state: NeuralVisualState) => void;

/**
 * subscribeToMockNeuralState
 *
 * Cycles through neural modes every few seconds.
 * This simulates the AI Neural System driving visuals.
 */
export function subscribeToMockNeuralState(callback: Callback): () => void {
  const modes: NeuralMode[] = ["idle", "thinking", "speaking", "error"];
  let index = 0;

  // Emit initial state
  callback({
    mode: modes[index],
    intensity: 0.3,
  });

  const interval = setInterval(() => {
    index = (index + 1) % modes.length;
    const mode = modes[index];

    const intensity =
      mode === "idle" ? 0.2 :
      mode === "thinking" ? 0.6 :
      mode === "speaking" ? 1.0 :
      0.9; // error

    callback({ mode, intensity });
  }, 4000);

  return () => {
    clearInterval(interval);
  };
}
