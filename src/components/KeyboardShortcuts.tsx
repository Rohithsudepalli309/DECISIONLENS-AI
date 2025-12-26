"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDecisionStore } from "@/store/useDecisionStore"

export function KeyboardShortcuts() {
  const router = useRouter()
  const setView = useDecisionStore(state => state.setView)
  const resetDecision = useDecisionStore(state => state.resetDecision)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N: New Simulation
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        resetDecision()
        setView('stepper')
        if (window.location.pathname !== '/') {
          router.push('/')
        }
      }
      
      // Alt + H: History
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        router.push('/history')
      }

      // Alt + S: Settings
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        setView('settings')
        if (window.location.pathname !== '/') {
          router.push('/')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, setView, resetDecision])

  return null
}
