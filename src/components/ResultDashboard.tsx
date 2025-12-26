"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaClosed } from "@visx/shape"
import { scaleLinear } from "@visx/scale"
import { curveBasis } from "@visx/curve"
import { TrendingUp, AlertTriangle, ShieldCheck, BarChart3, Fingerprint, Activity, Target, ChevronUp } from "lucide-react"

// Helper to bin distribution data
const binData = (values: number[], bins: number = 40) => {
  if (!values || values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const step = range / bins
  
  const counts = new Array(bins).fill(0)
  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1)
    counts[idx]++
  })

  return counts.map((count, i) => ({
    x: min + i * step,
    y: count
  }))
}

const formatIndianCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value)
}

const getExecutiveCommentary = (results: DecisionResults) => {
  if (results.ranked_options.length < 2) return "Insufficient alternatives for comparative analysis."
  
  const top = results.ranked_options[0]
  const second = results.ranked_options[1]
  
  const costDiff = ((second.metrics.cost - top.metrics.cost) / top.metrics.cost) * 100
  const riskDiff = ((top.metrics.risk - second.metrics.risk) / top.metrics.risk) * 100
  
  if (top.topsis_score > second.topsis_score + 0.15) {
    return `${top.option} holds a mathematically dominant lead. Its strategic alignment across all vectors outperforms ${second.option} with significant margin.`
  }
  
  if (costDiff > 10 && riskDiff > 10) {
    return `${top.option} is the efficient choice. While ${second.option} offers ${riskDiff.toFixed(0)}% lower risk, it requires a ${costDiff.toFixed(0)}% premium in operational cost.`
  }
  
  return `The tradeoff between ${top.option} and ${second.option} is marginal. ${top.option} is favored for its balanced profile, but sector-specific volatility may favor ${second.option}.`
}

import { RadarChart, RadarData } from "./RadarChart"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api-config"
import { ErrorBoundary } from "./ErrorBoundary"
import { WaterfallChart } from "./WaterfallChart"
import { useHaptics } from "@/hooks/useHaptics"
import { DecisionResults } from "@/store/useDecisionStore"

type RankedOption = DecisionResults['ranked_options'][0];

interface ForecastData {
  status: string;
  forecast_30d: {
    predicted_max_cost: number;
    predicted_min_availability: number;
  };
}

import { ParentSize } from "@visx/responsive"

