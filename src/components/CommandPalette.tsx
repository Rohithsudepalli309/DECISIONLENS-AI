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
import { Search, History, Brain, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api-config"
import { useAuthStore } from "@/store/useAuthStore"
import { useDecisionStore } from "@/store/useDecisionStore"
import { DecisionResults } from "@/store/useDecisionStore"

interface OptionItem {
  name: string;
  parameters: {
    base_cost: number;
    risk: number;
    availability: number;
  };
}

interface AuditItem {
  id: number
  timestamp: string
  goal: string
  domain: string
  recommended_option: string
  score: number
  constraints?: {
    max_cost: number;
    min_availability: number;
  }
  preferences?: string[]
  strategy?: string
  simulation_results?: Array<{
    option: string;
    score: number;
    metrics: unknown;
    simulation: unknown;
  }>
  options?: OptionItem[]
  weights?: number[]
  sensitivity?: unknown
}

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, user } = useAuthStore()
  const [historyActions, setHistoryActions] = React.useState<Action[]>([])
  
  const staticActions: Action[] = [
    {
      id: "home",
      name: "Strategy Engine",
      shortcut: ["h"],
      keywords: "back home landing",
      perform: () => router.push("/"),
      icon: <Zap className="w-4 h-4" />,
      section: "Navigation"
    },
    {
      id: "history",
      name: "Intelligence Archive",
      shortcut: ["g", "h"],
      keywords: "history logs archive audits",
      perform: () => router.push("/history"),
      icon: <History className="w-4 h-4" />,
      section: "Navigation"
    },
    {
      id: "simulation",
      name: "New Strategic Simulation",
      shortcut: ["n"],
      keywords: "new create start decision",
      perform: () => {
        router.push("/")
        useDecisionStore.getState().setView("stepper")
      },
      icon: <Brain className="w-4 h-4" />,
      section: "Operations"
    }
  ]

  React.useEffect(() => {
    if (!isLoggedIn || !user) {
      setHistoryActions([])
      return
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/decision/history`, {
          params: { user_id: user.id }
        })
        const audits = response.data.slice(0, 10)
        const actions: Action[] = audits.map((audit: AuditItem) => ({
          id: `audit-${audit.id}`,
          name: audit.goal.length > 40 ? audit.goal.substring(0, 40) + "..." : audit.goal,
          keywords: `${audit.domain} archive research`,
          perform: () => {
             useDecisionStore.getState().setFormData({
               domain: audit.domain,
               goal: audit.goal,
               constraints: audit.constraints || { max_cost: 0, min_availability: 0 },
               preferences: audit.preferences || [],
               options: audit.options || [],
               weights: audit.weights || []
             })
             if (audit.simulation_results) {
               useDecisionStore.getState().setResults({
                 strategy: audit.strategy || "TOPSIS",
                 domain: audit.domain,
                 ranked_options: audit.simulation_results.map((r) => ({
                   option: r.option,
                   topsis_score: r.score,
                   metrics: r.metrics
                 })),
                 simulations: audit.simulation_results.map((r) => ({
                   option: r.option,
                   simulation: r.simulation
                 })),
                 disclaimer: "Enterprise Intelligence Core. Restored from Vault.",
                 sensitivity: audit.sensitivity
               } as DecisionResults)
               useDecisionStore.getState().setView("results")
             } else {
               useDecisionStore.getState().setView("stepper")
             }
             router.push("/")
          },
          icon: <History className="w-4 h-4 text-blue-400/60" />,
          section: "Intelligence Vault"
        }))
        setHistoryActions(actions)
      } catch (error) {
        console.error("KBar history fetch failed", error)
      }
    }

    fetchHistory()
  }, [isLoggedIn, user, router])

  return (
    <KBarProvider actions={[...staticActions, ...historyActions]}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md p-2 md:p-4">
          <KBarAnimator className="w-full max-w-[600px] glass-card !p-0 overflow-hidden shadow-2xl border border-white/10 mt-20 md:mt-0">
            <div className="flex items-center gap-3 px-4 border-b border-white/5">
              <Search className="w-5 h-5 text-white/20" />
              <KBarSearch className="w-full bg-transparent border-none py-4 text-sm text-white focus:outline-none placeholder:text-white/20" placeholder="Type a command or search..." />
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-white/20 bg-white/5 px-2 py-1 rounded tracking-tighter">
                ESC
              </div>
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
