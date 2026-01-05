import {
	getSrtFeedbackState,
	resetSrtFeedback,
	setSrtModifiers,
	setSrtTruth,
} from '../feedback/srtFeedbackStore';

describe('srtFeedbackStore', () => {
	beforeEach(() => {
		resetSrtFeedback();
	});

	it('clamps modifiers to 0..1', () => {
		setSrtModifiers({ hover: 2, pressed: -1, attn: 0.5 });
		const s = getSrtFeedbackState();
		expect(s.modifiers.hover).toBe(1);
		expect(s.modifiers.pressed).toBe(0);
		expect(s.modifiers.attn).toBe(0.5);
	});

	it('updates truth and correlation id', () => {
		setSrtTruth('in_flight', 'c1');
		const s = getSrtFeedbackState();
		expect(s.truth).toBe('in_flight');
		expect(s.lastCorrelationId).toBe('c1');
	});
});
