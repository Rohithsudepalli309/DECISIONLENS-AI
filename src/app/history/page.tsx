"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import axios from "axios"
import { useAuthStore } from "@/store/useAuthStore"
import { useDecisionStore } from "@/store/useDecisionStore"
import { useHistoryStore, AuditItem } from "@/store/useHistoryStore"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/api-config"
import { Skeleton } from "@/components/Skeleton"
import { Toast, ToastType } from "@/components/Toast"
import { DecisionData, DecisionResults } from "@/types/decision"
import { SwipeableAuditCard } from "@/components/SwipeableAuditCard"
import { ForesightAudit } from "@/components/ForesightAudit"
import { BacktestingDashboard } from "@/components/BacktestingDashboard"
import { Calendar, Tag, Target, Search, Filter, Play, Download, Trash2, Edit3, FileSpreadsheet, Copy, ArrowRight, RefreshCw } from "lucide-react"

export default function AuditHistory() {
  const { isLoggedIn, hasHydrated: authHydrated } = useAuthStore()
  const { setFormData, setResults, setView, hasHydrated: decisionHydrated } = useDecisionStore()
  
  // Offline-First History Store
  const { audits, fetchHistory, isLoading: isSyncing, setAudits, hasHydrated: historyHydrated, recordRealizedData } = useHistoryStore()
  
  const router = useRouter()
  
  const [search, setSearch] = useState("")
  const [filterDomain, setFilterDomain] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [activeTab, setActiveTab] = useState<'archive' | 'foresight'>('archive')
  
  const [isRealizing, setIsRealizing] = useState<number | null>(null)
  const [realizedForm, setRealizedForm] = useState({ cost: 0, availability: 0, risk: 0 })
  
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Pull to Refresh State
  const [isPulling, setIsPulling] = useState(false)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, authHydrated, router])

  const restoreActivity = (audit: AuditItem) => {
    // 1. Reconstruct DecisionData
    const decisionData: DecisionData = {
      domain: audit.domain,
      goal: audit.goal,
      constraints: audit.constraints || { max_cost: 50000, min_availability: 0.95 },
      preferences: audit.preferences || ["cost", "reliability"],
      options: audit.options || [],
      weights: audit.weights || [0.4, 0.4, 0.2]
    }

    setFormData(decisionData)
    
    // 2. Load results if they exist (formatted for store)
    if (audit.simulation_results) {
       setResults({
         strategy: audit.strategy || "TOPSIS",
         domain: audit.domain,
         ranked_options: audit.simulation_results.map(r => ({
           option: r.option,
           topsis_score: r.score,
           metrics: r.metrics
         })),
         simulations: audit.simulation_results.map(r => ({
           option: r.option,
           simulation: r.simulation
         })),
         sensitivity: audit.sensitivity,
         disclaimer: "Enterprise Intelligence Core. Restored from Historical Archives."
       } as DecisionResults)
       setView("results")
    } else {
       setView("stepper")
    }
    
    showToast("Session restored to interactive dashboard", "success")
    setTimeout(() => router.push("/"), 500)
  }

  const forkScenario = (audit: AuditItem) => {
    // Forking is like restoring but we clear the results to force a new simulation
    const decisionData: DecisionData = {
      domain: audit.domain,
      goal: `${audit.goal} (Forked)`,
      constraints: audit.constraints || { max_cost: 50000, min_availability: 0.95 },
      preferences: audit.preferences || ["cost", "reliability"],
      options: audit.options || [],
      weights: audit.weights || [0.4, 0.4, 0.2]
    }

    setFormData(decisionData)
    setResults(null)
    setView("stepper")
    
    showToast("Scenario Forked: Parameters Loaded", "info")
    setTimeout(() => router.push("/"), 500)
  }

  const deleteAudit = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm("Are you sure you want to purge this audit from the station archives?")) return
    
    // Optimistic Update
    const previousAudits = audits
    setAudits(audits.filter(a => a.id !== id))

    try {
      const token = useAuthStore.getState().token
      await axios.delete(`${API_BASE_URL}/decision/audit/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast("Audit Purged Successfully", "success")
    } catch (err) {
      console.error("Delete failed", err)
      // Rollback
      setAudits(previousAudits)
      showToast("Purge Protocol Failed", "error")
    }
  }

  const renameAudit = async (id: number, currentGoal: string) => {
    const newGoal = prompt("Enter new goal description:", currentGoal)
    if (!newGoal || newGoal === currentGoal) return

    // Optimistic Update
    const previousAudits = audits
    setAudits(audits.map(a => a.id === id ? { ...a, goal: newGoal } : a))

    try {
      const token = useAuthStore.getState().token
      await axios.patch(`${API_BASE_URL}/decision/audit/${id}`, { goal: newGoal }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast("Metadata Synchronized", "success")
    } catch (err) {
      console.error("Rename failed", err)
      setAudits(previousAudits) // Rollback
      showToast("Sync Failed", "error")
    }
  }

  const exportCSV = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation()
    window.open(`${API_BASE_URL}/decision/export/csv/${id}`, '_blank')
    showToast("Raw Data Exported (CSV)", "info")
  }

  const exportPDF = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation()
    window.open(`${API_BASE_URL}/decision/export/${id}`, '_blank')
    showToast("Executive Report generated", "info")
  }

    useEffect(() => {
    if (!isLoggedIn || !authHydrated || !decisionHydrated || !historyHydrated) return
    
    // Initial fetch (Stale-while-revalidate)
    fetchHistory().catch(err => console.error("History sync failed", err))
    
    // Auto-refresh every 60s
    const interval = setInterval(() => fetchHistory(), 60000)
    return () => clearInterval(interval)
  }, [isLoggedIn, authHydrated, decisionHydrated, historyHydrated, fetchHistory])

  if (!authHydrated || !decisionHydrated || !historyHydrated || !isLoggedIn) return null

  const filteredAudits = audits.filter((item: AuditItem) => {
    const matchesSearch = item.goal.toLowerCase().includes(search.toLowerCase()) || 
                          item.recommended_option.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !filterDomain || item.domain === filterDomain
    const matchesProject = !selectedProject || (item.project_name || "General") === selectedProject
    return matchesSearch && matchesFilter && matchesProject
  })

  const uniqueProjects = Array.from(new Set(audits.map(a => a.project_name || "General")))

  const domains = Array.from(new Set(audits.map((a: AuditItem) => a.domain)))

  const toggleSelection = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-2)
    )
  }

  const selectedAudits = audits.filter(a => selectedIds.includes(a.id))
  
  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { y: number } }) => {
    if (window.scrollY === 0 && info.offset.y > 20) {
      setIsPulling(true)
    } else {
      setIsPulling(false)
    }
  }

  const handlePanEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { y: number } }) => {
    if (window.scrollY === 0 && info.offset.y > 100) {
      if (navigator.vibrate) navigator.vibrate(50)
      showToast("Syncing Intelligence...", "info")
      await fetchHistory()
      showToast("Sync Complete", "success")
    }
    setIsPulling(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-blue-500/30 overflow-hidden">
      <Navbar />
      
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handlePanEnd}
        className="container mx-auto px-4 pt-24 md:pt-32 flex flex-col lg:flex-row gap-8 pb-20 min-h-screen"
      >
        {/* Pull Indicator */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center opacity-50 pointer-events-none">
           <RefreshCw className={`w-6 h-6 text-blue-400 ${isPulling ? 'animate-spin' : ''}`} />
        </div>
        {/* Workspace Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-32 self-start h-[calc(100vh-8rem)]">
             <div>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 px-2">Workspaces</h3>
                <div className="space-y-1">
                   <button 
                     onClick={() => setSelectedProject(null)}
                     className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${!selectedProject ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                   >
                     <span>All Projects</span>
                     <span className="opacity-60">{audits.length}</span>
                   </button>
                   {uniqueProjects.map(p => (
                     <button 
                       key={p}
                       onClick={() => setSelectedProject(p)}
                       className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${selectedProject === p ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                     >
                       <span>{p}</span>
                       <span className="opacity-60">{audits.filter(a => (a.project_name || "General") === p).length}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative z-10">
                   <h4 className="text-white font-bold text-sm mb-1">Enterprise Tier</h4>
                   <p className="text-[10px] text-white/60 mb-3">Unlimited workspaces enabled.</p>
                   <button className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                      Manage Team
                   </button>
                </div>
             </div>
        </div>

        <div className="flex-1 min-w-0">
          
          {/* Mobile/Tablet Workspace Selector (Horizontal Scroll) */}
          <div className="lg:hidden mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex gap-3">
             <button 
               onClick={() => setSelectedProject(null)}
               className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                 !selectedProject 
                   ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                   : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
               }`}
             >
               All Projects ({audits.length})
             </button>
             {uniqueProjects.map(p => (
               <button 
                 key={p}
                 onClick={() => setSelectedProject(p)}
                 className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                   selectedProject === p 
                     ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                     : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                 }`}
               >
                 {p} ({audits.filter(a => (a.project_name || "General") === p).length})
               </button>
             ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
            <div className="md:border-l-4 md:border-blue-600 md:pl-6">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Intelligence Station</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex gap-4">
                 <button 
                  onClick={() => setActiveTab('archive')}
                  className={`text-[10px] md:text-xs uppercase font-black tracking-widest transition-all ${activeTab === 'archive' ? 'text-white border-b-2 border-blue-500 pb-1' : 'text-white/40 hover:text-white/60'}`}
                 >
                    Audit Archive
                 </button>
                 <button 
                  onClick={() => setActiveTab('foresight')}
                  className={`text-[10px] md:text-xs uppercase font-black tracking-widest transition-all ${activeTab === 'foresight' ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-white/40 hover:text-white/60'}`}
                 >
                    Foresight Dashboard
                 </button>
              </div>
              {isSyncing && (
                 <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase animate-pulse">
                   <RefreshCw className="w-3 h-3 animate-spin" />
                   Syncing
                 </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             {activeTab === 'archive' && (
                <>
                   <div className="relative flex-grow md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-white/20" />
                      <input 
                        className="w-full glass-input pl-10 h-10 md:h-12 text-[10px] md:text-xs font-black uppercase tracking-widest" 
                        placeholder="Filter targets..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                   </div>
                   <div className="relative group/filter">
                      <button className="glass-card !p-0 h-10 md:h-12 w-10 md:w-12 flex items-center justify-center hover:bg-blue-500/10 border-white/10 transition-all">
                         <Filter className="w-4 h-4 text-white/40" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 glass-card !p-2 opacity-0 group-hover/filter:opacity-100 pointer-events-none group-hover/filter:pointer-events-auto transition-all z-20">
                         <button 
                          onClick={() => setFilterDomain(null)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 ${!filterDomain ? 'text-blue-400' : 'text-white/40'}`}
                         >
                           System-wide
                         </button>
                         {domains.map((d: string) => (
                           <button 
                            key={d}
                            onClick={() => setFilterDomain(d)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 ${filterDomain === d ? 'text-blue-400' : 'text-white/40'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                   </div>
                </>
             )}
          </div>
        </div>

        {activeTab === 'archive' ? (
           <>
        {audits.length === 0 && isSyncing ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="glass-card p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-6 flex-grow">
                  <Skeleton width="48px" height="48px" borderRadius="12px" />
                  <div className="space-y-2 flex-grow max-w-md">
                    <Skeleton width="60%" height="20px" />
                    <div className="flex gap-2">
                       <Skeleton width="80px" height="16px" />
                       <Skeleton width="100px" height="16px" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton width="120px" height="40px" borderRadius="12px" />
                  <Skeleton width="120px" height="40px" borderRadius="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAudits.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6 glass-card border-dashed border-white/5"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold italic uppercase tracking-widest text-white/60">No Intelligence Found</h3>
              <p className="text-sm text-white/20 max-w-xs mx-auto">
                No archived audits match your current filter or search criteria.
              </p>
            </div>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear Research Filters
              </button>
            )}
          </motion.div>
        ) : isComparing ? (
          <div className="flex flex-col gap-6 md:gap-8">
            <button 
              onClick={() => setIsComparing(false)}
              className="w-fit text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-all"
            >
              ← System Archive
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {selectedAudits.map(audit => (
                <div key={audit.id} className="glass-card !bg-white/5 border-white/10 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-900/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white/90 line-clamp-1 italic">{audit.goal}</h3>
                        <button onClick={() => renameAudit(audit.id, audit.goal)} className="text-white/20 hover:text-white/60 p-1">
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{audit.domain}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] md:text-[10px] text-blue-400 font-black uppercase mb-2 tracking-widest">Recommended Variant</p>
                          <p className="text-base md:text-xl font-black uppercase italic tracking-tighter">{audit.recommended_option}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] md:text-[10px] text-white/40 font-black uppercase mb-1">Confidence</p>
                          <p className="text-xl md:text-2xl font-black font-mono text-white">{(audit.score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                     {/* Foresight Section */}
                    <div className="glass-card !bg-white/5 border-dashed border-white/10 !p-4">
                       {audit.backtest_report ? (
                          <ForesightAudit 
                            report={audit.backtest_report} 
                            strategy={audit.goal} 
                          />
                       ) : (
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                             <div>
                                <p className="text-[10px] font-black uppercase text-white/40 mb-1">Strategic Foresight Pending</p>
                                <p className="text-[9px] text-white/20 uppercase font-medium">Inject actual outcomes to audit AI accuracy.</p>
                             </div>
                             <button 
                               onClick={() => setIsRealizing(audit.id)}
                               className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                             >
                                Record Reality
                             </button>
                          </div>
                       )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="glass-card !bg-white/[0.02] border-white/5 !p-4">
                        <p className="text-[8px] md:text-[10px] text-white/40 font-black uppercase mb-4 tracking-widest">Environmental Specs</p>
                        <div className="space-y-2">
                          {Object.entries(audit.constraints || {}).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold uppercase">{key.replace('_', ' ')}</span>
                              <span className="font-mono font-black text-white/60">
                                {key.includes('cost') ? 
                                  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val)) : 
                                  String(val)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-card !bg-white/[0.02] border-white/5 !p-4 flex flex-col justify-center">
                        <p className="text-[8px] md:text-[10px] text-white/40 font-black uppercase mb-3 tracking-widest">Engine Protocol</p>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                           <span className="text-xs font-black italic">{audit.strategy || "TOPSIS v4.8"}</span>
                        </div>
                        <p className="text-[10px] text-white/20 font-medium italic">Deterministic cross-entropy verification active.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAudits.map((item: AuditItem) => (
              <SwipeableAuditCard 
                key={item.id} 
                onDelete={() => deleteAudit(item.id)}
                onFork={() => forkScenario(item)}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id].slice(-2))}
                  className={`glass-card p-4 md:p-6 group hover:translate-x-1 transition-all cursor-pointer border-l-4 ${
                    selectedIds.includes(item.id) ? "border-l-blue-600 bg-blue-600/5 ring-1 ring-blue-500/20" : "border-l-white/10 hover:border-l-blue-600/50"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-6 flex-grow min-w-0">
                      <div 
                        onClick={(e) => toggleSelection(e, item.id)}
                        className={`hidden sm:flex w-6 h-6 rounded border items-center justify-center transition-all flex-shrink-0 ${
                          selectedIds.includes(item.id) ? "bg-blue-600 border-blue-400" : "bg-white/5 border-white/10 group-hover:border-white/20"
                        }`}
                      >
                         {selectedIds.includes(item.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10 flex-shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white/90 text-sm md:text-base mb-1 truncate italic tracking-tight">{item.goal}</h3>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                          <span className="text-[8px] md:text-[10px] uppercase font-black text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            <Tag className="w-3 h-3 text-blue-400/60" /> {item.domain}
                          </span>
                          <span className="text-[8px] md:text-[10px] uppercase font-black text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            <Calendar className="w-3 h-3 text-purple-400/60" /> {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12 w-full md:w-auto">
                      <div className="flex justify-between w-full sm:w-auto gap-8 border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[8px] md:text-[10px] uppercase font-black text-white/20 mb-1 tracking-widest">Winning Variant</p>
                          <p className="font-black text-blue-400 uppercase tracking-tighter italic text-xs md:text-sm">{item.recommended_option}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] md:text-[10px] uppercase font-black text-white/20 mb-1 tracking-widest">Score</p>
                          <p className="font-mono text-base md:text-xl font-black text-white">{(item.score * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={(e) => exportPDF(e, item.id)}
                          className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 text-white/20 border border-white/10 hover:bg-white/10 hover:text-white transition-all items-center justify-center p-0"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => exportCSV(e, item.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-white/20 border border-white/10 hover:bg-green-500/10 hover:text-green-400 transition-all flex items-center justify-center p-0"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => deleteAudit(item.id, e)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-white/20 border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center p-0"
                          title="Purge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            forkScenario(item)
                          }}
                          className="flex-grow sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Fork</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            restoreActivity(item)
                          }}
                          className="flex-grow sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Restore</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwipeableAuditCard>
            ))}
          </div>
        )}
           </>
        ) : (
           <BacktestingDashboard />
        )}

        {selectedIds.length === 2 && !isComparing && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 md:bottom-8 left-4 md:left-1/2 right-4 md:right-auto md:-translate-x-1/2 z-50 p-4 md:p-6 glass-card bg-blue-600/95 border-blue-400 shadow-2xl flex flex-col sm:flex-row items-center gap-4 md:gap-8 backdrop-blur-2xl ring-2 ring-blue-400/50"
          >
            <div className="flex gap-2">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs md:text-base border border-white/20">1</div>
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs md:text-base border border-white/20">2</div>
            </div>
            <div className="text-center sm:text-left">
               <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">Compare Realities</p>
               <p className="text-[9px] md:text-[10px] text-white/60 font-medium uppercase mt-0.5">Dual-Variant Strategic correlation analysis ready</p>
            </div>
            <button 
              onClick={() => setIsComparing(true)}
              className="w-full sm:w-auto bg-white text-blue-900 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
            >
              Initialize Analyze
            </button>
          </motion.div>
        )}

        {showBackToTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full glass bg-blue-600 text-white shadow-2xl flex items-center justify-center z-[60] border-blue-400/50 mb-[env(safe-area-inset-bottom)]"
          >
            <ArrowRight className="w-6 h-6 -rotate-90" />
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {isRealizing && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full max-w-md glass-card bg-[#0a0a0a] border-white/10 p-6 space-y-6"
             >
                <div>
                   <h3 className="text-lg font-black uppercase italic text-white">Reality Sync</h3>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Manual ingestion of actual outcomes</p>
                </div>
                
                <div className="space-y-4">
                   {['cost', 'availability', 'risk'].map(metric => (
                      <div key={metric} className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/40">{metric}</span>
                            <span className="text-blue-400">{realizedForm[metric as keyof typeof realizedForm]}</span>
                         </div>
                         <input 
                           type="range"
                           min={metric === 'availability' ? 0.8 : 0}
                           max={metric === 'availability' ? 1.0 : 100}
                           step={metric === 'availability' ? 0.01 : 1}
                           value={realizedForm[metric as keyof typeof realizedForm]}
                           onChange={(e) => setRealizedForm({...realizedForm, [metric]: parseFloat(e.target.value)})}
                           className="w-full h-1 bg-white/10 rounded-full appearance-none accent-blue-500"
                         />
                      </div>
                   ))}
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsRealizing(null)}
                     className="flex-1 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                      Abort
                   </button>
                   <button 
                     onClick={() => {
                        recordRealizedData(isRealizing, realizedForm).then(() => {
                           setIsRealizing(null);
                           showToast("Reality Synchronized", "success");
                        });
                     }}
                     className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                   >
                      Commit Reality
                   </button>
                </div>
             </motion.div>
          </div>
        )}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  )
}
