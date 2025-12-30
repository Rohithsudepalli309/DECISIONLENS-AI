"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaClosed } from "@visx/shape"
import { scaleLinear } from "@visx/scale"
import { curveBasis } from "@visx/curve"
import { AlertTriangle, ShieldCheck, BarChart3, Fingerprint, Activity, Target, ChevronUp, Share2, Zap, Sparkles, AlertOctagon, ShieldAlert, Users, Briefcase, Scale, Box, Lock, FileDown, Download } from 'lucide-react'
import { StrategicManifold } from './StrategicManifold'
import { SecurityBunker } from './SecurityBunker'
import { useI18n } from '@/hooks/useI18n'
import { API_BASE_URL } from '@/lib/api-config'
import axios from "axios"

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


import { RadarChart, RadarData } from "./RadarChart"
import { ErrorBoundary } from "./ErrorBoundary"
import { WaterfallChart } from "./WaterfallChart"
import { useHaptics } from "@/hooks/useHaptics"
import { DecisionResults, useDecisionStore } from "@/store/useDecisionStore"

type RankedOption = NonNullable<DecisionResults['ranked_options']>[0];

interface PersonaEvaluation {
  top_choice: string;
  scores: Record<string, number>;
  reasoning?: string;
}

interface ForecastData {
  status: string;
  horizon_days?: number;
  forecast_projected?: {
    predicted_max_cost: number;
    predicted_min_availability: number;
  };
  forecast_30d?: { // Legacy fallback
    predicted_max_cost: number;
    predicted_min_availability: number;
  };
}

import { ParentSize } from "@visx/responsive"

