"use client"

import React from "react"
import { BrainCircuit, Command } from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname === "/login") return null

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 transition-all duration-300 ${
      isScrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/40 transition-all">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase text-white">
            Decision<span className="text-blue-500">Lens</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <Link href="#" className="hover:text-blue-400 transition-colors text-white/40 hover:text-white">Engine</Link>
          <Link href="#" className="hover:text-blue-400 transition-colors text-white/40 hover:text-white">Simulations</Link>
          <Link href="/history" className="hover:text-blue-400 transition-colors text-white/40 hover:text-white">Audit Log</Link>
          <Link href="#" className="hover:text-blue-400 transition-colors text-white/40 hover:text-white">Docs</Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/20">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
          <Link 
            href="/login"
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Terminal Access
          </Link>
        </div>
      </div>
    </nav>
  )
}
