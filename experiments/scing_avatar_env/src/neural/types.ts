export type NeuralMode = 'think' | 'speak' | 'alert' | 'idle';

export type NeuralEvent = {
  ts: number;
  source?: string;
  mode: NeuralMode;
  intensity?: number; // 0..1
  channels?: {
    lari?: number; // 0..1
    bane?: number; // 0..1
    io?: number; // 0..1
  };
  payload?: Record<string, unknown>;
};

export type NeuralTransport = 'poll' | 'sse' | 'ws';

export type NeuralClientOptions = {
  url: string;
  transport: NeuralTransport;
  pollIntervalMs?: number; // poll only
};

export type NeuralUnsubscribe = () => void;
