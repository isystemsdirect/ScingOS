import React from 'react';
import { useScing } from './useScing';

export const EnginePanel: React.FC = () => {
  const { state } = useScing();
  return (
    <div>
      {Object.values(state.engines).map((e) => (
        <div key={e.engineId}>
          {e.engineId} — {e.status}
        </div>
      ))}
    </div>
  );
};
