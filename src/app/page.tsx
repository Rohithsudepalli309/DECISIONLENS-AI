"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { DecisionStepper, DecisionData } from "@/components/DecisionStepper"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BrainCircuit, Zap, Shield, ArrowRight, HomeIcon, 
  BarChart3, Users, History, TrendingUp, Download 
} from "lucide-react"

import axios from "axios"
import { ResultDashboard } from "@/components/ResultDashboard"
import { VisionPanel } from "@/components/VisionPanel"
import { useAuthStore } from "@/store/useAuthStore"
import { useDecisionStore } from "@/store/useDecisionStore"
import { useRouter } from "next/navigation"
import { Toast, ToastType } from "@/components/Toast"

interface DecisionResults {
  id: number;
  strategy: string;
  domain: string;
  ranked_options: {
    option: string;
    topsis_score: number;
    metrics: {
      cost: number;
      availability: number;
      risk: number;
    };
  }[];
  simulations: {
    option: string;
    simulation: {
      cost_dist: number[];
      availability_dist: number[];
      risk_dist: number[];
      expected: {
        cost: number;
        availability: number;
        risk: number;
      };
    };
  }[];
  disclaimer: string;
}

export default function Home() {
  const { isLoggedIn, hasHydrated: authHydrated } = useAuthStore()
  const { 
    activeView: view, 
    setView, 
    results, 
    setResults, 
    hasHydrated: decisionHydrated 
  } = useDecisionStore()
  
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:8001/decision/stats")
      setStats(res.data)
    } catch (err) {
      console.error("Failed to fetch stats", err)
    }
  }

  useEffect(() => {
    if (authHydrated && isLoggedIn) {
      fetchStats()
    }
  }, [authHydrated, isLoggedIn, view])

  useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, authHydrated, router])

  if (!authHydrated || !decisionHydrated || !isLoggedIn) return null

  const handleAnalyze = async (formData: DecisionData) => {
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:8001/decision/recommend", formData)
      setResults(response.data)
      setView("results")
      showToast("Simulation Analysis Complete", "success")
    } catch (error) {
      console.error("Simulation failed:", error)
      showToast("Simulation Protocol Failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = (id: number | string) => {
    window.open(`http://localhost:8001/decision/export/${id}`, '_blank')
    showToast("Executive Report generated", "info")
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 overflow-hidden">
      <Navbar />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
              <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <p className="mt-6 text-sm font-bold tracking-[0.3em] text-blue-400 uppercase animate-pulse">
              Computing Decision Matrix...
            </p>
          </motion.div>
        ) : view === "hero" ? (
          <motion.section 
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 max-w-7xl mx-auto space-y-12"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                  <Zap className="w-3 h-3" />
                  ULTIMATE TIER ACTIVATED
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Command <br />
                  <span className="text-blue-500">Center.</span>
                </h1>
                <p className="text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
                  Welcome back to the Intelligence Hub. Your strategic operations are synchronized and ready for analysis.
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setView("stepper")
                      showToast("Initializing New Simulation Protocol...", "info")
                    }}
                    className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-2 group transition-all"
                  >
                    New Simulation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => router.push("/history")}
                    className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                  >
                    Audit Archive
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Audits", value: stats?.total_audits || 0, icon: History, color: "blue" },
                  { label: "Avg TOPSIS Score", value: `${stats?.avg_score || 0}%`, icon: TrendingUp, color: "green" },
                  { label: "Active Domain", value: stats?.most_active_domain || "N/A", icon: Users, color: "purple" },
                  { label: "Neural Clarity", value: "98.4%", icon: BarChart3, color: "orange" }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card !p-6 border-white/5 hover:border-blue-500/30 transition-all group"
                  >
                    <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-4`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black italic">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Recent Strategic Activity</h2>
                <div className="space-y-4">
                  {stats?.recent_activity?.length > 0 ? (
                    stats.recent_activity.map((activity: any) => (
                      <div 
                        key={activity.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => router.push("/history")}
                      >
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                             <History className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white/90 line-clamp-1">{activity.goal}</p>
                             <p className="text-[10px] text-white/20 font-black uppercase">{new Date(activity.timestamp).toLocaleString()}</p>
                           </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/0 group-hover:text-white/40 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center glass-card border-dashed border-white/5">
                      <p className="text-white/20 text-sm font-bold italic">No recent activity detected in the grid.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Engine Core Status</h2>
                <div className="glass-card flex flex-col gap-6 relative z-10 border-white/5 hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tighter italic">Optimization Live</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time parameters active</p>
                    </div>
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "pyDecision Core", status: "v2.4.1", color: "blue" },
                      { label: "Neural Forecaster", status: "v0.9.8", color: "purple" },
                      { label: "Monte Carlo Engine", status: "v4.2.0", color: "orange" }
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group/item hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-1 rounded-full bg-${item.color}-500 group-hover/item:scale-150 transition-all`} />
                          <span className="text-xs font-bold uppercase tracking-widest text-white/60">{item.label}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border border-${item.color}-500/30 bg-${item.color}-500/10 text-${item.color}-400`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        ) : view === "stepper" ? (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
          >
            <button 
              onClick={() => setView("hero")}
              className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              <HomeIcon className="w-4 h-4" /> Reset to Home
            </button>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Initialize Intelligence</h2>
              <p className="text-white/40">Configure your decision parameters for the high-performance engine.</p>
            </div>
            <DecisionStepper onAnalyze={handleAnalyze} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Simulation Results</h2>
                <p className="text-white/40">Generated by TOPSIS Ranking Engine v4.8</p>
              </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => exportPDF((results as any)?.id || 'latest')} 
                className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
              <button 
                onClick={() => setView("stepper")}
                className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-all"
              >
                Modify Parameters
              </button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {results && <ResultDashboard results={results} />}
            </div>
            <div>
              <VisionPanel />
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  )
}
