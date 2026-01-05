import type { SrtFeedbackState, SrtModifiers, SrtTruth } from './srtFeedbackTypes';

export type SrtFeedbackListener = (state: SrtFeedbackState) => void;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

let state: SrtFeedbackState = {
	truth: 'idle',
	truthSince: Date.now(),
	modifiers: { hover: 0, pressed: 0, attn: 0 },
};

const listeners = new Set<SrtFeedbackListener>();

const emit = () => {
	for (const listener of listeners) listener(state);
};

export const getSrtFeedbackState = (): SrtFeedbackState => state;

export const subscribeSrtFeedback = (listener: SrtFeedbackListener): (() => void) => {
	listeners.add(listener);
	listener(state);
	return () => listeners.delete(listener);
};

export const setSrtModifiers = (modifiers: Partial<SrtModifiers>): void => {
	state = {
		...state,
		modifiers: {
			hover: clamp01(modifiers.hover ?? state.modifiers.hover),
			pressed: clamp01(modifiers.pressed ?? state.modifiers.pressed),
			attn: clamp01(modifiers.attn ?? state.modifiers.attn),
		},
	};
	emit();
};

export const setSrtTruth = (truth: SrtTruth, correlationId?: string): void => {
	if (state.truth === truth && state.lastCorrelationId === correlationId) return;
	state = {
		...state,
		truth,
		truthSince: Date.now(),
		lastCorrelationId: correlationId ?? state.lastCorrelationId,
	};
	emit();
};

export const resetSrtFeedback = (): void => {
	state = {
		truth: 'idle',
		truthSince: Date.now(),
		modifiers: { hover: 0, pressed: 0, attn: 0 },
	};
	emit();
};
