export type NeuralIngressStatus = 'idle' | 'in_flight';

export type NeuralIngressState = {
	status: NeuralIngressStatus;
	inFlightCorrelationId?: string;
};

export type NeuralIngressListener = (state: NeuralIngressState) => void;

export class NeuralIngressError extends Error {
	public readonly code:
		| 'fetch_unavailable'
		| 'network'
		| 'http'
		| 'invalid_response';
	public readonly correlationId: string;
	public readonly status?: number;

	constructor(opts: {
		message: string;
		code: NeuralIngressError['code'];
		correlationId: string;
		status?: number;
		cause?: unknown;
	}) {
		super(opts.message);
		this.name = 'NeuralIngressError';
		this.code = opts.code;
		this.correlationId = opts.correlationId;
		this.status = opts.status;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(this as any).cause = opts.cause;
	}
}

const createCorrelationId = () =>
	`neural_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

let state: NeuralIngressState = { status: 'idle' };
const listeners = new Set<NeuralIngressListener>();

const emit = () => {
	for (const listener of listeners) listener(state);
};

export const subscribeNeuralIngress = (
	listener: NeuralIngressListener,
): (() => void) => {
	listeners.add(listener);
	listener(state);
	return () => listeners.delete(listener);
};

export const getNeuralIngressState = (): NeuralIngressState => state;

export const resetNeuralIngress = (): void => {
	state = { status: 'idle' };
	emit();
};

export type SubmitTextResult = {
	correlationId: string;
	textOut: string;
};

export const submitTextToScing = async (
	text: string,
	opts?: {
		correlationId?: string;
		endpoint?: string;
		headers?: Record<string, string>;
	},
): Promise<SubmitTextResult> => {
	const correlationId = opts?.correlationId ?? createCorrelationId();
	const endpoint = opts?.endpoint ?? '/api/scing/chat';

	state = { status: 'in_flight', inFlightCorrelationId: correlationId };
	emit();

	try {
		if (typeof fetch !== 'function') {
			throw new NeuralIngressError({
				message: 'fetch is not available in this environment',
				code: 'fetch_unavailable',
				correlationId,
			});
		}

		const res = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-bane-identity': 'local-dev',
				'x-bane-capabilities': 'bane:invoke',
				...(opts?.headers ?? {}),
			},
			body: JSON.stringify({ text, correlationId }),
		});

		if (!res.ok) {
			throw new NeuralIngressError({
				message: `Neural ingress HTTP ${res.status}`,
				code: 'http',
				correlationId,
				status: res.status,
			});
		}

		const data: unknown = await res.json();
		if (
			!data ||
			typeof data !== 'object' ||
			!('textOut' in data) ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			typeof (data as any).textOut !== 'string'
		) {
			throw new NeuralIngressError({
				message: 'Invalid response shape from neural ingress',
				code: 'invalid_response',
				correlationId,
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const textOut = (data as any).textOut as string;
		return { correlationId, textOut };
	} catch (err) {
		if (err instanceof NeuralIngressError) throw err;
		throw new NeuralIngressError({
			message: 'Neural ingress network error',
			code: 'network',
			correlationId,
			cause: err,
		});
	} finally {
		state = { status: 'idle' };
		emit();
	}
};
