import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { getSrtFeedbackState, subscribeSrtFeedback } from './srtFeedbackStore';

export const SrtDebugHud: FC = () => {
	const enabled =
		typeof process !== 'undefined' &&
		process.env.NEXT_PUBLIC_SRT_DEBUG === 'true';
	const [state, setState] = useState(getSrtFeedbackState());

	useEffect(() => {
		if (!enabled) return;
		return subscribeSrtFeedback((s) => setState(s));
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div
			style={{
				position: 'fixed',
				left: 12,
				bottom: 12,
				zIndex: 9999,
				background: 'rgba(0,0,0,0.7)',
				color: 'white',
				padding: 10,
				borderRadius: 8,
				fontSize: 12,
				maxWidth: 360,
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 6 }}>SRT Debug</div>
			<div>truth: {state.truth}</div>
			<div>
				mods: h={state.modifiers.hover.toFixed(2)} p=
				{state.modifiers.pressed.toFixed(2)} a={state.modifiers.attn.toFixed(2)}
			</div>
			<div>corr: {state.lastCorrelationId ?? '-'}</div>
		</div>
	);
};
