import Link from 'next/link';
import { useAuthStore } from '../../lib/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useVoiceMvp } from '../../src/voice/client/useVoiceMvp';

export function Navbar() {
  const { user } = useAuthStore();
  const voice = useVoiceMvp();

  const handleSignOut = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ScingOS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {voice.enabled ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-xs leading-tight">
                  <div className="text-gray-500">
                    <span className="font-semibold">VOICE:</span> {voice.state.toUpperCase()}
                  </div>
                  {voice.lastError ? (
                    <div className="text-red-600 truncate max-w-xs">{voice.lastError.code}</div>
                  ) : voice.transcriptFinal ? (
                    <div className="text-gray-600 truncate max-w-xs">"{voice.transcriptFinal}"</div>
                  ) : voice.transcriptInterim ? (
                    <div className="text-gray-600 truncate max-w-xs">{voice.transcriptInterim}</div>
                  ) : voice.lastResponse ? (
                    <div className="text-gray-600 truncate max-w-xs">{voice.lastResponse}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    VOICE: {voice.state.toUpperCase()}
                  </span>
                  <button
                    onMouseDown={voice.pttDown}
                    onMouseUp={voice.pttUp}
                    onMouseLeave={voice.pttUp}
                    className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
                    title="Hold to talk (Space also works)"
                    type="button"
                  >
                    Hold to Talk
                  </button>
                </div>
              </div>
            ) : null}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}