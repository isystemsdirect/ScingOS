import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '../lib/store/authStore';
import { ScingProvider } from '../src/scing/ScingProvider';
import { LariBusProvider } from '../src/lariBus/LariBusProvider';
import { GlobalErrorCapture, ObsProvider } from '../src/obs';
import { DeviceBoot } from '../src/devices';
import { initAvatarIntentWiring } from '@rtsf/avatar/wireAvatarIntents';
import { startSrtTruthAdapter } from '@rtsf/srt/feedback/truthAdapter';
import { startRtsfLiveAdapter } from '@rtsf/sensors/runtime/rtsfLiveAdapter';

export default function App({ Component, pageProps }: AppProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    initAvatarIntentWiring();
  }, []);

  useEffect(() => {
    const stopTruth = startSrtTruthAdapter();
    const stopRtsf = startRtsfLiveAdapter();
    return () => {
      stopRtsf();
      stopTruth();
    };
  }, []);

  return (
    <ScingProvider>
      <ObsProvider identity={{ uid: user?.uid }}>
        <GlobalErrorCapture phase="LFCB-10" />
        <DeviceBoot>
          <LariBusProvider>
            <Component {...pageProps} />
          </LariBusProvider>
        </DeviceBoot>
      </ObsProvider>
    </ScingProvider>
  );
}
