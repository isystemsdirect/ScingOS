import { getVoiceRuntime } from '../../voice/runtime/voiceRuntime';
import {
	getNeuralIngressState,
	subscribeNeuralIngress,
} from '../../neural/runtime/neuralIngress';
import { setSrtTruth } from './srtFeedbackStore';
import type { SrtTruth } from './srtFeedbackTypes';

let started = false;
let stopFns: Array<() => void> = [];

const deriveTruth = (): { truth: SrtTruth; correlationId?: string } => {
	const voice = getVoiceRuntime();
	const voiceState = voice.getState();
	const neural = getNeuralIngressState();

	if (voiceState.status === 'error') return { truth: 'error' };

	if (neural.status === 'in_flight') {
		return { truth: 'in_flight', correlationId: neural.inFlightCorrelationId };
	}

	if (voiceState.status === 'speaking') return { truth: 'speaking' };
	if (voiceState.status === 'thinking') return { truth: 'thinking' };
	if (voiceState.status === 'listening') return { truth: 'listening' };

	return { truth: 'idle' };
};

export const startSrtTruthAdapter = (): (() => void) => {
	if (started) return () => stopSrtTruthAdapter();
	started = true;

	const update = () => {
		const { truth, correlationId } = deriveTruth();
		setSrtTruth(truth, correlationId);
	};

	// initial
	update();

	// voice changes
	stopFns.push(getVoiceRuntime().subscribe(() => update()));
	// neural changes
	stopFns.push(subscribeNeuralIngress(() => update()));
	// defensive polling in case the runtime is swapped without emitting
	const intervalId = setInterval(update, 200);
	stopFns.push(() => clearInterval(intervalId));

	return () => stopSrtTruthAdapter();
};

export const stopSrtTruthAdapter = (): void => {
	if (!started) return;
	started = false;
	for (const stop of stopFns) stop();
	stopFns = [];
};
