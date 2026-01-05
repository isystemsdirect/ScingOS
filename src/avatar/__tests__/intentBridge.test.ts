import {
	dispatchAvatarIntent,
	subscribeAvatarIntents,
} from '../intentBridge';

describe('intentBridge', () => {
	it('dispatches to subscribers and returns unsubscribe', () => {
		const seen: string[] = [];
		const unsub = subscribeAvatarIntents((intent) => {
			seen.push(intent.type);
		});
		dispatchAvatarIntent('toggle_panel');
		unsub();
		dispatchAvatarIntent('toggle_panel');
		expect(seen).toEqual(['toggle_panel']);
	});
});
