import { setVoiceRuntime, type VoiceRuntime } from '../../voice/runtime/voiceRuntime';
import { getNeuralIngressState } from '../../neural/runtime/neuralIngress';
import {
	getSrtFeedbackState,
	resetSrtFeedback,
} from '../feedback/srtFeedbackStore';
import { startSrtTruthAdapter, stopSrtTruthAdapter } from '../feedback/truthAdapter';

const createFakeVoice = (initial: VoiceRuntime['getState'] extends () => infer T ? T : never): VoiceRuntime => {
	let state = initial as any;
	const listeners = new Set<(s: any) => void>();
	return {
		getState: () => state,
		subscribe: (l) => {
			listeners.add(l);
			l(state);
			return () => listeners.delete(l);
		},
		startPushToTalk: () => {
			state = { status: 'listening', startedAt: Date.now() };
			for (const l of listeners) l(state);
		},
		stopPushToTalk: () => {
			state = { status: 'idle' };
			for (const l of listeners) l(state);
		},
		isListening: () => state.status === 'listening',
		isSpeaking: () => state.status === 'speaking',
		cancelSpeaking: () => undefined,
		reset: () => {
			state = { status: 'idle' };
			for (const l of listeners) l(state);
		},
	};
};

describe('truthAdapter', () => {
	beforeEach(() => {
		resetSrtFeedback();
		stopSrtTruthAdapter();
	});

	afterEach(() => {
		stopSrtTruthAdapter();
	});

	it('reflects voice listening', async () => {
		setVoiceRuntime(createFakeVoice({ status: 'idle' }));
		const stop = startSrtTruthAdapter();

		setVoiceRuntime(createFakeVoice({ status: 'listening', startedAt: Date.now() }));
		// polling will pick it up
		await new Promise((r) => setTimeout(r, 250));

		expect(getSrtFeedbackState().truth).toBe('listening');
		stop();
	});

	it('does not claim in_flight unless neural says so', () => {
		setVoiceRuntime(createFakeVoice({ status: 'idle' }));
		const stop = startSrtTruthAdapter();
		expect(getSrtFeedbackState().truth).not.toBe('in_flight');
		expect(getNeuralIngressState().status).toBe('idle');
		stop();
	});
});
