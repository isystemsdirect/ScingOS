export type ScingConversationState = {
	lastUserText?: string;
	lastCorrelationId?: string;
	lastAssistantText?: string;
	error?: { message: string; correlationId?: string };
	lastUpdatedAt?: number;
};

export type ScingConversationListener = (state: ScingConversationState) => void;

let state: ScingConversationState = {};
const listeners = new Set<ScingConversationListener>();

const emit = () => {
	for (const listener of listeners) listener(state);
};

export const getConversationState = (): ScingConversationState => state;

export const subscribeConversation = (
	listener: ScingConversationListener,
): (() => void) => {
	listeners.add(listener);
	listener(state);
	return () => listeners.delete(listener);
};

export const setConversationUserText = (
	text: string,
	correlationId?: string,
): void => {
	state = {
		...state,
		lastUserText: text,
		lastCorrelationId: correlationId ?? state.lastCorrelationId,
		error: undefined,
		lastUpdatedAt: Date.now(),
	};
	emit();
};

export const setConversationAssistantText = (
	text: string,
	correlationId?: string,
): void => {
	state = {
		...state,
		lastAssistantText: text,
		lastCorrelationId: correlationId ?? state.lastCorrelationId,
		error: undefined,
		lastUpdatedAt: Date.now(),
	};
	emit();
};

export const setConversationError = (
	error: { message: string; correlationId?: string },
): void => {
	state = {
		...state,
		error,
		lastUpdatedAt: Date.now(),
	};
	emit();
};

export const resetConversation = (): void => {
	state = {};
	emit();
};
