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
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { NeuralBackdrop } from "@/components/NeuralBackdrop";
import { SyncHub } from "@/components/SyncHub";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30 bg-[#050505]`}
      >
        <NeuralBackdrop />
        <GlobalErrorBoundary>
          <TelemetryProvider>
            <SyncHub />
            <PWAInstallPrompt />
            <div className="flex min-h-screen">
              <DesktopSidebar />
              <div className="flex-1 flex flex-col md:pl-64 group-hover:md:pl-72 transition-all duration-500">
                <BottomNav />
                <KeyboardShortcuts />
                <CommandPalette>
                  <PageTransition>
                    <main className="flex-1 pb-24 md:pb-0">
                      {children}
                    </main>
                  </PageTransition>
                </CommandPalette>
              </div>
            </div>
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
