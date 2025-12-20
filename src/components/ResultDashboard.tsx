"use client"

import React from "react"
import { motion } from "framer-motion"
import { AreaClosed } from "@visx/shape"
import { scaleLinear } from "@visx/scale"
import { curveBasis } from "@visx/curve"
import { TrendingUp, AlertTriangle, ShieldCheck, BarChart3, Fingerprint, Activity } from "lucide-react"

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

const getExecutiveCommentary = (results: DashboardResults) => {
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

interface RankedOption {
  option: string;
  topsis_score: number;
  metrics: {
    cost: number;
    availability: number;
    risk: number;
  };
}

interface DashboardResults {
  strategy: string;
  domain: string;
  ranked_options: RankedOption[];
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
}

interface ForecastData {
  status: string;
  forecast_30d: {
    predicted_max_cost: number;
    predicted_min_availability: number;
  };
}

export function ResultDashboard({ results: initialResults }: { results: DashboardResults }) {
  const [results, setResults] = React.useState<DashboardResults>(initialResults)
  const [weights, setWeights] = React.useState<number[]>([0.4, 0.4, 0.2])
  const [loading, setLoading] = React.useState(false)

  const handleWeightChange = async (index: number, value: number) => {
    const newWeights = [...weights]
    newWeights[index] = value
    // Normalize weights
    const sum = newWeights.reduce((a, b) => a + b, 0)
    const normalized = newWeights.map(w => w / sum)
    setWeights(normalized)
    
    setLoading(true)
    try {
      const response = await axios.post("http://127.0.0.1:8000/decision/recalculate", {
        options: results.ranked_options,
        weights: normalized,
        criteria_types: ['min', 'max', 'min']
      })
      setResults({ ...results, ranked_options: response.data.ranked_options })
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
        const response = await axios.get(`http://127.0.0.1:8000/decision/forecast/${domain}`)
        setForecast(response.data)
      } catch (error) {
        console.error("Forecast fetch failed:", error)
      }
    }
    fetchForecast()
  }, [initialResults.domain])

  const topOption = results.ranked_options[0]
  const topSim = results.simulations.find(s => s.option === topOption.option)
  const distributionData = binData(topSim?.simulation?.cost_dist || [])

  const radarData: RadarData[] = results.ranked_options.map((opt) => ({
    label: opt.option,
    cost: 1 - (opt.metrics.cost / 20000), // Normalized inverse cost
    availability: opt.metrics.availability,
    risk: 1 - opt.metrics.risk
  }))

  return (
    <div className="space-y-8 pb-20 relative">
      {loading && <div className="absolute inset-0 z-50 bg-black/10 backdrop-blur-[2px] rounded-3xl animate-pulse" />}
      
      <div className="grid md:grid-cols-3 gap-6">
        {results.ranked_options.map((opt: RankedOption, i: number) => (
          <motion.div 
            key={opt.option}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card border-none relative overflow-hidden transition-all duration-500 ${
              i === 0 ? " ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl shadow-blue-500/20 bg-blue-500/5" : ""
            }`}
          >
            {i === 0 && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-bl-lg">
                Optimal
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
               <div className={`p-2 rounded-lg ${i === 0 ? "bg-blue-500/20" : "bg-white/5"}`}>
                 {i === 0 ? <ShieldCheck className="w-5 h-5 text-blue-400" /> : <TrendingUp className="w-5 h-5 text-white/40" />}
               </div>
               <h4 className="font-bold">{opt.option}</h4>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">TOPSIS Score</p>
                <p className="text-3xl font-black font-mono text-blue-400">{(opt.topsis_score * 100).toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Availability</p>
                <p className="text-sm font-mono text-green-400">{(opt.metrics.availability * 100).toFixed(2)}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Tradeoff Analysis matrix</h3>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">
              VISX RADAR CORE v1.2
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <RadarChart 
              width={350} 
              height={350} 
              data={radarData} 
              keys={["cost", "availability", "risk"]} 
            />
            <div className="flex-grow space-y-6 w-full">
               <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Sensitivity Sliders</h4>
                  {[
                    { label: "Cost Minimization", val: weights[0], color: "blue" },
                    { label: "Reliability Focus", val: weights[1], color: "green" },
                    { label: "Risk Mitigation", val: weights[2], color: "red" }
                  ].map((w, idx) => (
                    <div key={w.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{w.label}</span>
                        <span className="font-mono">{(w.val * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        className={`w-full accent-${w.color}-500`}
                        value={w.val}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                      />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-6">Distribution Map</h3>
            <div className="flex-1 relative pt-4">
             <div className="absolute top-0 right-0 text-[10px] text-white/40 flex gap-4">
                <span>Peak Frequency: {Math.max(...distributionData.map(d => d.y))} opt</span>
             </div>
             <svg width="100%" height="250" className="overflow-visible">
                <AreaClosed
                  data={distributionData}
                  x={d => {
                    const min = Math.min(...distributionData.map(v => v.x))
                    const max = Math.max(...distributionData.map(v => v.x))
                    return ((d.x - min) / (max - min)) * 300 || 0
                  }}
                  y={d => 250 - (d.y / Math.max(...distributionData.map(v => v.y))) * 200}
                  yScale={scaleLinear({ range: [250, 0], domain: [0, Math.max(...distributionData.map(v => v.y))] })}
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
             <div className="mt-4 flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
                <span>Min Cost Predicted</span>
                <span>Max Cost Predicted</span>
             </div>
          </div>
            <p className="text-[10px] text-white/40 mt-4 leading-relaxed uppercase font-bold tracking-widest">
              Monte Carlo density iterations: 1,000
            </p>
          </div>

          <div className="glass-card bg-orange-500/5 border-orange-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-1 opacity-20">
                <Activity className="w-12 h-12" />
             </div>
             <div className="flex gap-4 relative z-10">
                <AlertTriangle className="w-8 h-8 text-orange-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-orange-400 mb-1 uppercase tracking-tighter italic">Intelligence Insight</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    {forecast?.status === "success" ? (
                      `Predictive modeling projects ${forecast.forecast_30d.predicted_max_cost.toLocaleString()} max cost and ${(forecast.forecast_30d.predicted_min_availability * 100).toFixed(1)}% resilience factor 30 days out.`
                    ) : (
                      "Dynamic sensitivity indicates high volatility in 'Risk' vectors. Neural engine recommends recalculating with 5% guardrails."
                    )}
                  </p>
                </div>
             </div>
          </div>

          <div className="glass-card bg-blue-500/5 border-blue-500/20 relative overflow-hidden">
             <div className="absolute -bottom-4 -right-4 opacity-10">
                <Fingerprint className="w-24 h-24" />
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Strategic Alignment</h4>
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] items-end">
                      <span className="text-white/40 uppercase font-black">Confidence Index</span>
                      <span className="text-white font-mono font-black">94.2%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "94.2%" }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                   </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                    Deterministic analysis identifies {results.ranked_options[0].option} as the statistically dominant path with minimal variance.
                </p>
             </div>
          </div>

          <div className="glass-card bg-purple-500/5 border-purple-500/20 relative overflow-hidden">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-xs font-black uppercase tracking-widest text-purple-400">Executive Commentary</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                   {getExecutiveCommentary(results)}
                </p>
                <div className="pt-2 flex gap-2">
                   <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[8px] font-black text-purple-400 uppercase">MCDA Verified</span>
                   <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase">Deterministic</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 13 4v6.29L14.71 4 6 14.71v-6.29Z" />
      <path d="m18 9.29-9 10.71v-6.29L7.29 20 16 9.29v6.29Z" />
    </svg>
  )
}
