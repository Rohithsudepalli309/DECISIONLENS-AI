"use client"

import React from "react"
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults
} from "kbar"
import type { Action } from "kbar"
import { Search, Home, History, Brain } from "lucide-react"
export function CommandPalette({ children }: { children: React.ReactNode }) {
  const actions: Action[] = [
    {
      id: "home",
      name: "Home",
      shortcut: ["h"],
      keywords: "back home landing",
      perform: () => (window.location.href = "/"),
      icon: <Home className="w-4 h-4" />
    },
    {
      id: "history",
      name: "Audit History",
      shortcut: ["g", "h"],
      keywords: "history logs archive audits",
      perform: () => (window.location.href = "/history"),
      icon: <History className="w-4 h-4" />
    },
    {
      id: "simulation",
      name: "New Simulation",
      shortcut: ["n"],
      keywords: "new create start decision",
      perform: () => (window.location.href = "/?view=stepper"),
      icon: <Brain className="w-4 h-4" />
    }
  ]

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm p-4">
          <KBarAnimator className="w-full max-w-[600px] glass-card !p-0 overflow-hidden shadow-2xl border border-white/10">
            <div className="flex items-center gap-3 px-4 border-b border-white/5">
              <Search className="w-5 h-5 text-white/20" />
              <KBarSearch className="w-full bg-transparent border-none py-4 text-sm text-white focus:outline-none placeholder:text-white/20" placeholder="Type a command or search..." />
              <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-1 rounded tracking-tighter">ESC</span>
            </div>
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  )
}

function RenderResults() {
  const { results } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }: { item: Action | string; active: boolean }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-white/20">{item}</div>
        ) : (
          <div className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
            active ? "bg-blue-600/20" : "hover:bg-white/5"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${active ? "bg-blue-600 text-white" : "bg-white/5 text-white/40"}`}>
                {item.icon}
              </div>
              <span className={`text-sm font-bold ${active ? "text-white" : "text-white/60"}`}>{item.name}</span>
            </div>
            {item.shortcut?.length && (
               <div className="flex gap-1">
                 {item.shortcut.map((s: string) => (
                   <kbd key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">{s}</kbd>
                 ))}
               </div>
            )}
          </div>
        )
      }
    />
  )
}