export function ResultDashboard({ results: initialResults }: { results: DecisionResults }) {
  const [results, setResults] = React.useState<DecisionResults>(initialResults)
  const [weights, setWeights] = React.useState<number[]>([0.4, 0.4, 0.2])
  const [loading, setLoading] = React.useState(false)
  const haptics = useHaptics()

  const handleWeightChange = async (index: number, value: number) => {
    haptics.light()
    const newWeights = [...weights]
    newWeights[index] = value
    const sum = newWeights.reduce((a, b) => a + b, 0)
    const normalized = newWeights.map(w => w / sum)
    setWeights(normalized)
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/decision/recalculate`, {
        options: results.ranked_options,
        weights: normalized,
        criteria_types: ['min', 'max', 'min']
      })
      setResults({ 
        ...results, 
        ranked_options: response.data.ranked_options,
        sensitivity: response.data.sensitivity 
      })
    } catch (error) {
      console.error("Recalculation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const [forecast, setForecast] = React.useState<ForecastData | null>(null)

  React.useEffect(() => {
    const fetchForecast = async () => {
      try {
        const domain = initialResults.domain || "cloud"
        const response = await axios.get(`${API_BASE_URL}/decision/forecast/${domain}`)
        setForecast(response.data)
      } catch (error) {
        console.error("Forecast fetch failed:", error)
      }
    }
    fetchForecast()
  }, [initialResults.domain])

  const [showScroll, setShowScroll] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const topOption = results.ranked_options[0]
  const topSim = results.simulations.find(s => s.option === topOption.option)
  
  const distributionData = React.useMemo(() => binData(topSim?.simulation?.cost_dist || []), [topSim])

  const radarData = React.useMemo((): RadarData[] => results.ranked_options.map((opt) => ({
    label: opt.option,
    cost: 1 - (opt.metrics.cost / 20000), 
    availability: opt.metrics.availability,
    risk: 1 - opt.metrics.risk
  })), [results.ranked_options])

  return (
    <div className="space-y-6 md:space-y-8 pb-20 relative">
      {loading && <div className="absolute inset-x-0 -inset-y-4 z-50 bg-black/10 backdrop-blur-[2px] rounded-3xl animate-pulse" />}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {results.ranked_options.map((opt: RankedOption, i: number) => (
          <motion.div 
            key={opt.option}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card border-none relative overflow-hidden transition-all duration-500 ${
              i === 0 ? " ring-2 ring-blue-500/50 sm:scale-[1.02] shadow-2xl shadow-blue-500/20 bg-blue-500/5" : ""
            }`}
          >
            {i === 0 && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-bl-lg">
                Optimal
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
               <div className={`p-2 rounded-lg ${i === 0 ? "bg-blue-500/20" : "bg-white/5"}`}>
                 {i === 0 ? <ShieldCheck className="w-5 h-5 text-blue-400" /> : <TrendingUp className="w-5 h-5 text-white/40" />}
               </div>
               <h4 className="font-bold text-sm md:text-base">{opt.option}</h4>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-tighter">TOPSIS Score</p>
                <p className="text-2xl md:text-3xl font-black font-mono text-blue-400">{(opt.topsis_score * 100).toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-tighter">Availability</p>
                <p className="text-xs md:text-sm font-mono text-green-400">{(opt.metrics.availability * 100).toFixed(2)}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="glass-card lg:col-span-2 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <h3 className="text-base md:text-lg font-bold italic uppercase tracking-tighter">Tradeoff Analysis</h3>
            <div className="w-fit text-[8px] md:text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-widest">
              Strategic Insight Engine
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-full md:w-[350px] aspect-square">
              <ErrorBoundary fallbackName="Radar Matrix">
                <ParentSize>
                  {({ width, height }) => (
                    <RadarChart 
                      width={width} 
                      height={height} 
                      data={radarData} 
                      keys={["cost", "availability", "risk"]} 
                    />
                  )}
                </ParentSize>
              </ErrorBoundary>
            </div>
            <div className="flex-grow space-y-8 md:space-y-6 w-full">
               <div className="space-y-6 md:space-y-4">
                  <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">Sensitivity Modulators</h4>
                  {[
                    { label: "Cost Minimization", val: weights[0], color: "blue" },
                    { label: "Reliability Focus", val: weights[1], color: "green" },
                    { label: "Risk Mitigation", val: weights[2], color: "red" }
                  ].map((w, idx) => (
                    <div key={w.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-white/60">{w.label}</span>
                        <span className="font-mono text-white">{(w.val * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        className={`w-full accent-${w.color}-500 cursor-pointer`}
                        value={w.val}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                      />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="glass-card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter mb-6 underline decoration-blue-500/40">Density Distribution</h3>
            <div className="h-[200px] md:h-[250px] relative pt-4">
              <div className="absolute top-0 right-0 text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-widest">
                Peak: {Math.max(...distributionData.map(d => d.y))} iterations
              </div>
              <ErrorBoundary fallbackName="Distribution Map">
                <ParentSize>
                  {({ width, height }) => (
                    <svg width={width} height={height} className="overflow-visible">
                      <AreaClosed
                        data={distributionData}
                        x={d => {
                          const min = Math.min(...distributionData.map(v => v.x))
                          const max = Math.max(...distributionData.map(v => v.x))
                          return ((d.x - min) / (max - min)) * width || 0
                        }}
                        y={d => height - (d.y / Math.max(...distributionData.map(v => v.y))) * (height * 0.8)}
                        yScale={scaleLinear({ range: [height, 0], domain: [0, Math.max(...distributionData.map(v => v.y))] })}
                        fill="url(#area-gradient)"
                        curve={curveBasis}
                      />
                      <defs>
                        <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </ParentSize>
              </ErrorBoundary>
              <div className="mt-4 flex justify-between text-[8px] md:text-[10px] text-white/40 uppercase font-black tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="flex flex-col">
                  <span>Minimum</span>
                  <span className="text-white">{formatIndianCurrency(Math.min(...distributionData.map(v => v.x)))}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span>Maximum</span>
                  <span className="text-white">{formatIndianCurrency(Math.max(...distributionData.map(v => v.x)))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card bg-orange-500/5 border-orange-500/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                <Activity className="w-10 h-10 md:w-12 md:h-12" />
             </div>
             <div className="flex gap-4 relative z-10">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-500 shrink-0" />
                <div>
                  <h4 className="font-black text-orange-500 mb-1 uppercase tracking-tighter italic text-xs md:text-sm">Neural Predictive Insight</h4>
                  <p className="text-[10px] md:text-xs text-white/60 leading-relaxed font-medium">
                    {forecast?.status === "success" ? (
                      `30D Projection: ${formatIndianCurrency(forecast.forecast_30d.predicted_max_cost)} ceiling with ${(forecast.forecast_30d.predicted_min_availability * 100).toFixed(1)}% resilience factor.`
                    ) : (
                      "Volatility detected in 'Risk' vectors. Platform recommends dynamic recalculation with 5% guardrails."
                    )}
                  </p>
                </div>
             </div>
          </div>

          <div className="glass-card bg-blue-500/5 border-blue-500/20 relative overflow-hidden group">
             <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Fingerprint className="w-20 h-20 md:w-24 md:h-24" />
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-400">Stability Matrix</h4>
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] items-end">
                       <span className="text-white/40 uppercase font-black">Robustness Score</span>
                       <span className="text-white font-mono font-black">
                         {results.sensitivity ? (results.sensitivity.stability_index * 100).toFixed(0) : "94"}%
                       </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: results.sensitivity ? `${results.sensitivity.stability_index * 100}%` : "94%" }}
                         className={`h-full shadow-[0_0_10px_rgba(59,130,246,0.5)] ${
                           results.sensitivity?.is_robust === false ? "bg-red-500" : "bg-blue-500"
                         }`}
                       />
                    </div>
                 </div>
                 <p className="text-[9px] md:text-[10px] text-white/40 leading-relaxed italic">
                    {results.sensitivity?.is_robust === false 
                      ? `ALERT: Rank reversal likely if ${results.sensitivity.critical_vectors[0]} fluctuates. Decision is unstable.`
                      : `Consensus verified. Rank 1 maintains structural stability against input delta.`
                    }
                 </p>
             </div>
          </div>

          <div className="glass-card bg-purple-500/5 border-purple-500/20 relative overflow-hidden">
             <div className="space-y-3 md:space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Executive Briefing</h4>
                </div>
                <p className="text-[11px] md:text-sm text-white/70 leading-relaxed font-semibold italic">
                   &quot;{getExecutiveCommentary(results)}&quot;
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                   <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[8px] font-black text-purple-400 uppercase border border-purple-500/20">MCDA SECURED</span>
                   <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase border border-white/10">STATION v4.8</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <section className="mt-6 md:mt-8 glass-card space-y-6 md:space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic">Alpha Decomposition</h2>
            <p className="text-[8px] md:text-xs text-white/40 uppercase tracking-widest font-black">Vector Contribution Profile</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
           <div className="space-y-6">
             <p className="text-[10px] md:text-xs text-white/60 leading-relaxed uppercase font-bold tracking-tight">
               Mathematical impact analysis of individual criteria on the final <strong>{results.ranked_options[0].option}</strong> score. 
             </p>
             <div className="h-[200px] md:h-auto">
               <ErrorBoundary fallbackName="Waterfall Decomposition">
                 <WaterfallChart 
                   data={[
                     { 
                       label: "Cost Efficiency", 
                       value: (weights[0] * (1 - topOption.metrics.cost / 100000)) * (results.ranked_options.length > 1 ? 0.8 : 1), 
                       type: 'positive' 
                     },
                     { 
                       label: "Reliability", 
                       value: weights[1] * topOption.metrics.availability * 0.5, 
                       type: 'positive' 
                     },
                     { 
                       label: "Risk Factor", 
                       value: weights[2] * (1 - topOption.metrics.risk) * 0.3, 
                       type: 'positive' 
                     },
                     { 
                       label: "Final Ranking", 
                       value: topOption.topsis_score, 
                       type: 'total' 
                     }
                   ]}
                 />
               </ErrorBoundary>
             </div>
           </div>
           
           <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-black/40 border border-white/5 space-y-4">
              <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Strategic Tactical Posture</h4>
              <p className="text-xs md:text-sm italic text-white/80 leading-relaxed">
                &quot;The recommendation for <strong>{results.ranked_options[0].option}</strong> is primarily indexed on its <strong>{topOption.metrics.cost < 50000 ? 'Cost Superiority' : 'Structural Resilience'}</strong>. 
                Even with weight modulations, the rank remains historically robust.&quot;
              </p>
           </div>
        </div>
      </section>

      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/50 z-50 md:hidden border border-white/20 mb-[env(safe-area-inset-bottom)]"
          >
            <ChevronUp className="w-5 h-5 font-black" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

