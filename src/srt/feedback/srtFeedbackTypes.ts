export type SrtTruth =
	| 'idle'
	| 'listening'
	| 'thinking'
	| 'speaking'
	| 'in_flight'
	| 'error';

export type SrtModifiers = {
	hover: number; // 0..1
	pressed: number; // 0..1
	attn: number; // 0..1
};

export type SrtFeedbackState = {
	truth: SrtTruth;
	truthSince: number;
	modifiers: SrtModifiers;
	lastCorrelationId?: string;
};
