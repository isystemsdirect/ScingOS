import React, { useEffect } from 'react';
import { useObs } from './useObs';

export const GlobalErrorCapture: React.FC<{ phase?: string }> = ({ phase }) => {
  const obs = useObs();

  useEffect(() => {
    const onErr = (event: ErrorEvent) => {
      obs.emit({
        severity: 'critical',
        scope: 'client',
        message: 'Unhandled window error',
        phase,
        error: event.error ?? { name: 'ErrorEvent', stack: String(event.message) },
        meta: { filename: event.filename, lineno: event.lineno, colno: event.colno },
        tags: ['window.onerror'],
      });
    };

    const onRej = (event: PromiseRejectionEvent) => {
      obs.emit({
        severity: 'critical',
        scope: 'client',
        message: 'Unhandled promise rejection',
        phase,
        error: event.reason ?? { name: 'UnhandledRejection', stack: String(event.reason) },
        tags: ['unhandledrejection'],
      });
    };

    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);

    const iv = window.setInterval(async () => {
      if (navigator.onLine) await obs.flush();
    }, 2500);

    return () => {
      window.clearInterval(iv);
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, [obs, phase]);

  return null;
};
