import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AvatarInteractive } from '@rtsf/avatar/AvatarInteractive';
import { ScingPanel } from '@rtsf/ui/ScingPanel';
import { getSrtFeedbackState, subscribeSrtFeedback } from '@rtsf/srt/feedback/srtFeedbackStore';
import { SrtDebugHud } from '@rtsf/srt/feedback/SrtDebugHud';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [srt, setSrt] = useState(getSrtFeedbackState());

  useEffect(() => {
    return subscribeSrtFeedback(setSrt);
  }, []);

  const truthScalar = useMemo(() => {
    switch (srt.truth) {
      case 'idle':
        return 0;
      case 'listening':
        return 0.35;
      case 'thinking':
        return 0.55;
      case 'in_flight':
        return 0.55;
      case 'speaking':
        return 0.75;
      case 'error':
        return 0.25;
      default:
        return 0;
    }
  }, [srt.truth]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      <ScingPanel />
  		<SrtDebugHud />

      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 40 }}>
        <AvatarInteractive className="select-none">
          <div
            className="flex items-center justify-center rounded-full bg-primary-600 text-white font-semibold"
            style={{
              width: 56,
              height: 56,
              ...( { ['--srt-truth' as any]: truthScalar } as any ),
              transform: 'scale(calc(1 + (var(--scing-hover) * 0.04) + (var(--scing-pressed) * 0.02)))',
              filter: 'brightness(calc(1 + (var(--scing-attn) * 0.12) + (var(--srt-truth) * 0.08)))',
              transition: 'transform 120ms ease, filter 120ms ease',
            }}
            title="Scing"
          >
            S
          </div>
        </AvatarInteractive>
      </div>
    </div>
  );
}