import React from 'react';
import { useScing } from './useScing';

export const HUDOverlay: React.FC = () => {
  const { state } = useScing();
  return (
    <div className="hud-overlay">
      {Object.values(state.hud.channels).map((c) => (
        <div key={c.channelId} className="hud-channel">
          {c.payload.overlays.map((o, i) => (
            <div key={i}>{o.kind === 'text' ? o.text : JSON.stringify(o)}</div>
          ))}
        </div>
      ))}
    </div>
  );
};
