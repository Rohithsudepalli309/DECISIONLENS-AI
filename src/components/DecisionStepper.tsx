"use client"

import React from "react"
import { useDecisionStore } from "@/store/useDecisionStore"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, IndianRupee, Activity, Check, Cloud, Database } from "lucide-react"
import { useHaptics } from "@/hooks/useHaptics"

import { DecisionData, OptionItem } from "@/types/decision"

export function DecisionStepper({ onAnalyze }: { onAnalyze: (data: DecisionData) => void }) {
  const { formData, setFormData, currentStep: step, setStep, syncFromExternal } = useDecisionStore();
  const { light, medium, success, error } = useHaptics();
  
  // Hydration check to prevent mismatch
  const hasHydrated = useDecisionStore(s => s.hasHydrated)
  if (!hasHydrated) return null

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { 
        name: `Alternative ${String.fromCharCode(65 + formData.options.length)}`, 
        parameters: { base_cost: 10000, risk: 0.1, availability: 0.95 } 
      }]
    })
  }

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    })
  }

  const updateOption = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.options]
    if (field === "name") {
      newOptions[index].name = value as string
    } else {
      const paramField = field as keyof OptionItem["parameters"]
      newOptions[index].parameters[paramField] = value as number
    }
    setFormData({ ...formData, options: newOptions })
  }

  const updateWeight = (index: number, value: number) => {
    const newWeights = [...(formData.weights || [0.4, 0.4, 0.2])]
    newWeights[index] = value / 5 // Convert 1-5 to a rough weighting
    
    // Normalize weights
    const sum = newWeights.reduce((a, b) => a + b, 0)
    const normalized = newWeights.map(w => w / sum)
    
    setFormData({ ...formData, weights: normalized })
  }

  const nextStep = () => {
    medium()
    setStep(step + 1)
  }
  const prevStep = () => {
    light()
    setStep(step - 1)
  }

  const handleAnalyze = () => {
    success()
    onAnalyze(formData)
  }

  return (
    <div 
      className="max-w-xl mx-auto mt-6 md:mt-12"
      role="region"
      aria-label="Decision Logic Configuration"
    >
      <div className="flex justify-between mb-8 md:mb-12 relative px-2 md:px-4">
        <div className="absolute top-4 left-0 right-0 h-[1px] bg-white/5 -z-10" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 md:gap-3">
            <motion.div 
              animate={{ 
                scale: step === s ? 1.1 : 1,
                borderColor: step >= s ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 0.1)"
              }}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border-2 transition-all bg-[#050505] shadow-2xl ${
                step >= s ? "text-blue-400" : "text-white/20"
              }`}
            >
              {step > s ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <span className="text-[10px] md:text-xs font-black">{s}</span>}
            </motion.div>
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] ${
              step >= s ? "text-blue-400" : "text-white/20"
            }`}>
              {s === 1 ? "Goal" : s === 2 ? "Options" : s === 3 ? "Limits" : "Weights"}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card min-h-[400px] md:min-h-[450px] flex flex-col justify-between p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow"
          >
            {step === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-xs md:text-sm font-medium text-white/60 mb-2 block">Decision Domain</label>
                  <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
                  value={formData.domain}
                  onChange={(e) => {
                    const domain = e.target.value
                    let options = formData.options
                    if (domain === "Energy Transition") {
                      options = [
                        { name: "Offshore Wind Alpha", parameters: { base_cost: 45000, risk: 0.15, availability: 0.85 } },
                        { name: "Next-Gen Nuclear", parameters: { base_cost: 95000, risk: 0.05, availability: 0.98 } }
                      ]
                    } else if (domain === "Supply Chain Resiliency") {
                      options = [
                        { name: "Near-Shoring Hub", parameters: { base_cost: 25000, risk: 0.08, availability: 0.95 } },
                        { name: "Distributed Buffer", parameters: { base_cost: 15000, risk: 0.25, availability: 0.99 } }
                      ]
                    } else if (domain === "cloud") {
                      options = [
                        { name: "Alternative A", parameters: { base_cost: 8000, risk: 0.1, availability: 0.99 } },
                        { name: "Alternative B", parameters: { base_cost: 12000, risk: 0.05, availability: 0.999 } }
                      ]
                    } else if (domain === "custom") {
                      options = [
                        { name: "Alternative A", parameters: { base_cost: 10000, risk: 0.1, availability: 0.95 } },
                        { name: "Alternative B", parameters: { base_cost: 10000, risk: 0.1, availability: 0.95 } }
                      ]
                    }
                    setFormData({ ...formData, domain, options })
                  }}
                >
                  <option value="cloud">Cloud Infrastructure</option>
                  <option value="Energy Transition">Energy Transition (Renewables/Grid)</option>
                  <option value="Supply Chain Resiliency">Supply Chain Resiliency</option>
                  <option value="custom">Custom Strategic Domain</option>
                </select>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-white/60 mb-2 block">Intelligence Methodology</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'topsis', name: 'TOPSIS', desc: 'Efficiency focus' },
                      { id: 'ahp', name: 'AHP', desc: 'Subjective priority' }
                    ].map((algo) => (
                      <div 
                        key={algo.id}
                        onClick={() => setFormData({ ...formData, algorithm: algo.id as 'topsis' | 'ahp' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.algorithm === algo.id 
                            ? "bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <p className="text-xs font-black uppercase text-white">{algo.name}</p>
                        <p className="text-[10px] text-white/40">{algo.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-white/60 mb-2 block">Primary Goal</label>
                  <textarea 
                    className="w-full glass-input h-24 md:h-32 resize-none text-sm"
                    placeholder="Describe your objective..."
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/40">Alternatives</h3>
                  <button onClick={addOption} className="text-[8px] md:text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full border border-blue-400/20 hover:bg-blue-600/40 transition-all font-black uppercase">
                    + ADD OPTION
                  </button>
                </div>
                <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto space-y-4 pr-1 md:pr-2">
                  {formData.options.map((opt, i) => (
                    <div key={i} className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 relative group">
                      <button 
                        onClick={() => removeOption(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-400 rounded-full border border-red-500/40 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                      <input 
                        className="bg-transparent border-none text-white font-bold w-full mb-3 focus:outline-none text-sm"
                        value={opt.name}
                        onChange={(e) => updateOption(i, "name", e.target.value)}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div>
                          <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold mb-1">Base Cost</p>
                          <input 
                            type="number" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono"
                            value={opt.parameters.base_cost}
                            onChange={(e) => updateOption(i, "base_cost", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold mb-1">Risk (0-1)</p>
                          <input 
                            type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono"
                            value={opt.parameters.risk}
                            onChange={(e) => updateOption(i, "risk", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold mb-1">Reliability</p>
                          <input 
                            type="number" step="0.001" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono"
                            value={opt.parameters.availability}
                            onChange={(e) => updateOption(i, "availability", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div className="p-3 md:p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <IndianRupee className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-bold uppercase tracking-tight">Total Budget Ceiling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          medium();
                          syncFromExternal('cloud', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
                            .then(() => success())
                            .catch(() => error());
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-[8px] font-black text-blue-400 uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                      >
                        <Cloud className="w-2.5 h-2.5" />
                        Sync from AWS
                      </button>
                      <span className="text-[10px] md:text-sm font-mono">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.constraints.max_cost)}</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="5000" max="100000" step="1000"
                    className="w-full accent-blue-500"
                    value={formData.constraints.max_cost}
                    onChange={(e) => setFormData({
                      ...formData, 
                      constraints: { ...formData.constraints, max_cost: Number(e.target.value) }
                    })}
                  />
                </div>

                <div className="p-3 md:p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Activity className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-bold uppercase tracking-tight">Min Availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => {
                           medium();
                           syncFromExternal('market', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
                             .then(() => success())
                             .catch(() => error());
                         }}
                         className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 text-[8px] font-black text-purple-400 uppercase border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                       >
                         <Database className="w-2.5 h-2.5" />
                         Sync from ERP
                       </button>
                       <span className="text-[10px] md:text-sm font-mono">{(formData.constraints.min_availability * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="0.8" max="0.9999" step="0.0001"
                    className="w-full accent-purple-500"
                    value={formData.constraints.min_availability}
                    onChange={(e) => setFormData({
                      ...formData, 
                      constraints: { ...formData.constraints, min_availability: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 md:space-y-4">
                 <p className="text-[10px] md:text-sm text-white/60 mb-2 md:mb-4">Engine weighting for multicriteria optimization.</p>
                  {[
                    { id: "cost", label: "Cost Minimization", index: 0 },
                    { id: "reliability", label: "System Reliability", index: 1 },
                    { id: "risk", label: "Risk Tolerance", index: 2 }
                  ].map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 gap-3">
                      <span className="text-xs md:text-sm font-medium">{item.label}</span>
                      <div className="flex gap-1 md:gap-2">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const currentVal = Math.round((formData.weights?.[item.index] || 0.33) * 5)
                          return (
                            <div 
                              key={lvl} 
                              onClick={() => updateWeight(item.index, lvl)}
                              className={`flex-1 min-w-[44px] h-11 md:w-10 md:h-10 rounded-lg md:rounded-xl border flex items-center justify-center text-[10px] md:text-xs cursor-pointer transition-all ${
                                lvl === currentVal ? "bg-blue-600/40 border-blue-400 text-white font-black shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                              }`}
                            >
                              {lvl}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-6 md:pt-8 border-t border-white/10 gap-4 mt-4">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white disabled:opacity-0 transition-all font-black uppercase rounded-lg border border-transparent hover:border-white/10"
          >
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          {step < 4 ? (
            <button 
              onClick={nextStep}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 uppercase"
            >
              NEXT <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleAnalyze}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/20 hover:scale-[1.02] rounded-lg text-xs font-black shadow-lg shadow-blue-900/40 transition-all uppercase tracking-widest"
            >
              🚀 Analyze Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
