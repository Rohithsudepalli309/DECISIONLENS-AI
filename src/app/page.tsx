"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { DecisionStepper, DecisionData } from "@/components/DecisionStepper"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, Zap, Shield, ArrowRight, HomeIcon } from "lucide-react"

import axios from "axios"
import { ResultDashboard } from "@/components/ResultDashboard"
import { VisionPanel } from "@/components/VisionPanel"

interface DecisionResults {
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
  const [view, setView] = useState<"hero" | "stepper" | "results">("hero")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DecisionResults | null>(null)

  const handleAnalyze = async (formData: DecisionData) => {
    setLoading(true)
    try {
      const response = await axios.post("http://127.0.0.1:8000/decision/recommend", formData)
      setResults(response.data)
      setView("results")
    } catch (error) {
      console.error("Simulation failed:", error)
      alert("Failed to connect to decision engine. Ensure backend is running.")
    } finally {
      setLoading(false)
    }
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
            className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                <Zap className="w-3 h-3" />
                ULTIMATE TIER ACTIVATED
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Intelligence <br />
                <span className="text-blue-500">Augmented.</span>
              </h1>
              <p className="text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
                Unlock deterministic precision in strategic planning. DecisionLens AI combines 70+ world-class MCDA algorithms with real-time Monte Carlo simulations.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setView("stepper")}
                  className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-2 group transition-all"
                >
                  New Simulation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.location.href = "/history"}
                  className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                >
                  Audit History
                </button>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <div className="glass-card flex flex-col gap-6 relative z-10 border-white/5 group-hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Engine Status</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time optimization active</p>
                  </div>
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>

                <div className="space-y-3">
                  {[
                    { label: "pyDecision Core", status: "v2.4.1", color: "blue", active: true },
                    { label: "Neural Forecaster", status: "v0.9.8", color: "purple", active: true },
                    { label: "Monte Carlo Engine", status: "v4.2.0", color: "orange", active: true }
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

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[8px] text-white/20 font-black tracking-[0.3em] uppercase">system stable // 12ms</span>
                  </div>
                  <div className="text-[8px] text-white/20 font-black tracking-[0.3em] uppercase">
                    tier: ultimate
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full group-hover:bg-purple-600/20 transition-all" />
            </motion.div>
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
                <h2 className="text-4xl font-black uppercase tracking-tighter italic italic">Simulation Results</h2>
                <p className="text-white/40">Generated by TOPSIS Ranking Engine v4.8</p>
              </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => window.open(`http://127.0.0.1:8000/decision/export/latest`, '_blank')} 
                className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Export PDF
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
    </main>
  )
}
