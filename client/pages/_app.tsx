import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '../lib/store/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe();
  }, [setUser]);

  return <Component {...pageProps} />;
}