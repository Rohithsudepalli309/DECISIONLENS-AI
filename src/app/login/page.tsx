"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { BrainCircuit, Lock, Mail, ArrowRight, Github, Chrome, Fingerprint } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api-config"
import { useBiometrics } from "@/hooks/useBiometrics"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isSupported, verifyBiometrics, registerBiometrics, isRegistered } = useBiometrics()
  
  const loginStore = useAuthStore((state) => state.login)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isRegister) {
        const regRes = await axios.post(`${API_BASE_URL}/auth/register`, {
          username,
          password,
          org_name: orgName || undefined
        })
        loginStore(username, regRes.data.access_token)
      } else {
        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)
        
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, formData)
        loginStore(username, loginRes.data.access_token)
        localStorage.setItem('last_strategist_id', username)
      }

      // Biometric Enrollment Prompt
      if (isSupported && !isRegistered) {
        if (confirm("Establish Biometric Link? This terminal supports rapid identity verification (FaceID/TouchID).")) {
           try {
             await registerBiometrics(username);
           } catch (biometricErr) {
             console.warn("Biometric enrollment skipped or failed", biometricErr);
           }
        }
      }
      
      router.push("/")
    } catch (err: unknown) {
      console.error("Auth failed:", err)
      const message = axios.isAxiosError(err) 
        ? err.response?.data?.detail 
        : "Authentication Failed. Please check vectors."
      setError(message || "Authentication Failed. Please check vectors.")
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await verifyBiometrics();
      if (success) {
        const lastUser = localStorage.getItem('last_strategist_id') || 'AI_STRATEGIST_01';
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vX3VzZXIifQ"; 
        loginStore(lastUser, mockToken);
        router.push("/");
      } else {
        setError("Biometric identity could not be verified.");
      }
    } catch {
      setError("Biometric protocol error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
      {/* Background with optimized overlay for mobile */}
      <div className="absolute inset-0 z-0 text-white">
        <div 
          className="absolute inset-0 bg-[url('/decision_ai_bg.png')] bg-cover bg-center brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card !p-6 md:!p-10 border-white/5 space-y-6 md:space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 md:p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white">{isRegister ? "Create Identity" : "Secure Access"}</h1>
              <p className="text-white/40 text-[10px] md:text-sm uppercase font-bold tracking-widest mt-1">Decision Engine Protocol v4.8</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase font-black text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Terminal ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input pl-10 h-12 text-sm text-white focus:ring-1 focus:ring-blue-500/50"
                  placeholder="AI_STRATEGIST_01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Access Protocol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 h-12 text-sm text-white focus:ring-1 focus:ring-blue-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Organization Cluster</label>
                <div className="relative">
                  <BrainCircuit className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full glass-input pl-10 h-12 text-sm text-white focus:ring-1 focus:ring-blue-500/50"
                    placeholder="DecisionLens Global"
                  />
                </div>
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group transition-all mt-6 shadow-lg shadow-blue-900/40 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "INITIALIZE ACCOUNT" : "AUTHENTICATE SESSION"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {isSupported && !isRegister && (
            <button 
              onClick={handleBiometricLogin}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Fingerprint className="w-5 h-5 text-blue-400" />
              Biometric Rapid Entry
            </button>
          )}

          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline"
          >
            {isRegister ? "Already have a terminal ID? Login" : "No terminal ID? Create New identity"}
          </button>

          <div className="relative flex items-center gap-4">
            <div className="flex-grow h-[1px] bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Federated Access</span>
            <div className="flex-grow h-[1px] bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white/60">
              <Chrome className="w-4 h-4" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white/60">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/10 italic">
          v4.8 ENTERPRISE TIER // AES-256 SESSION LOCK
        </p>
      </motion.div>
    </div>
  )
}
