"use client"

import React, { useEffect, useState } from "react"
import { Download, X, Share } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useHaptics } from "@/hooks/useHaptics"

// Types for the PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  
  // Lazy init to avoid effect warning and handle SSR
  const [isIOS] = useState(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    }
    return false
  })
  
  const haptics = useHaptics()

  useEffect(() => {
    // Capture the PWA install prompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Wait a bit before showing to not be intrusive
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Also check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(false)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    haptics.medium()
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
      setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-96"
        >
          <div className="glass-card p-4 border-blue-500/20 bg-[#050505]/90 backdrop-blur-xl shadow-2xl relative">
            <button 
                onClick={dismiss}
                className="absolute top-2 right-2 p-1 text-white/40 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm">Install DecisionLens AI</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {isIOS 
                    ? "Tap the Share button and select 'Add to Home Screen' for the best experience." 
                    : "Add to your home screen for offline access and native performance."}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
               {isIOS ? (
                 <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Share className="w-4 h-4" /> Use Safari Share Menu
                 </div>
               ) : (
                <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                    Install App
                </button>
               )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
