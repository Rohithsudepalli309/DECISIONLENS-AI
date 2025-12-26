"use client"

import React from "react"
import { BrainCircuit, Command, Menu, X, History, Settings, FileText, Activity, Zap, Globe } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api-config"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageToggle } from "./LanguageToggle"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthStore()

  const handleLogout = () => {
    if (confirm("Disconnect session? Unsaved simulation parameters will be lost.")) {
      logout()
      setIsMobileMenuOpen(false)
      router.push("/login")
    }
  }

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

  // Close menu on navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (pathname === "/login") return null

  const navLinks = [
    { name: "Engine", href: "/", icon: Zap },
    { name: "Simulations", href: "#", icon: Activity },
    { name: "Audit Log", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Docs", href: "#", icon: FileText },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 md:p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/40 transition-all">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <span className="text-lg md:text-xl font-black italic tracking-tighter uppercase text-white">
              Decision<span className="text-blue-500">Lens</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`transition-colors hover:text-white ${pathname === link.href ? 'text-blue-400' : 'text-white/40'}`}
              >
                {link.name}
              </Link>
            ))}
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
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Assigned Station</span>
                  <span className="text-[10px] font-bold text-blue-400 font-mono leading-none uppercase">{user?.terminalId}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:block px-6 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20 transition-all"
                >
                  Sign Off
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden sm:block px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Access
              </Link>
            )}

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white md:hidden transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden transition-all duration-500 ${
        isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      }`}>
        <div className="pt-24 px-8 space-y-8">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-4 group"
              >
                <div className={`p-3 rounded-xl border transition-all ${
                  pathname === link.href ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <span className={`text-2xl font-black uppercase tracking-tighter italic transition-all ${
                  pathname === link.href ? 'text-white' : 'text-white/40'
                }`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
             {isLoggedIn ? (
                 <div className="flex flex-col gap-6">
                 <div className="flex gap-4 items-center">
                    <div className="flex-1">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Operations Terminal</span>
                       <span className="text-lg font-bold text-blue-400 font-mono uppercase italic leading-none">{user?.terminalId}</span>
                    </div>
                    <div className="h-10 w-px bg-white/5" />
                    <div className="flex-1">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Network Layer</span>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                          <span className="text-xs font-bold text-white/60 uppercase">{status}</span>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest shadow-xl shadow-red-900/20"
                 >
                  TERMINAL LOGOUT
                 </button>
               </div>
             ) : (
                <Link 
                  href="/login"
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-center block uppercase tracking-widest shadow-xl shadow-blue-900/20"
                >
                  ACCESS TERMINAL
                </Link>
             )}
          </div>
        </div>
      </div>
    </>
  )
}
