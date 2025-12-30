"use client"

import React from "react"
import { motion } from "framer-motion"
import { Zap, History, LayoutDashboard, PlusCircle, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useHaptics } from "@/hooks/useHaptics"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const haptics = useHaptics()

  if (pathname === "/login") return null

  const tabs = [
    { name: "Engine", href: "/", icon: Zap },
    { name: "Stats", href: "/dashboard", icon: LayoutDashboard },
    { name: "New", href: "/new", icon: PlusCircle, primary: true },
    { name: "Archive", href: "/history", icon: History },
    { name: "Config", href: "/settings", icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/60 backdrop-blur-2xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-6 h-16 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <button
              key={tab.name}
              onClick={() => {
                haptics.light()
                router.push(tab.href)
              }}
              className={`relative flex flex-col items-center gap-1 transition-all flex-1 ${
                isActive ? "text-blue-400" : "text-white/40"
              } ${tab.primary ? "-mt-8" : ""}`}
            >
              {tab.primary ? (
                <div className="bg-blue-600 rounded-full p-4 shadow-xl shadow-blue-500/30 ring-4 ring-black/40 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
                    {tab.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"
                    />
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
