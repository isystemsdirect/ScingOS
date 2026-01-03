import React, { createContext, useReducer } from 'react';
import { initialScingState } from '@scing/ui/scingState';
import type { ScingState } from '@scing/ui/scingState';

export const ScingContext = createContext<{ state: ScingState; dispatch: any }>({
  state: initialScingState,
  dispatch: () => {},
});

function reducer(state: ScingState, action: any): ScingState {
  switch (action.type) {
    case 'ENGINE_STATUS':
      return { ...state, engines: { ...state.engines, [action.engineId]: action.payload } };
    case 'HUD_UPDATE':
      return { ...state, hud: { channels: { ...state.hud.channels, [action.channelId]: action.payload } } };
    default:
      return state;
  }
}

export const ScingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialScingState);
  return <ScingContext.Provider value={{ state, dispatch }}>{children}</ScingContext.Provider>;
};
