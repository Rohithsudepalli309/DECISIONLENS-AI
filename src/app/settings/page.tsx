"use client"

import React from "react"
import { Navbar } from "@/components/Navbar"
import { useDecisionStore } from "@/store/useDecisionStore"
import { Shield, RefreshCw, Save, Cpu, Globe } from "lucide-react"
import { Toast, ToastType } from "@/components/Toast"

export default function SettingsPage() {
  const { guardrails, setGuardrails } = useDecisionStore()
  const [localGuardrails, setLocalGuardrails] = React.useState(guardrails)
  const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  const handleSave = () => {
    setGuardrails(localGuardrails)
    showToast("Simulation Guardrails Updated", "success")
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-12 px-4 md:px-8">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">Engine Settings</h1>
          <p className="text-sm text-white/40">Configure administrative guardrails and simulation fidelity</p>
        </div>

        <div className="grid gap-6 md:gap-8">
          <section className="glass-card !p-5 md:!p-8 space-y-6 md:space-y-8">
            <div className="flex items-start md:items-center gap-4">
               <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                 <Shield className="w-5 h-5 md:w-6 md:h-6" />
               </div>
               <div>
                 <h3 className="font-bold flex flex-wrap items-center gap-2 text-sm md:text-base">
                   Simulation Guardrails
                   <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Enterprise Tier</span>
                 </h3>
                 <p className="text-[10px] md:text-xs text-white/40 leading-relaxed">Control the computational depth and risk tolerance thresholds for the neural engine.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Iteration Count</label>
                    <span className="text-xs md:text-sm font-mono font-black text-blue-400">{localGuardrails.iterations}</span>
                  </div>
                  <input 
                    type="range" min="100" max="10000" step="100"
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={localGuardrails.iterations}
                    onChange={(e) => setLocalGuardrails({...localGuardrails, iterations: Number(e.target.value)})}
                  />
                  <p className="text-[8px] text-white/20 italic leading-tight">Higher iterations increase precision but may impact real-time responsiveness on mobile.</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Confidence Level</label>
                    <span className="text-xs md:text-sm font-mono font-black text-green-400">{(localGuardrails.confidenceLevel * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.80" max="0.99" step="0.01"
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-green-500"
                    value={localGuardrails.confidenceLevel}
                    onChange={(e) => setLocalGuardrails({...localGuardrails, confidenceLevel: Number(e.target.value)})}
                  />
                  <p className="text-[8px] text-white/20 italic leading-tight">Statistical significance threshold for predictive insights and volatility alerts.</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Volatility Threshold</label>
                    <span className="text-xs md:text-sm font-mono font-black text-orange-400">{(localGuardrails.volatilityThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.01" max="0.30" step="0.01"
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    value={localGuardrails.volatilityThreshold}
                    onChange={(e) => setLocalGuardrails({...localGuardrails, volatilityThreshold: Number(e.target.value)})}
                  />
                  <p className="text-[8px] text-white/20 italic leading-tight">Sensitivity limit before Rank Stability is flagged as &apos;Risky&apos; in dashboards.</p>
               </div>
            </div>
          </section>

          <footer className="grid grid-cols-2 gap-4">
             <div className="glass-card !p-4 flex items-center gap-3">
                <div className="p-2 rounded bg-white/5 text-white/40">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">App Version</p>
                  <p className="text-[10px] font-mono font-bold">v1.2.4-PRO</p>
                </div>
             </div>
             <div className="glass-card !p-4 flex items-center gap-3">
                <div className="p-2 rounded bg-white/5 text-white/40">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Deployment</p>
                  <p className="text-[10px] font-mono font-bold">Edge-Android</p>
                </div>
             </div>
          </footer>

          <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-4">
             <button 
               onClick={() => setLocalGuardrails(guardrails)}
               className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all uppercase tracking-widest"
             >
               <RefreshCw className="w-3 h-3" /> Revert
             </button>
             <button 
               onClick={handleSave}
               className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all"
             >
               <Save className="w-4 h-4" /> Apply Guardrails
             </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </main>
  )
}