export function ResultDashboard({ results: initialResults }: { results: DecisionResults }) {
  const { t } = useI18n()
  const [results, setResults] = React.useState<DecisionResults>(initialResults)
  const [weights, setWeights] = React.useState<number[]>([0.4, 0.4, 0.2])
  const [loading, setLoading] = React.useState(false)
  const haptics = useHaptics()
  const { initializeWS, formData } = useDecisionStore()

  React.useEffect(() => {
    if (formData.project_name) {
      initializeWS(formData.project_name)
    }
  }, [formData.project_name, initializeWS])

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

  const { formData: storeFormData, applyAIProposal, runChaosTest, runConsensusAudit, results: storeResults } = useDecisionStore();
  const [forecast, setForecast] = React.useState<ForecastData | null>(null)
  const [horizon, setHorizon] = React.useState(30)
  const [fetchingForecast, setFetchingForecast] = React.useState(false)
  const [intent, setIntent] = React.useState("");
  
  interface StrategicProposal {
    action_type: string;
    proposal_details: {
      reason: string;
      [key: string]: unknown;
    };
    confidence: number;
    expected_impact: string;
  }

  const [proposals, setProposals] = React.useState<StrategicProposal[]>([]);
  const [isProposing, setIsProposing] = React.useState(false);

  React.useEffect(() => {
    const fetchForecast = async () => {
      setFetchingForecast(true)
      try {
        const domain = initialResults.domain || "cloud"
        const response = await axios.get(`${API_BASE_URL}/decision/forecast/${domain}?days_ahead=${horizon}`)
        setForecast(response.data)
      } catch (error) {
        console.error("Forecast fetch failed:", error)
      } finally {
        setFetchingForecast(false)
      }
    }
    fetchForecast()
  }, [initialResults.domain, horizon])

  const [showScroll, setShowScroll] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const topOption = storeResults?.ranked_options?.[0]
  const topSim = storeResults?.simulations?.find(s => s.option === topOption?.option)
  
  const [showDetails, setShowDetails] = React.useState(false)
  const [isPresentationMode, setIsPresentationMode] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'overview' | 'simulation' | '3d'>('overview')
  const [bunkerProposal, setBunkerProposal] = React.useState<StrategicProposal | null>(null)

  const togglePresentation = () => {
    haptics.heavy()
    setIsPresentationMode(!isPresentationMode)
  }

  const distributionData = React.useMemo(() => binData(topSim?.simulation?.cost_dist || []), [topSim])

  const radarData = React.useMemo((): RadarData[] => (results.ranked_options || []).map((opt) => ({
    label: opt.option,
    cost: 1 - (opt.metrics.cost / 20000), 
    availability: opt.metrics.availability,
    risk: 1 - opt.metrics.risk
  })), [results.ranked_options])

  return (
    <div className={`space-y-6 md:space-y-8 pb-20 relative ${isPresentationMode ? "max-w-none px-4 md:px-12" : ""}`}>
      {/* Confidential Watermark Overlay */}
      {isPresentationMode && (
        <div className="fixed inset-0 pointer-events-none z-[100] grid grid-cols-2 md:grid-cols-4 select-none opacity-[0.03]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center -rotate-45 text-2xl font-black uppercase tracking-[1em] whitespace-nowrap">
              Confidential Analysis
            </div>
          ))}
        </div>
      )}

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          nav, button, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .glass-card { background: white !important; border: 1px solid #eee !important; color: black !important; box-shadow: none !important; }
          .text-white\/40, .text-white\/60 { color: #666 !important; }
          .text-blue-400, .text-green-400, .text-red-400 { color: black !important; font-weight: bold !important; }
          .shadow-2xl { box-shadow: none !important; }
          .md\:pb-0 { pb-0 !important; }
          @page { margin: 2cm; }
        }
      `}</style>

      {loading && <div className="absolute inset-x-0 -inset-y-4 z-50 bg-black/10 backdrop-blur-[2px] rounded-3xl animate-pulse" />}
      
      {/* Presentation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Strategic Deck</h2>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">Intelligence v1.5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {results.correlations && results.correlations.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Correlation Detected
            </div>
          )}
          <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full">
            Active: {results.strategy}
          </div>
          <button 
            onClick={togglePresentation}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isPresentationMode 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {isPresentationMode ? "EXIT PRESENTATION" : "ENTER PRESENTATION"}
          </button>
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 no-print">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}
             >
               2D ENGINE
             </button>
             <button 
               onClick={() => setActiveTab('3d')}
               className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all flex items-center gap-2 ${activeTab === '3d' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-white/40 hover:text-white'}`}
             >
               <Box className="w-3 h-3" />
               3D MANIFOLD
             </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Export Brief
          </button>
        </div>
      </div>
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {(results.ranked_options || []).map((opt: RankedOption, i: number) => (
          <motion.div 
            key={opt.option}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card border-none relative overflow-hidden transition-all duration-500 h-full flex flex-col ${
              isPresentationMode ? "p-8 md:p-12 min-h-[300px] justify-center" : "p-5 md:p-6 min-h-[160px]"
            } ${
              i === 0 ? " ring-2 ring-blue-500/50 xl:scale-[1.02] shadow-2xl shadow-blue-500/20 bg-blue-500/5" : ""
            }`}
          >
            {i === 0 && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-bl-lg">
                Recommended Choice
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
               <div className={`p-2 rounded-lg ${i === 0 ? "bg-blue-500/20" : "bg-white/5"}`}>
                 {i === 0 ? <ShieldCheck className="w-5 h-5 text-blue-400" /> : <Activity className="w-5 h-5 text-white/40" />}
               </div>
               <h4 className="font-bold text-sm md:text-base">{opt.option}</h4>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-tighter">Strategic Fit</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl md:text-3xl font-black font-mono text-blue-400">{(opt.topsis_score * 100).toFixed(0)}</p>
                  <span className="text-xs font-bold text-blue-500/50">%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-tighter">Confidence</p>
                <p className="text-xs md:text-sm font-mono text-green-400">{(opt.metrics.availability * 100).toFixed(0)}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={() => {
              const firstOption = results.ranked_options?.[0];
              navigator.share({
                title: `DecisionLens: ${firstOption?.option || 'Decision Analysis'}`,
                text: `Strategic Analysis recommends ${firstOption?.option || 'an option'} with ${( (firstOption?.topsis_score || 0) * 100).toFixed(0)}% fit.`,
                url: window.location.href
              }).catch(console.error)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-bold uppercase tracking-widest transition-colors"
          >
             <Share2 className="w-4 h-4" />
             Share Briefing
          </button>
        )}

        {results.id && (
          <>
            <button
              onClick={() => window.open(`${API_BASE_URL}/decision/export/${results.id || 'latest'}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold uppercase tracking-widest transition-colors"
            >
               <FileDown className="w-4 h-4" />
               {t('export_pdf')}
            </button>
            <button
              onClick={() => window.open(`${API_BASE_URL}/decision/export/csv/${results.id}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold uppercase tracking-widest transition-colors"
            >
               <Download className="w-4 h-4" />
               {t('export_csv')}
            </button>
          </>
        )}

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-colors"
        >
           {showDetails ? t('hide_details') : t('deep_dive')}
           <ChevronUp className={`w-4 h-4 transition-transform ${showDetails ? "" : "rotate-180"}`} />
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 md:space-y-8 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="glass-card lg:col-span-2 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                  <h3 className="text-base md:text-lg font-bold italic uppercase tracking-tighter">{t('tradeoff_matrix')}</h3>
                  <div className="w-fit text-[8px] md:text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-widest">
                    Multi-Vector Analysis
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
          <div className="glass-card p-4 md:p-6 h-full">
            <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter mb-6 underline decoration-blue-500/40">Density Distribution</h3>
            <div className="h-[220px] md:h-[280px] relative pt-4">
              <div className="absolute top-0 right-0 text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-widest">
                Peak: {Math.max(...distributionData.map(d => d.y))} iterations
              </div>
              <ErrorBoundary fallbackName="Distribution Map">
                <ParentSize>
                  {({ width, height }) => (
                    <svg width={width} height={height} className="overflow-visible">
                      <AreaClosed
                        data={distributionData}
                        x={(d: { x: number; y: number }) => {
                          const min = Math.min(...distributionData.map(v => v.x))
                          const max = Math.max(...distributionData.map(v => v.x))
                          return ((d.x - min) / (max - min)) * width || 0
                        }}
                        y={(d: { x: number; y: number }) => height - (d.y / Math.max(...distributionData.map(v => v.y))) * (height * 0.8)}
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
             {/* Chronos Pattern Background */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="flex flex-wrap gap-4 -rotate-12 scale-150">
                   {Array.from({ length: 40 }).map((_, i) => (
                      <span key={i} className="text-4xl font-black">{i * 30}d</span>
                   ))}
                </div>
             </div>
             
             <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Activity className={`w-5 h-5 text-orange-500 ${fetchingForecast ? 'animate-spin' : 'animate-pulse'}`} />
                   </div>
                   <div>
                      <h4 className="font-black text-orange-500 uppercase tracking-tighter italic text-xs md:text-sm">Neural Predictive Insight</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Strategic Drift Projection</p>
                   </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                   <p className="text-[10px] md:text-xs text-white/80 leading-relaxed font-medium">
                     {forecast?.status === "success" ? (
                       <span className="flex flex-col gap-1">
                          <span className="text-white font-black italic">
                             {horizon}D Projected Ceiling: {formatIndianCurrency(forecast.forecast_projected?.predicted_max_cost || 0)}
                          </span>
                          <span className="text-[10px] opacity-60">
                             Resilience factor estimated at {((forecast.forecast_projected?.predicted_min_availability || 0) * 100).toFixed(1)}% at T+{horizon} days.
                          </span>
                       </span>
                     ) : (
                       "Calculating drift vectors based on historical sector volatility..."
                     )}
                   </p>
                </div>

                {/* Chronos-Axis Slider */}
                <div className="space-y-3 pt-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black uppercase text-orange-500/60 tracking-widest italic">Chronos-Axis</span>
                      <span className="text-[10px] font-mono text-white font-bold">{horizon} Days Out</span>
                   </div>
                   <div className="relative h-6 flex items-center">
                      <input 
                         type="range"
                         min="30"
                         max="730"
                         step="30"
                         value={horizon}
                         onChange={(e) => {
                            haptics.light();
                            setHorizon(parseInt(e.target.value));
                         }}
                         className="w-full h-1.5 bg-orange-500/20 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                      />
                      {/* Gradient track background */}
                      <div className="absolute h-1.5 bg-gradient-to-r from-orange-500/10 to-orange-500/60 rounded-full pointer-events-none" style={{ width: `${((horizon - 30) / 700) * 100}%` }} />
                   </div>
                   <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                      <span>1 Month</span>
                      <span>1 Year</span>
                      <span>2 Years</span>
                   </div>
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
                         {results.ranked_options?.[0].option} Projections {results.sensitivity ? (results.sensitivity.stability_index * 100).toFixed(0) : "94"}%
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
                      ? `ALERT: Rank reversal likely if ${results.sensitivity.critical_vectors?.[0]} fluctuates. Decision is unstable.`
                      : `Consensus verified. Rank 1 maintains structural stability against input delta.`
                    }
                 </p>
             </div>
          </div>

          {results.correlations && results.correlations.length > 0 && (
             <div className="glass-card bg-orange-500/5 border-orange-500/20 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Correlation Audit</h4>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="space-y-3">
                    {results.correlations.map((corr, idx) => (
                      <div key={idx} className="p-2 rounded bg-white/5 border border-white/5 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-white/80">
                          <span>{corr.pair[0]} ↔ {corr.pair[1]}</span>
                          <span className={corr.risk === "High" ? "text-red-400" : "text-orange-400"}>
                            {(corr.coefficient * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-0.5 bg-white/10 rounded-full">
                          <div 
                            className={`h-full ${corr.risk === "High" ? "bg-red-500" : "bg-orange-500"}`}
                            style={{ width: `${Math.abs(corr.coefficient) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          )}

          {/* Strategic Resilience - Chaos Report */}
          <div className="glass-card bg-orange-500/5 border-orange-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <button 
                  onClick={() => runChaosTest(API_BASE_URL)}
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 p-2 rounded-full border border-orange-500/20 transition-all"
                 >
                   <AlertOctagon className="w-4 h-4 animate-pulse" />
                 </button>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3 text-orange-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Strategic Resilience Analysis</h4>
                 </div>
                 
                 {storeResults?.chaos_report ? (
                   <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                      <div className="flex items-end justify-between mb-2">
                         <div>
                            <p className="text-[8px] font-black text-white/40 uppercase">Worst Case Shift</p>
                            <p className="text-sm font-black text-white">{storeResults.chaos_report.stressed_top_option}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-white/40 uppercase">Fragility Score</p>
                            <p className={`text-sm font-black ${storeResults.chaos_report.is_strategic_trap ? 'text-red-500' : 'text-orange-400'}`}>
                               {(storeResults.chaos_report.fragility_score * 100).toFixed(0)}%
                            </p>
                         </div>
                      </div>
                      
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${storeResults.chaos_report.is_strategic_trap ? 'bg-red-500' : 'bg-orange-500'}`}
                           style={{ width: `${storeResults.chaos_report.fragility_score * 100}%` }}
                         />
                      </div>

                      {(storeResults.chaos_report && storeResults.ranked_options && storeResults.ranked_options[0]) ? (
                         <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                            <p className="text-[9px] text-red-400 font-bold uppercase leading-tight">
                               STRATEGIC TRAP DETECTED: This recommendation collapses under high variance. Consider pivoting constraints.
                            </p>
                         </div>
                      ) : null}
                   </div>
                 ) : (
                   <p className="text-[10px] text-white/40 italic">Run Chaos Monkey stress test to identify black-swan failure points.</p>
                 )}
              </div>
          </div>

          {/* Virtual Boardroom - Multi-Agent Consensus */}
          <div className="glass-card bg-purple-500/5 border-purple-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <button 
                  onClick={() => runConsensusAudit(API_BASE_URL)}
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-2 rounded-full border border-purple-500/20 transition-all"
                 >
                   <Users className="w-4 h-4" />
                 </button>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Scale className="w-3 h-3 text-purple-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Multi-Agent Consensus Index</h4>
                 </div>

                 {storeResults?.consensus_report ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                       <div className="flex items-center justify-between mb-4">
                          <div>
                             <p className="text-[8px] font-black text-white/40 uppercase">Consensus Score</p>
                             <p className="text-xl font-black text-white">{(storeResults.consensus_report.consensus_score * 100).toFixed(0)}%</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${storeResults.consensus_report.is_polarized ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                             {storeResults.consensus_report.is_polarized ? 'Polarized' : 'Unified'}
                          </div>
                       </div>

                       <div className="flex gap-4 mb-4">
                          {Object.entries(storeResults.consensus_report.persona_evaluations || {}).map(([role, evalData]) => {
                             const data = evalData as PersonaEvaluation;
                             return (
                                <div key={role} className="flex-1 text-center p-2 rounded bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group/persona">
                                   <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                      {role === 'CFO' && <Briefcase className="w-4 h-4" />}
                                      {role === 'CTO' && <Zap className="w-4 h-4" />}
                                      {role === 'RiskOfficer' && <ShieldCheck className="w-4 h-4" />}
                                   </div>
                                   <p className="text-[8px] font-black text-white/60 mb-1">{role}</p>
                                   <p className="text-[7px] text-white/40 truncate mb-2">{data.top_choice}</p>
                                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-purple-500" 
                                        style={{ width: `${((data.scores?.[data.top_choice] || 0) * 100)}%` }}
                                      />
                                   </div>
                                </div>
                             );
                          })}
                       </div>

                       {storeResults.consensus_report.is_polarized ? (
                          <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                             <p className="text-[8px] text-red-400 leading-tight">
                                <span className="font-black uppercase">STAKEHOLDER CONFLICT:</span> The CFO and CTO models have divergent top choices. This strategy requires manual mediation.
                             </p>
                          </div>
                       ) : null}
                    </div>
                 ) : (
                    <p className="text-[10px] text-white/40 italic">Audit strategy against Virtual CFO, CTO, and Risk personas.</p>
                 )}
              </div>
          </div>

          {/* Visualization Switcher */}
          <div className="md:col-span-4 transition-all duration-500">
             {activeTab === '3d' ? (
                <StrategicManifold data={radarData} />
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card bg-blue-500/5 border-blue-500/20">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Radar Strategy Map</h4>
                       <div className="h-[300px]">
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
                       </div>
                    </div>
                    <div className="glass-card bg-emerald-500/5 border-emerald-500/20">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Monte Carlo Distributions</h4>
                       <div className="h-[300px] relative">
                          <ParentSize>
                            {({ width, height }) => (
                              <svg width={width} height={height} className="overflow-visible">
                                <AreaClosed
                                  data={distributionData}
                                  x={(d: { x: number; y: number }) => {
                                    const min = Math.min(...distributionData.map(v => v.x))
                                    const max = Math.max(...distributionData.map(v => v.x))
                                    return ((d.x - min) / (max - min)) * width || 0
                                  }}
                                  y={(d: { x: number; y: number }) => height - (d.y / Math.max(...distributionData.map(v => v.y))) * (height * 0.8)}
                                  yScale={scaleLinear({ range: [height, 0], domain: [0, Math.max(...distributionData.map(v => v.y))] })}
                                  fill="url(#area-gradient-switcher)"
                                  curve={curveBasis}
                                />
                                <defs>
                                  <linearGradient id="area-gradient-switcher" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                              </svg>
                            )}
                          </ParentSize>
                       </div>
                    </div>
                </div>
             )}
          </div>

           <div className="glass-card bg-purple-500/5 border-purple-500/20 relative overflow-hidden group">
              {/* Pulsing Neural Aura */}
              <div className="absolute -inset-24 bg-purple-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse" />
              
              <div className="space-y-3 md:space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Actionable Strategic Oracle</h4>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black tracking-tighter text-white">
                       {storeResults?.strategy || "Strategy Alpha"}
                    </h1>
                    <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                       <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{storeResults?.domain || "General"}</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <textarea 
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="Enter strategic intent (e.g. 'Prioritize cost efficiency over performance')..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all min-h-[60px] resize-none"
                    />
                    <button 
                      onClick={async () => {
                        if (!intent.trim()) return;
                        setIsProposing(true);
                        try {
                          const res = await axios.post(`${API_BASE_URL}/decision/agent/propose`, {
                            intent,
                            current_state: {
                              weights: storeFormData.weights,
                              constraints: storeFormData.constraints,
                              domain: storeFormData.domain
                            }
                          });
                          setProposals(res.data.proposals);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsProposing(false);
                        }
                      }}
                      disabled={isProposing}
                      className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                    >
                      {isProposing ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-3 h-3 group-hover:scale-125 transition-transform" />
                          Initialize Strategic Pivot
                        </>
                      )}
                    </button>
                 </div>

                 {proposals.length > 0 && (
                   <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h5 className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Live Proposals</h5>
                      {proposals.map((p, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/5 border border-purple-500/30 space-y-2 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-1">
                              <span className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                 {Math.round(p.confidence * 100)}% Match
                              </span>
                           </div>
                           <h6 className="text-[10px] font-black text-white uppercase">{p.action_type.replace('_', ' ')}</h6>
                           <p className="text-[10px] text-white/60 leading-tight">{p.proposal_details.reason || p.expected_impact}</p>
                           <button
                             onClick={() => {
                               haptics.success();
                               setBunkerProposal(p);
                             }}
                             className="w-full py-1.5 rounded bg-purple-600/20 hover:bg-purple-600/40 text-[9px] font-bold text-white uppercase transition-all flex items-center justify-center gap-2 group"
                           >
                              <Lock className="w-3 h-3 group-hover:scale-110 transition-transform" />
                              Authorize Secure Execution
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>

        <AnimatePresence>
          {bunkerProposal && (
            <SecurityBunker 
              proposal={bunkerProposal}
              onExecute={() => {
                applyAIProposal(bunkerProposal!);
                setBunkerProposal(null);
                // Assuming showToast is defined elsewhere or needs to be added
                // showToast("AI Strategic Proposal Executed & Logged", "success");
                setProposals([]);
                setIntent("");
              }}
              onCancel={() => setBunkerProposal(null)}
            />
          )}
        </AnimatePresence>
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
               Mathematical impact analysis of individual criteria on the final <strong>{results.ranked_options?.[0]?.option || 'selected'}</strong> score. 
             </p>
             <div className="h-[200px] md:h-auto">
               <ErrorBoundary fallbackName="Waterfall Decomposition">
                 <WaterfallChart 
                   data={[
                     { 
                       label: "Cost Efficiency", 
                       value: (weights[0] * (1 - (topOption?.metrics?.cost || 0) / 100000)) * ((results.ranked_options?.length || 0) > 1 ? 0.8 : 1), 
                       type: 'positive' 
                     },
                     { 
                       label: "Reliability", 
                       value: weights[1] * (topOption?.metrics?.availability || 0) * 0.5, 
                       type: 'positive' 
                     },
                     { 
                       label: "Risk Factor", 
                       value: weights[2] * (1 - (topOption?.metrics?.risk || 0)) * 0.3, 
                       type: 'positive' 
                     },
                     { 
                       label: "Final Ranking", 
                       value: topOption?.topsis_score || 0, 
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
                &quot;The recommendation for <strong>{results.ranked_options?.[0]?.option || 'selected'}</strong> is primarily indexed on its <strong>{(topOption?.metrics?.cost || 0) < 50000 ? 'Cost Superiority' : 'Structural Resilience'}</strong>. 
                Even with weight modulations, the rank remains historically robust.&quot;
              </p>
           </div>
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>

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

