import {
	getConversationState,
	resetConversation,
	setConversationAssistantText,
	setConversationError,
	setConversationUserText,
} from '../scingConversationStore';

describe('scingConversationStore', () => {
	beforeEach(() => {
		resetConversation();
	});

	it('sets user and assistant text', () => {
		setConversationUserText('hi', 'c1');
		setConversationAssistantText('hello', 'c1');
		const s = getConversationState();
		expect(s.lastUserText).toBe('hi');
		expect(s.lastAssistantText).toBe('hello');
		expect(s.lastCorrelationId).toBe('c1');
	});

	it('sets error', () => {
		setConversationError({ message: 'bad', correlationId: 'c2' });
		const s = getConversationState();
		expect(s.error?.message).toBe('bad');
		expect(s.error?.correlationId).toBe('c2');
	});
});
