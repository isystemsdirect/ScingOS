import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AvatarInteractive } from '@rtsf/avatar/AvatarInteractive';
import { ScingPanel } from '@rtsf/ui/ScingPanel';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      <ScingPanel />

      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 40 }}>
        <AvatarInteractive className="select-none">
          <div
            className="flex items-center justify-center rounded-full bg-primary-600 text-white font-semibold"
            style={{
              width: 56,
              height: 56,
              transform: 'scale(calc(1 + (var(--scing-hover) * 0.04) + (var(--scing-pressed) * 0.02)))',
              filter: 'brightness(calc(1 + (var(--scing-attn) * 0.12)))',
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