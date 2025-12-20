import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DecisionLens AI | Ultimate Support System",
  description: "Explainable, human-in-the-loop decision-support system with 70+ MCDA methods.",
};

import { CommandPalette } from "@/components/CommandPalette";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
      >
        <CommandPalette>
          <div className="fixed inset-0 bg-[#050505] -z-50" />
          {children}
        </CommandPalette>
      </body>
    </html>
  );
}
