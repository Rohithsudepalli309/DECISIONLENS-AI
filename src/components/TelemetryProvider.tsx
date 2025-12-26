"use client"

import React, { createContext, useContext, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface TelemetryContext {
  trackEvent: (name: string, data?: unknown) => void
  trackError: (error: Error, fatal?: boolean) => void
  trackComputation: (engine: string, durationMs: number) => void
}

const TelemetryContext = createContext<TelemetryContext | null>(null)

// Tracking component that uses search params
function TelemetryTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Page View Tracking
    console.log(`[Telemetry] PageView: ${pathname}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`)
  }, [pathname, searchParams])

  return null
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const trackEvent = (name: string, data?: unknown) => {
    console.log(`[Telemetry] Event: ${name}`, data)
  }

  const trackError = (error: Error, fatal: boolean = false) => {
    console.error(`[Telemetry] ${fatal ? 'FATAL ' : ''}Error:`, error)
  }

  const trackComputation = (engine: string, durationMs: number) => {
    console.log(`[Telemetry] Performance: ${engine} computation took ${durationMs}ms`)
  }

  return (
    <TelemetryContext.Provider value={{ trackEvent, trackError, trackComputation }}>
      <Suspense fallback={null}>
        <TelemetryTracker />
      </Suspense>
      {children}
    </TelemetryContext.Provider>
  )
}

export const useTelemetry = () => {
  const context = useContext(TelemetryContext)
  if (!context) throw new Error("useTelemetry must be used within TelemetryProvider")
  return context
}
