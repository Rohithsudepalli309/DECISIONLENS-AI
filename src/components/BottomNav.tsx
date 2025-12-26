"use client"

import React from "react"
import { motion } from "framer-motion"
import { Zap, History, Settings, Activity, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useHaptics } from "@/hooks/useHaptics"

export function BottomNav() {
  const pathname = usePathname()
  const { light } = useHaptics()

  if (pathname === "/login") return null

  const tabs = [
    { name: "Engine", href: "/", icon: Zap },
    { name: "Archive", href: "/history", icon: History },
    { name: "Sims", href: "/simulations", icon: Activity },
    { name: "Docs", href: "/docs", icon: FileText },
    { name: "Config", href: "/settings", icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-4 mb-4 glass bg-black/60 backdrop-blur-2xl border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-2xl">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          
          return (
            <Link 
              key={tab.name}
              href={tab.href}
              onClick={() => light()}
              className="relative flex-1 flex flex-col items-center gap-1 group py-1"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <tab.icon 
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? "text-blue-400 scale-110" : "text-white/40 group-hover:text-white/60"
                }`} 
              />
              
              <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? "text-white" : "text-white/20"
              }`}>
                {tab.name}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="indicator"
                  className="w-1 h-1 rounded-full bg-blue-500 absolute -bottom-1"
                />
              )}
            </Link>
          )
        })}
      </div>
      {/* Safe Area Spacer for iOS Home Indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-black/60" />
    </nav>
  )
}
