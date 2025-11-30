import { Inter } from "next/font/google";
import { Toaster as SonnerToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import AppShell from "@/components/app-shell";

import "./globals.css";
import "@/styles/background-slideshow.css";
import { AppProvider } from "@/components/app-provider";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <head>
          <title>SCINGULAR - AI-Powered Inspections</title>
          <meta name="description" content="The future of inspection technology, powered by AI." />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
