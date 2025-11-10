
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster as SonnerToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import "@/styles/background-slideshow.css";
import { cn } from "@/lib/utils";
import AppLayout from "@/app/layout-client";
import BackgroundSlideshow from "@/components/background-slideshow";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SCINGULAR - AI-Powered Inspections",
  description: "The future of inspection technology, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <body>
        <BackgroundSlideshow />
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
