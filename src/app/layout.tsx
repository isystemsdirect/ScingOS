import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Scingular - AI-Powered Inspections",
  description: "The future of inspection technology, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", alegreya.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
