
"use client"

import React, { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useDecisionStore } from '@/store/useDecisionStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Copy, Check } from 'lucide-react'

export function SessionHandoff() {
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const { token, user } = useAuthStore()
  const { currentStep } = useDecisionStore()
  
  // Create a minimal session payload
  // In a real app, you might upload state to server and just share a session ID
  // For this demo, we'll encode core state (limited size for QR)
  const generateHandoffUrl = React.useCallback(() => {
    if (!token) return ""
    // In a real application, this would be a secure, server-generated link
    // that points to an endpoint capable of rehydrating the session.
    // For this demo, we'll create a dummy URL with encoded data.
    const sessionData = {
      t: token.substring(0, 10) + "...", // Security redaction for demo
      u: user?.username,
      s: currentStep,
      id: "SESSION_HANDOFF" 
    }
    const encodedData = encodeURIComponent(JSON.stringify(sessionData))
    return `${window.location.origin}/handoff?data=${encodedData}`
  }, [token, user?.username, currentStep])

  const handoffUrl = generateHandoffUrl()

  const handleCopy = () => {
    if (handoffUrl) {
      navigator.clipboard.writeText(handoffUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset copied state after 2 seconds
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={() => setShowQR(!showQR)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-all text-xs font-black uppercase tracking-widest"
      >
        <Smartphone className="w-4 h-4" />
        {showQR ? "Close Handoff" : "Transfer Session"}
      </button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 glass-card bg-gradient-to-br from-blue-900/50 to-blue-700/50 rounded-xl shadow-2xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="p-4 bg-white rounded-xl shadow-lg shadow-blue-900/20">
                 <div className="w-32 h-32 bg-white flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-[9px] text-gray-400 font-bold uppercase text-center px-2">QR Generation Unavailable</p>
                 </div>
                 {/* <QRCodeSVG value={handoffUrl} size={128} level="H" includeMargin={true} /> */}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                   <h4 className="font-bold text-white text-sm">Universal Handoff</h4>
                   <p className="text-[10px] text-white/40 leading-relaxed">Scan or copy to transfer this session to mobile/tablet.</p>
                </div>
                <button 
                   onClick={handleCopy}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all text-white"
                >
                   {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy Secure Link"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
