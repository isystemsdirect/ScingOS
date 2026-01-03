
import { Inter } from 'next/font/google';
import { Toaster as SonnerToaster } from 'react-hot-toast';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/components/app-provider';
import BackgroundSlideshow from '@/components/background-slideshow';

import './globals.css';
import '@/styles/background-slideshow.css';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('dark', inter.variable)}>
      <head>
        <title>SCINGULAR - AI-Powered Inspections</title>
        <meta
          name="description"
          content="The future of inspection technology, powered by AI."
        />
      </head>
      <body>
        <BackgroundSlideshow />
        <AppProvider>{children}</AppProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
