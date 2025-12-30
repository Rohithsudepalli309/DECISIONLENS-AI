"use client"

import { useEffect, useRef } from 'react'
import { useDecisionStore } from '@/store/useDecisionStore'
import { useAuthStore } from '@/store/useAuthStore'
import { API_BASE_URL } from '@/lib/api-config'

export function SyncHub() {
  const { isLoggedIn, token } = useAuthStore()
  const { formData, currentStep, results, guardrails, pushState, fetchState, hasHydrated } = useDecisionStore()
  const lastSyncRef = useRef<string>("")
  const isInitialFetchDone = useRef(false)

  // Fetch state on login / initial load
  useEffect(() => {
    if (isLoggedIn && token && hasHydrated && !isInitialFetchDone.current) {
      fetchState(token, API_BASE_URL).then(() => {
        isInitialFetchDone.current = true
      })
    }
  }, [isLoggedIn, token, hasHydrated, fetchState])

  // Push state on changes (debounced)
  useEffect(() => {
    if (!isLoggedIn || !token || !isInitialFetchDone.current) return

    const currentState = JSON.stringify({ formData, currentStep, results, guardrails })
    if (currentState === lastSyncRef.current) return

    const timer = setTimeout(() => {
      pushState(token, API_BASE_URL)
      lastSyncRef.current = currentState
    }, 3000) // 3 second debounce for cloud sync

    return () => clearTimeout(timer)
  }, [formData, currentStep, results, guardrails, isLoggedIn, token, pushState])

  return null // Headless component
}
