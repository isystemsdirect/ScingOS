export type VoiceRuntimeState =
	| { status: 'idle' }
	| { status: 'listening'; startedAt: number }
	| { status: 'thinking'; startedAt: number }
	| { status: 'speaking'; startedAt: number }
	| { status: 'error'; message: string; at: number };

export type VoiceRuntimeListener = (state: VoiceRuntimeState) => void;

export interface VoiceRuntime {
	getState(): VoiceRuntimeState;
	subscribe(listener: VoiceRuntimeListener): () => void;
	startPushToTalk(): void;
	stopPushToTalk(): void;
	isListening(): boolean;
	isSpeaking(): boolean;
	cancelSpeaking(): void;
	reset(): void;
}

const createNoopVoiceRuntime = (): VoiceRuntime => {
	let state: VoiceRuntimeState = { status: 'idle' };
	const listeners = new Set<VoiceRuntimeListener>();

	const emit = () => {
		for (const listener of listeners) listener(state);
	};

	return {
		getState() {
			return state;
		},
		subscribe(listener) {
			listeners.add(listener);
			listener(state);
			return () => listeners.delete(listener);
		},
		startPushToTalk() {
			state = { status: 'listening', startedAt: Date.now() };
			emit();
		},
		stopPushToTalk() {
			state = { status: 'idle' };
			emit();
		},
		isListening() {
			return state.status === 'listening';
		},
		isSpeaking() {
			return state.status === 'speaking';
		},
		cancelSpeaking() {
			// Truthful no-op: noop runtime never speaks.
		},
		reset() {
			state = { status: 'idle' };
			emit();
		},
	};
};

let activeRuntime: VoiceRuntime = createNoopVoiceRuntime();

export const getVoiceRuntime = (): VoiceRuntime => activeRuntime;

export const setVoiceRuntime = (runtime: VoiceRuntime): void => {
	activeRuntime = runtime;
};

export const tryCancelSpeaking = (): void => {
	try {
		activeRuntime.cancelSpeaking();
	} catch {
		// best-effort
	}
};

export const createWebSpeechSynthesisBargeIn = (): Pick<
	VoiceRuntime,
	'isSpeaking' | 'cancelSpeaking'
> => {
	return {
		isSpeaking() {
			if (typeof window === 'undefined') return false;
			return Boolean(window.speechSynthesis?.speaking);
		},
		cancelSpeaking() {
			if (typeof window === 'undefined') return;
			window.speechSynthesis?.cancel();
		},
	};
};
