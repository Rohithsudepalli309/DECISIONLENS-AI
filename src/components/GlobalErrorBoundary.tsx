"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Terminal, ShieldAlert } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL RUNTIME EXCEPTION:", error, errorInfo)
  }

  private handleReset = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[500] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass border-red-500/20 p-8 space-y-8 relative z-10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">System Breach Detected</h2>
                <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em]">Critical Engine Runtime Exception</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 font-mono text-[10px] text-red-200/60 overflow-auto max-h-40">
              <div className="flex items-center gap-2 mb-2 text-red-500 font-bold">
                <Terminal className="w-3 h-3" />
                <span>STACK_TRACE_SNAPSHOT</span>
              </div>
              {this.state.error?.stack || this.state.error?.message || "Unknown hardware failure."}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white/60 leading-relaxed">
                DecisionLens AI encountered a mathematical anomaly that destabilized the local runtime. Your simulation data has been safely isolated.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  Perform Safe Restore
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Hot Reload Engine
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
              <span>Stability Kernel v1.0.4</span>
              <span>Hardware Error: 0x827_CRIT</span>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
