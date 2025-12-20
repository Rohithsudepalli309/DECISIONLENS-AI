"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { BrainCircuit, Lock, Mail, ArrowRight, Github, Chrome } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    localStorage.setItem("isLoggedIn", "true")
    router.push("/")
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('/decision_ai_bg.png')" }} // Note: Original path, need to ensure mapping or use generated image
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card !p-10 border-white/5 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30">
              <BrainCircuit className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Secure Access</h1>
              <p className="text-white/40 text-sm">Decision Engine Authorization Required</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Terminal ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 h-12"
                  placeholder="name@organization.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Access Protocol (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 h-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold flex items-center justify-center gap-2 group transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  INITIALIZE AUTH
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center gap-4">
            <div className="flex-grow h-[1px] bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Federated Access</span>
            <div className="flex-grow h-[1px] bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">
              <Chrome className="w-4 h-4" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
          v4.8 ENTERPRISE TIER // ENCRYPTED SESSION
        </p>
      </motion.div>
    </div>
  )
}
