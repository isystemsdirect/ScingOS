import { makeVoiceStateMachine } from './stateMachine';

describe('voice state machine', () => {
  test('allows legal transitions', () => {
    const sm = makeVoiceStateMachine({ initial: 'idle' });
    expect(sm.getState()).toBe('idle');
    sm.transition('listening');
    expect(sm.getState()).toBe('listening');
    sm.transition('capturing');
    expect(sm.getState()).toBe('capturing');
    sm.transition('transcribing');
    expect(sm.getState()).toBe('transcribing');
    sm.transition('thinking');
    expect(sm.getState()).toBe('thinking');
    sm.transition('speaking');
    expect(sm.getState()).toBe('speaking');
    sm.transition('idle');
    expect(sm.getState()).toBe('idle');
  });

  test('throws on illegal transitions', () => {
    const sm = makeVoiceStateMachine({ initial: 'idle' });
    expect(() => sm.transition('executing' as any)).toThrow();
    expect(() => sm.transition('speaking')).toThrow();
  });
});
