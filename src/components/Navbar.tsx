"use client"

import React from "react"
import { BrainCircuit, Command, Zap, Globe, CloudCheck, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useDecisionStore } from "@/store/useDecisionStore"
import axios from "axios"
import { API_BASE_URL, APP_ENV } from "@/lib/api-config"
import { ThemeToggle } from "./ThemeToggle"
import { useI18n } from "@/hooks/useI18n"
import { LanguageToggle } from "./LanguageToggle"

export function Navbar() {
  const { t } = useI18n()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { isLoggedIn, user } = useAuthStore()
  const { isSyncing } = useDecisionStore()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const [status, setStatus] = React.useState<'online' | 'offline' | 'degraded'>('online')
  const [latency, setLatency] = React.useState<number | null>(null)

  // Status HUD Logic
  React.useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now()
      try {
        const res = await axios.get(`${API_BASE_URL}/health`)
        setLatency(Date.now() - start)
        setStatus(res.data.status === 'healthy' ? 'online' : 'degraded')
      } catch {
        setStatus('offline')
        setLatency(null)
      }
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {status === 'offline' && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-red-600 text-white py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-center md:pl-64 group-hover:md:pl-72 transition-all duration-500">
          Neural Link Severed // Operating in Offline Mode
        </div>
      )}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300 md:left-64 group-hover:md:left-72 ${
        isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      } ${status === 'offline' ? 'mt-8' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group md:hidden">
            <div className="p-1.5 md:p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/40 transition-all">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <span className="text-lg md:text-xl font-black italic tracking-tighter uppercase text-white">
              Decision<span className="text-blue-500">Lens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
            <Zap className="w-3 h-3 text-blue-400" />
            Terminal active // {user?.username}@{user?.org_name || 'LOCAL'}
            <div className={`px-2 py-0.5 rounded border ${
              APP_ENV === 'production' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
            }`}>
              {APP_ENV}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <div className="hidden sm:flex items-center gap-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Globe className={`w-3 h-3 ${status === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                <div className={`w-1 h-1 rounded-full animate-pulse ${
                  status === 'online' ? 'bg-green-500' : status === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">
                  {status} {latency && `(${latency}ms)`}
                </span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2 text-[10px] font-black text-white/20 tracking-tighter">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  {isSyncing ? (
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  ) : (
                    <CloudCheck className="w-3 h-3 text-blue-400" />
                  )}
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest hidden lg:block">
                    {isSyncing ? t('syncing') : t('sync_stable')}
                  </span>
                </div>
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Status</span>
                  <span className="text-[10px] font-black text-blue-400 font-mono leading-none uppercase">AUTHENTICATED</span>
                </div>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden sm:block px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Access
              </Link>
            )}

            <div className="md:hidden flex items-center gap-2">
               <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
