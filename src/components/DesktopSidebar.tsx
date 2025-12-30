"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  History, 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  BrainCircuit,
  LogOut,
  User
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useHaptics } from '@/hooks/useHaptics'

export const DesktopSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const haptics = useHaptics()
  const { user, logout } = useAuthStore()

  if (pathname === '/login') return null

  const navItems = [
    { name: "Engine", href: "/", icon: Zap },
    { name: "Statistics", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Scenario", href: "/new", icon: PlusCircle },
    { name: "Audit Archives", href: "/history", icon: History },
  ]

  const handleLogout = () => {
    if (confirm("Sign off from this terminal?")) {
      logout()
      router.push('/login')
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-20 h-screen fixed left-0 top-0 bg-black/40 border-r border-white/5 backdrop-blur-3xl z-40 transition-all duration-500 hover:w-72 group">
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <span className="text-sm font-black italic tracking-tighter uppercase text-white">
            Decision<span className="text-blue-500">Lens</span>
          </span>
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.3em]">Neural Station</span>
        </div>
      </div>

      {/* Navigation Rails */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => {
                haptics.light()
                router.push(item.href)
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group/item ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'} transition-transform`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="sidebarIndicator" 
                  className="absolute right-0 w-1 h-6 bg-blue-500 rounded-l-full" 
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* User & Settings Rail */}
      <div className="mx-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <span className="text-[10px] font-black text-white/80 uppercase truncate">{user?.username || 'Strategist'}</span>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{user?.org_name || 'Global HQ'}</span>
          </div>
        </div>
        
        <div className="h-[1px] bg-white/10" />
        
        <button 
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-4 text-white/20 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Operations</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 text-red-500/40 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign Off</span>
        </button>
      </div>

      {/* Status Dot */}
      <div className="absolute bottom-4 right-4 p-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
      </div>
    </aside>
  )
}
