import type { Metadata } from "next";
import "./globals.css";

// Fallback to system fonts for build stability
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "DecisionLens AI | Strategic Intelligence Platform",
  description: "Advanced multi-criteria decision support system for enterprise strategy.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DecisionLens AI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingTour } from "@/components/OnboardingTour";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { TelemetryProvider } from "@/components/TelemetryProvider";

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { BottomNav } from "@/components/BottomNav";
import { NeuralBackdrop } from "@/components/NeuralBackdrop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30 bg-[#050505] pb-24 md:pb-0`}
      >
        <NeuralBackdrop />
        <GlobalErrorBoundary>
          <TelemetryProvider>
            <PWAInstallPrompt />
            <BottomNav />
            <KeyboardShortcuts />
            <CommandPalette>
              <PageTransition>
                {children}
              </PageTransition>
            </CommandPalette>
            <OnboardingTour />
          </TelemetryProvider>
        </GlobalErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
